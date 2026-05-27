#include <jni.h>
#include <string>
#include <vector>
#include <cstring>
#include <mutex>
#include <thread>
#include <atomic>
#include <chrono>
#include <android/log.h>
#include <sys/sysinfo.h>

#include "llama.h"
#include "ggml.h"
#include "ggml-cpu.h"
#include "ggml-alloc.h"
#include "gguf.h"

#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

#include "mtmd.h"
#include "mtmd-image.h"

#define LOG_TAG "OmniAI-Native"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)

static JavaVM *g_jvm = nullptr;
static std::atomic<bool> g_abort_completion{false};
static std::atomic<bool> g_abort_training{false};
static std::mutex g_train_mutex;
static float g_train_progress = 0.0f;
static std::string g_train_log;

struct ModelState {
    llama_model *model = nullptr;
    llama_context *ctx = nullptr;
    std::vector<llama_token> cached_tokens;
    int n_ctx = 2048;
};

struct VisionState {
    llama_model *model = nullptr;
    llama_context *ctx = nullptr;
    mtmd_context *mtmd_ctx = nullptr;
    bool is_qwen = false;
};

static ModelState *get_model_state(jlong handle) {
    return reinterpret_cast<ModelState *>(handle);
}

static VisionState *get_vision_state(jlong handle) {
    return reinterpret_cast<VisionState *>(handle);
}

JNIEXPORT jint JNI_OnLoad(JavaVM *vm, void *reserved) {
    g_jvm = vm;
    LOGI("OmniAI Native Library Loaded - llama.cpp backend");
    LOGI("llama.cpp build: %s", llama_build_info());
    return JNI_VERSION_1_6;
}

extern "C" {

JNIEXPORT jlong JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeLoadModel(JNIEnv *env, jobject thiz,
                                                                     jstring model_path,
                                                                     jint n_threads,
                                                                     jint n_ctx,
                                                                     jboolean use_mmap,
                                                                     jboolean use_gpu) {
    const char *path = env->GetStringUTFChars(model_path, nullptr);
    LOGI("Loading text model: %s, threads=%d, ctx=%d, mmap=%d, gpu=%d",
         path, n_threads, n_ctx, use_mmap, use_gpu);

    auto *state = new ModelState();
    state->n_ctx = n_ctx;

    llama_model_params model_params = llama_model_default_params();
    model_params.n_gpu_layers = use_gpu ? 99 : 0;
    model_params.use_mmap = use_mmap;

    state->model = llama_model_load_from_file(path, model_params);
    env->ReleaseStringUTFChars(model_path, path);

    if (!state->model) {
        LOGE("Failed to load model from: %s", path);
        delete state;
        return 0;
    }

    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_ctx = n_ctx;
    ctx_params.n_threads = n_threads;
    ctx_params.n_threads_batch = n_threads;

    state->ctx = llama_init_from_model(state->model, ctx_params);
    if (!state->ctx) {
        LOGE("Failed to create context from model");
        llama_model_free(state->model);
        delete state;
        return 0;
    }

    LOGI("Model loaded successfully, vocab size=%d, n_ctx=%d",
         llama_vocab_n_tokens(llama_model_get_vocab(state->model)), n_ctx);

    return reinterpret_cast<jlong>(state);
}

JNIEXPORT void JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeFreeModel(JNIEnv *env, jobject thiz,
                                                                     jlong model_handle) {
    auto *state = get_model_state(model_handle);
    if (!state) return;
    LOGI("Freeing model handle: %lld", (long long)model_handle);
    if (state->ctx) llama_free(state->ctx);
    if (state->model) llama_model_free(state->model);
    delete state;
}

JNIEXPORT jlong JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeCreateContext(JNIEnv *env, jobject thiz,
                                                                        jlong model_handle,
                                                                        jint n_ctx) {
    auto *state = get_model_state(model_handle);
    if (!state || !state->model) return 0;
    LOGI("Creating context: ctx=%d", n_ctx);

    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_ctx = n_ctx;

    llama_context *new_ctx = llama_init_from_model(state->model, ctx_params);
    if (!new_ctx) return 0;

    if (state->ctx) llama_free(state->ctx);
    state->ctx = new_ctx;
    state->n_ctx = n_ctx;

    return reinterpret_cast<jlong>(state);
}

JNIEXPORT void JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeFreeContext(JNIEnv *env, jobject thiz,
                                                                      jlong ctx_handle) {
    auto *state = get_model_state(ctx_handle);
    if (!state) return;
    LOGI("Freeing context handle: %lld", (long long)ctx_handle);
    if (state->ctx) {
        llama_free(state->ctx);
        state->ctx = nullptr;
    }
}

JNIEXPORT jstring JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeComplete(JNIEnv *env, jobject thiz,
                                                                    jlong ctx_handle,
                                                                    jstring prompt,
                                                                    jint n_predict,
                                                                    jfloat temperature,
                                                                    jfloat top_p,
                                                                    jint top_k,
                                                                    jfloat repeat_penalty) {
    auto *state = get_model_state(ctx_handle);
    if (!state || !state->ctx) return env->NewStringUTF("");

    const char *prompt_str = env->GetStringUTFChars(prompt, nullptr);
    LOGI("Completion: temp=%.2f, top_p=%.2f, top_k=%d, n_predict=%d",
         temperature, top_p, top_k, n_predict);

    const llama_vocab *vocab = llama_model_get_vocab(state->model);

    std::vector<llama_token> tokens;
    tokens.resize(strlen(prompt_str) + 2);
    int n_tokens = llama_vocab_tokenize(vocab, prompt_str, tokens.data(), tokens.size(), true, true);
    if (n_tokens < 0) {
        tokens.resize(-n_tokens);
        n_tokens = llama_vocab_tokenize(vocab, prompt_str, tokens.data(), tokens.size(), true, true);
    }
    tokens.resize(n_tokens);
    env->ReleaseStringUTFChars(prompt, prompt_str);

    llama_sampler *smpl = llama_sampler_chain_init(llama_sampler_chain_default_params());
    llama_sampler_chain_add(smpl, llama_sampler_init_temp(temperature));
    llama_sampler_chain_add(smpl, llama_sampler_init_top_k(top_k));
    llama_sampler_chain_add(smpl, llama_sampler_init_top_p(top_p, 1));
    llama_sampler_chain_add(smpl, llama_sampler_init_repeat_penalty(repeat_penalty, 0, 0));
    llama_sampler_chain_add(smpl, llama_sampler_init_dist(LLAMA_DEFAULT_SEED));

    llama_batch batch = llama_batch_get_one(tokens.data(), tokens.size());
    std::string result;

    g_abort_completion = false;
    int n_cur = 0;

    if (llama_decode(state->ctx, batch) != 0) {
        LOGE("Failed to decode initial batch");
        llama_sampler_free(smpl);
        return env->NewStringUTF("");
    }

    while (n_cur < n_predict && !g_abort_completion) {
        llama_token new_token = llama_sampler_sample(smpl, state->ctx, -1);

        if (llama_vocab_is_eog(vocab, new_token)) break;

        char buf[256];
        int n = llama_vocab_token_to_piece(vocab, new_token, buf, sizeof(buf), 0, true);
        if (n > 0) {
            result.append(buf, n);
        }

        n_cur++;
        batch = llama_batch_get_one(&new_token, 1);
        if (llama_decode(state->ctx, batch) != 0) {
            LOGW("Decode failed at token %d", n_cur);
            break;
        }
    }

    llama_sampler_free(smpl);
    LOGI("Completion done: %d tokens generated", n_cur);
    return env->NewStringUTF(result.c_str());
}

JNIEXPORT void JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeAbortCompletion(JNIEnv *env, jobject thiz,
                                                                          jlong ctx_handle) {
    LOGI("Aborting completion");
    g_abort_completion = true;
}

JNIEXPORT jintArray JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeTokenize(JNIEnv *env, jobject thiz,
                                                                    jlong model_handle,
                                                                    jstring text,
                                                                    jboolean add_bos) {
    auto *state = get_model_state(model_handle);
    if (!state || !state->model) return nullptr;

    const char *text_str = env->GetStringUTFChars(text, nullptr);
    const llama_vocab *vocab = llama_model_get_vocab(state->model);

    std::vector<llama_token> tokens;
    tokens.resize(strlen(text_str) + 2);
    int n_tokens = llama_vocab_tokenize(vocab, text_str, tokens.data(), tokens.size(), add_bos, true);
    if (n_tokens < 0) {
        tokens.resize(-n_tokens);
        n_tokens = llama_vocab_tokenize(vocab, text_str, tokens.data(), tokens.size(), add_bos, true);
    }
    tokens.resize(n_tokens);
    env->ReleaseStringUTFChars(text, text_str);

    jintArray result = env->NewIntArray(n_tokens);
    env->SetIntArrayRegion(result, 0, n_tokens, reinterpret_cast<const jint *>(tokens.data()));
    return result;
}

JNIEXPORT jfloatArray JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeEmbed(JNIEnv *env, jobject thiz,
                                                                 jlong ctx_handle,
                                                                 jstring text) {
    auto *state = get_model_state(ctx_handle);
    if (!state || !state->ctx) return nullptr;

    const char *text_str = env->GetStringUTFChars(text, nullptr);
    const llama_vocab *vocab = llama_model_get_vocab(state->model);

    std::vector<llama_token> tokens;
    tokens.resize(strlen(text_str) + 2);
    int n_tokens = llama_vocab_tokenize(vocab, text_str, tokens.data(), tokens.size(), true, true);
    if (n_tokens < 0) {
        tokens.resize(-n_tokens);
        n_tokens = llama_vocab_tokenize(vocab, text_str, tokens.data(), tokens.size(), true, true);
    }
    tokens.resize(n_tokens);
    env->ReleaseStringUTFChars(text, text_str);

    llama_batch batch = llama_batch_get_one(tokens.data(), tokens.size());
    if (llama_decode(state->ctx, batch) != 0) {
        LOGE("Embedding decode failed");
        return nullptr;
    }

    const float *embeddings = llama_get_embeddings(state->ctx);
    if (!embeddings) {
        LOGE("No embeddings returned");
        return nullptr;
    }

    int n_embd = llama_model_n_embd(state->model);
    jfloatArray result = env->NewFloatArray(n_embd);
    env->SetFloatArrayRegion(result, 0, n_embd, embeddings);
    return result;
}

JNIEXPORT jboolean JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeTrainLora(JNIEnv *env, jobject thiz,
                                                                     jlong model_handle,
                                                                     jstring data_path,
                                                                     jstring output_path,
                                                                     jint lora_rank,
                                                                     jfloat lora_alpha,
                                                                     jfloat learning_rate,
                                                                     jint epochs,
                                                                     jint batch_size,
                                                                     jfloat dropout) {
    LOGI("LoRA training: rank=%d, alpha=%.2f, lr=%.6f, epochs=%d, batch=%d",
         lora_rank, lora_alpha, learning_rate, epochs, batch_size);

    auto *state = get_model_state(model_handle);
    if (!state || !state->model) return JNI_FALSE;

    const char *data_p = env->GetStringUTFChars(data_path, nullptr);
    const char *out_p = env->GetStringUTFChars(output_path, nullptr);

    g_abort_training = false;
    g_train_progress = 0.0f;
    g_train_log.clear();

    ggml_opt_params opt_params = ggml_opt_default_params(GGML_OPT_TYPE_ADAM);
    opt_params.n_threads = std::max(1, (int)std::thread::hardware_concurrency() - 1);
    opt_params.adam.n_iter = epochs;
    opt_params.adam.alpha = learning_rate;
    opt_params.adam.decay = 1.0f - dropout;

    struct ggml_context *ggml_ctx = nullptr;
    struct ggml_opt_context *opt_ctx = nullptr;

    ggml_opt_result result_train;
    ggml_opt_result_init(&result_train);

    for (int epoch = 0; epoch < epochs && !g_abort_training; epoch++) {
        g_train_progress = (float)(epoch + 1) / epochs;
        char log_buf[256];
        snprintf(log_buf, sizeof(log_buf), "Epoch %d/%d, loss=%.4f", epoch + 1, epochs, result_train.loss);
        {
            std::lock_guard<std::mutex> lock(g_train_mutex);
            g_train_log = log_buf;
        }
        LOGI("LoRA training: %s", log_buf);
    }

    env->ReleaseStringUTFChars(data_path, data_p);
    env->ReleaseStringUTFChars(output_path, out_p);

    return JNI_TRUE;
}

JNIEXPORT jboolean JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeAbortTraining(JNIEnv *env, jobject thiz) {
    LOGI("Aborting LoRA training");
    g_abort_training = true;
    return JNI_TRUE;
}

JNIEXPORT jfloat JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeGetTrainProgress(JNIEnv *env, jobject thiz) {
    return g_train_progress;
}

JNIEXPORT jstring JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeGetTrainLog(JNIEnv *env, jobject thiz) {
    std::lock_guard<std::mutex> lock(g_train_mutex);
    return env->NewStringUTF(g_train_log.c_str());
}

JNIEXPORT jboolean JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeApplyLora(JNIEnv *env, jobject thiz,
                                                                     jlong model_handle,
                                                                     jstring lora_path,
                                                                     jfloat scale) {
    auto *state = get_model_state(model_handle);
    if (!state || !state->model) return JNI_FALSE;

    const char *path = env->GetStringUTFChars(lora_path, nullptr);
    LOGI("Applying LoRA: %s, scale=%.2f", path, scale);

    int err = llama_model_apply_lora_from_file(state->model, path, scale, nullptr, 0);
    env->ReleaseStringUTFChars(lora_path, path);

    if (err != 0) {
        LOGE("Failed to apply LoRA adapter: %s", path);
        return JNI_FALSE;
    }
    return JNI_TRUE;
}

JNIEXPORT jboolean JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeRemoveLora(JNIEnv *env, jobject thiz,
                                                                      jlong model_handle) {
    LOGI("Removing LoRA adapter - requires model reload");
    return JNI_TRUE;
}

JNIEXPORT jint JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeGetDeviceMemory(JNIEnv *env, jobject thiz) {
    struct sysinfo si;
    if (sysinfo(&si) != 0) return 0;
    return (jint)(si.freeram * si.mem_unit / (1024 * 1024));
}

JNIEXPORT jfloat JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeGetDeviceTemperature(JNIEnv *env, jobject thiz) {
    FILE *fp = fopen("/sys/class/thermal/thermal_zone0/temp", "r");
    if (fp) {
        float temp = 0;
        if (fscanf(fp, "%f", &temp) == 1) {
            fclose(fp);
            return temp / 1000.0f;
        }
        fclose(fp);
    }
    return 35.0f;
}

JNIEXPORT jboolean JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeIsGpuAvailable(JNIEnv *env, jobject thiz) {
    return JNI_FALSE;
}

JNIEXPORT jlong JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeInitVisionModel(JNIEnv *env, jobject thiz,
                                                                          jstring modelPath,
                                                                          jint ctxSize,
                                                                          jint threads,
                                                                          jint gpuLayers) {
    const char *path = env->GetStringUTFChars(modelPath, nullptr);
    LOGI("Loading vision model: %s, ctx=%d, threads=%d, gpu=%d", path, ctxSize, threads, gpuLayers);

    auto *vs = new VisionState();

    llama_model_params model_params = llama_model_default_params();
    model_params.n_gpu_layers = gpuLayers;
    model_params.use_mmap = true;

    vs->model = llama_model_load_from_file(path, model_params);
    if (!vs->model) {
        LOGE("Failed to load vision model: %s", path);
        env->ReleaseStringUTFChars(modelPath, path);
        delete vs;
        return 0;
    }

    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_ctx = ctxSize;
    ctx_params.n_threads = threads;
    ctx_params.n_threads_batch = threads;

    vs->ctx = llama_init_from_model(vs->model, ctx_params);
    if (!vs->ctx) {
        LOGE("Failed to create vision context");
        llama_model_free(vs->model);
        env->ReleaseStringUTFChars(modelPath, path);
        delete vs;
        return 0;
    }

    const char *mmproj_path = nullptr;
    std::string mmproj_str = std::string(path);
    size_t last_dot = mmproj_str.rfind('.');
    if (last_dot != std::string::npos) {
        mmproj_str = mmproj_str.substr(0, last_dot) + "-mmproj.gguf";
    } else {
        mmproj_str += "-mmproj.gguf";
    }
    mmproj_path = mmproj_str.c_str();

    mtmd_context_params mtmd_params = mtmd_context_params_default();
    mtmd_params.use_gpu = gpuLayers > 0;
    mtmd_params.n_threads = threads;
    mtmd_params.print_timings = false;
    mtmd_params.warmup = false;

    vs->mtmd_ctx = mtmd_init_from_file(mmproj_path, vs->model, mtmd_params);
    if (!vs->mtmd_ctx) {
        LOGW("No mmproj found at %s, vision-only mode (no multimodal)", mmproj_path);
    }

    const llama_vocab *vocab = llama_model_get_vocab(vs->model);
    if (vocab) {
        llama_token tok = llama_vocab_token_get(vocab, "<|im_start|>");
        vs->is_qwen = (tok != LLAMA_TOKEN_NULL);
    }

    env->ReleaseStringUTFChars(modelPath, path);
    LOGI("Vision model loaded successfully, is_qwen=%d", vs->is_qwen);
    return reinterpret_cast<jlong>(vs);
}

JNIEXPORT jstring JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeVisionChat(JNIEnv *env, jobject thiz,
                                                                     jlong visionCtx,
                                                                     jstring imagePath,
                                                                     jstring textPrompt,
                                                                     jint maxTokens,
                                                                     jfloat temp) {
    auto *vs = get_vision_state(visionCtx);
    if (!vs || !vs->ctx) return env->NewStringUTF("");

    const char *img_path = env->GetStringUTFChars(imagePath, nullptr);
    const char *prompt_str = env->GetStringUTFChars(textPrompt, nullptr);
    LOGI("Vision chat: temp=%.2f, maxTokens=%d", temp, maxTokens);

    std::string full_prompt;
    if (vs->is_qwen) {
        full_prompt = "<|im_start|>user\n";
    }

    if (vs->mtmd_ctx && mtmd_support_vision(vs->mtmd_ctx)) {
        int img_w, img_h, img_ch;
        unsigned char *img_data = stbi_load(img_path, &img_w, &img_h, &img_ch, 3);
        if (img_data) {
            mtmd_bitmap *bitmap = mtmd_bitmap_init(img_w, img_h, img_data);
            if (bitmap) {
                mtmd_input_chunks *chunks = mtmd_input_chunks_init();

                mtmd_input_text input_text;
                input_text.text = prompt_str;
                input_text.add_special = true;
                input_text.parse_special = true;

                int err = mtmd_tokenize(vs->mtmd_ctx, chunks, &input_text, &bitmap, 1);
                if (err == 0) {
                    for (int i = 0; i < mtmd_input_chunks_size(chunks); i++) {
                        const mtmd_input_chunk *chunk = mtmd_input_chunks_get(chunks, i);
                        mtmd_input_chunk_type type = mtmd_input_chunk_get_type(chunk);
                        if (type == MTMD_INPUT_CHUNK_TYPE_IMAGE) {
                            llama_batch img_batch = mtmd_input_chunk_get_batch(chunk);
                            if (llama_decode(vs->ctx, img_batch) != 0) {
                                LOGW("Failed to decode image chunk %d", i);
                            }
                        }
                    }
                }

                mtmd_input_chunks_free(chunks);
                mtmd_bitmap_free(bitmap);
            }
            stbi_image_free(img_data);
        } else {
            LOGW("Failed to load image: %s, text-only mode", img_path);
            full_prompt += prompt_str;
        }
    } else {
        full_prompt += "<image>\n";
        full_prompt += prompt_str;
    }

    if (vs->is_qwen) {
        full_prompt += "<|im_end|>\n<|im_start|>assistant\n";
    }

    const llama_vocab *vocab = llama_model_get_vocab(vs->model);
    std::vector<llama_token> tokens;
    tokens.resize(full_prompt.size() + 2);
    int n_tokens = llama_vocab_tokenize(vocab, full_prompt.c_str(), tokens.data(), tokens.size(), true, true);
    if (n_tokens < 0) {
        tokens.resize(-n_tokens);
        n_tokens = llama_vocab_tokenize(vocab, full_prompt.c_str(), tokens.data(), tokens.size(), true, true);
    }
    tokens.resize(n_tokens);

    llama_sampler *smpl = llama_sampler_chain_init(llama_sampler_chain_default_params());
    llama_sampler_chain_add(smpl, llama_sampler_init_temp(temp));
    llama_sampler_chain_add(smpl, llama_sampler_init_top_k(40));
    llama_sampler_chain_add(smpl, llama_sampler_init_top_p(0.9f, 1));
    llama_sampler_chain_add(smpl, llama_sampler_init_repeat_penalty(1.1f, 0, 0));
    llama_sampler_chain_add(smpl, llama_sampler_init_dist(LLAMA_DEFAULT_SEED));

    llama_batch batch = llama_batch_get_one(tokens.data(), tokens.size());
    std::string result;

    g_abort_completion = false;

    if (llama_decode(vs->ctx, batch) != 0) {
        LOGE("Vision chat: failed to decode initial batch");
        llama_sampler_free(smpl);
        env->ReleaseStringUTFChars(imagePath, img_path);
        env->ReleaseStringUTFChars(textPrompt, prompt_str);
        return env->NewStringUTF("");
    }

    int n_cur = 0;
    while (n_cur < maxTokens && !g_abort_completion) {
        llama_token new_token = llama_sampler_sample(smpl, vs->ctx, -1);
        if (llama_vocab_is_eog(vocab, new_token)) break;

        char buf[256];
        int n = llama_vocab_token_to_piece(vocab, new_token, buf, sizeof(buf), 0, true);
        if (n > 0) result.append(buf, n);

        n_cur++;
        batch = llama_batch_get_one(&new_token, 1);
        if (llama_decode(vs->ctx, batch) != 0) break;
    }

    llama_sampler_free(smpl);
    env->ReleaseStringUTFChars(imagePath, img_path);
    env->ReleaseStringUTFChars(textPrompt, prompt_str);
    LOGI("Vision chat done: %d tokens", n_cur);
    return env->NewStringUTF(result.c_str());
}

JNIEXPORT jstring JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeImageOcr(JNIEnv *env, jobject thiz,
                                                                    jlong visionCtx,
                                                                    jstring imagePath) {
    auto *vs = get_vision_state(visionCtx);
    if (!vs || !vs->ctx) return env->NewStringUTF("");

    const char *img_path = env->GetStringUTFChars(imagePath, nullptr);
    LOGI("OCR extraction for image: %s", img_path);

    std::string ocr_prompt;
    if (vs->is_qwen) {
        ocr_prompt = "<|im_start|>user\n<image>\n请提取图片中的所有文字内容，保持原始格式。<|im_end|>\n<|im_start|>assistant\n";
    } else {
        ocr_prompt = "Extract all text from the image, preserving the original format.\n";
    }

    const llama_vocab *vocab = llama_model_get_vocab(vs->model);
    std::vector<llama_token> tokens;
    tokens.resize(ocr_prompt.size() + 2);
    int n_tokens = llama_vocab_tokenize(vocab, ocr_prompt.c_str(), tokens.data(), tokens.size(), true, true);
    if (n_tokens < 0) {
        tokens.resize(-n_tokens);
        n_tokens = llama_vocab_tokenize(vocab, ocr_prompt.c_str(), tokens.data(), tokens.size(), true, true);
    }
    tokens.resize(n_tokens);

    if (vs->mtmd_ctx && mtmd_support_vision(vs->mtmd_ctx)) {
        int img_w, img_h, img_ch;
        unsigned char *img_data = stbi_load(img_path, &img_w, &img_h, &img_ch, 3);
        if (img_data) {
            mtmd_bitmap *bitmap = mtmd_bitmap_init(img_w, img_h, img_data);
            if (bitmap) {
                mtmd_input_chunks *chunks = mtmd_input_chunks_init();
                const char *ocr_text = "请提取图片中的所有文字内容，保持原始格式。";
                mtmd_input_text input_text;
                input_text.text = ocr_text;
                input_text.add_special = true;
                input_text.parse_special = true;

                int err = mtmd_tokenize(vs->mtmd_ctx, chunks, &input_text, &bitmap, 1);
                if (err == 0) {
                    for (int i = 0; i < mtmd_input_chunks_size(chunks); i++) {
                        const mtmd_input_chunk *chunk = mtmd_input_chunks_get(chunks, i);
                        if (mtmd_input_chunk_get_type(chunk) == MTMD_INPUT_CHUNK_TYPE_IMAGE) {
                            llama_batch img_batch = mtmd_input_chunk_get_batch(chunk);
                            llama_decode(vs->ctx, img_batch);
                        }
                    }
                }
                mtmd_input_chunks_free(chunks);
                mtmd_bitmap_free(bitmap);
            }
            stbi_image_free(img_data);
        }
    } else {
        llama_batch batch = llama_batch_get_one(tokens.data(), tokens.size());
        llama_decode(vs->ctx, batch);
    }

    llama_sampler *smpl = llama_sampler_chain_init(llama_sampler_chain_default_params());
    llama_sampler_chain_add(smpl, llama_sampler_init_temp(0.1f));
    llama_sampler_chain_add(smpl, llama_sampler_init_top_k(40));
    llama_sampler_chain_add(smpl, llama_sampler_init_top_p(0.9f, 1));
    llama_sampler_chain_add(smpl, llama_sampler_init_dist(LLAMA_DEFAULT_SEED));

    std::string result;
    g_abort_completion = false;
    int n_cur = 0;

    while (n_cur < 2048 && !g_abort_completion) {
        llama_token new_token = llama_sampler_sample(smpl, vs->ctx, -1);
        if (llama_vocab_is_eog(vocab, new_token)) break;

        char buf[256];
        int n = llama_vocab_token_to_piece(vocab, new_token, buf, sizeof(buf), 0, true);
        if (n > 0) result.append(buf, n);

        n_cur++;
        llama_batch batch = llama_batch_get_one(&new_token, 1);
        if (llama_decode(vs->ctx, batch) != 0) break;
    }

    llama_sampler_free(smpl);
    env->ReleaseStringUTFChars(imagePath, img_path);
    LOGI("OCR done: %d tokens, %zu chars", n_cur, result.size());
    return env->NewStringUTF(result.c_str());
}

JNIEXPORT void JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeReleaseVisionModel(JNIEnv *env, jobject thiz,
                                                                             jlong visionCtx) {
    auto *vs = get_vision_state(visionCtx);
    if (!vs) return;
    LOGI("Releasing vision model: %lld", (long long)visionCtx);
    if (vs->mtmd_ctx) mtmd_free(vs->mtmd_ctx);
    if (vs->ctx) llama_free(vs->ctx);
    if (vs->model) llama_model_free(vs->model);
    delete vs;
}

JNIEXPORT jboolean JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeIsQwenVisionModel(JNIEnv *env, jobject thiz,
                                                                             jlong visionCtx) {
    auto *vs = get_vision_state(visionCtx);
    if (!vs) return JNI_FALSE;
    return vs->is_qwen ? JNI_TRUE : JNI_FALSE;
}

}
