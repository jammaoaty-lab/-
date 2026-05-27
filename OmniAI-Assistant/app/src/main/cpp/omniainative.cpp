#include <jni.h>
#include <string>
#include <android/log.h>
#include <cstring>

#define LOG_TAG "OmniAI-Native"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

static JavaVM *g_jvm = nullptr;

JNIEXPORT jint JNI_OnLoad(JavaVM *vm, void *reserved) {
    g_jvm = vm;
    LOGI("OmniAI Native Library Loaded");
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
    LOGI("Loading model: %s, threads=%d, ctx=%d, mmap=%d, gpu=%d",
         path, n_threads, n_ctx, use_mmap, use_gpu);

    jlong handle = 0;

    // TODO: Integrate llama.cpp model loading
    // llama_model_params model_params = llama_model_default_params();
    // model_params.n_gpu_layers = use_gpu ? 99 : 0;
    // model_params.use_mmap = use_mmap;
    // llama_model *model = llama_model_load_from_file(path, model_params);

    env->ReleaseStringUTFChars(model_path, path);
    return handle;
}

JNIEXPORT void JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeFreeModel(JNIEnv *env, jobject thiz,
                                                                     jlong model_handle) {
    if (model_handle == 0) return;
    LOGI("Freeing model handle: %lld", (long long)model_handle);
    // TODO: llama_model_free(model)
}

JNIEXPORT jlong JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeCreateContext(JNIEnv *env, jobject thiz,
                                                                        jlong model_handle,
                                                                        jint n_ctx) {
    if (model_handle == 0) return 0;
    LOGI("Creating context: ctx=%d", n_ctx);

    jlong ctx_handle = 0;

    // TODO: Integrate llama.cpp context creation
    // llama_context_params ctx_params = llama_context_default_params();
    // ctx_params.n_ctx = n_ctx;
    // llama_context *ctx = llama_init_from_model(model, ctx_params);

    return ctx_handle;
}

JNIEXPORT void JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeFreeContext(JNIEnv *env, jobject thiz,
                                                                      jlong ctx_handle) {
    if (ctx_handle == 0) return;
    LOGI("Freeing context handle: %lld", (long long)ctx_handle);
    // TODO: llama_free(ctx)
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
    if (ctx_handle == 0) return env->NewStringUTF("");

    const char *prompt_str = env->GetStringUTFChars(prompt, nullptr);
    LOGI("Completion request: temp=%.2f, top_p=%.2f, top_k=%d, n_predict=%d",
         temperature, top_p, top_k, n_predict);

    std::string result = "";

    // TODO: Integrate llama.cpp completion
    // llama_batch batch = llama_batch_get_one(tokens, n_tokens);
    // while (n_cur <= n_predict) { ... sampling ... }

    env->ReleaseStringUTFChars(prompt, prompt_str);
    return env->NewStringUTF(result.c_str());
}

JNIEXPORT void JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeAbortCompletion(JNIEnv *env, jobject thiz,
                                                                          jlong ctx_handle) {
    LOGI("Aborting completion for context: %lld", (long long)ctx_handle);
    // TODO: Set abort flag
}

JNIEXPORT jintArray JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeTokenize(JNIEnv *env, jobject thiz,
                                                                    jlong model_handle,
                                                                    jstring text,
                                                                    jboolean add_bos) {
    if (model_handle == 0) return nullptr;

    const char *text_str = env->GetStringUTFChars(text, nullptr);
    LOGI("Tokenizing text, add_bos=%d", add_bos);

    // TODO: Integrate llama.cpp tokenization
    // std::vector<llama_token> tokens = llama_tokenize(model, text_str, add_bos, true);

    env->ReleaseStringUTFChars(text, text_str);

    jintArray result = env->NewIntArray(0);
    return result;
}

JNIEXPORT jfloatArray JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeEmbed(JNIEnv *env, jobject thiz,
                                                                 jlong ctx_handle,
                                                                 jstring text) {
    if (ctx_handle == 0) return nullptr;

    const char *text_str = env->GetStringUTFChars(text, nullptr);
    LOGI("Generating embedding");

    // TODO: Integrate llama.cpp embedding generation
    // llama_encode(ctx, batch);
    // float *embeddings = llama_get_embeddings(ctx);

    env->ReleaseStringUTFChars(text, text_str);

    jfloatArray result = env->NewFloatArray(0);
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

    // TODO: Integrate LoRA training logic
    return JNI_FALSE;
}

JNIEXPORT jboolean JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeAbortTraining(JNIEnv *env, jobject thiz) {
    LOGI("Aborting LoRA training");
    // TODO: Set training abort flag
    return JNI_TRUE;
}

JNIEXPORT jfloat JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeGetTrainProgress(JNIEnv *env, jobject thiz) {
    // TODO: Return current training progress 0.0 - 1.0
    return 0.0f;
}

JNIEXPORT jstring JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeGetTrainLog(JNIEnv *env, jobject thiz) {
    // TODO: Return latest training log line
    return env->NewStringUTF("");
}

JNIEXPORT jboolean JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeApplyLora(JNIEnv *env, jobject thiz,
                                                                     jlong model_handle,
                                                                     jstring lora_path,
                                                                     jfloat scale) {
    const char *path = env->GetStringUTFChars(lora_path, nullptr);
    LOGI("Applying LoRA: %s, scale=%.2f", path, scale);
    env->ReleaseStringUTFChars(lora_path, path);
    // TODO: Apply LoRA adapter
    return JNI_FALSE;
}

JNIEXPORT jboolean JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeRemoveLora(JNIEnv *env, jobject thiz,
                                                                      jlong model_handle) {
    LOGI("Removing LoRA adapter");
    // TODO: Remove LoRA adapter
    return JNI_TRUE;
}

JNIEXPORT jint JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeGetDeviceMemory(JNIEnv *env, jobject thiz) {
    // TODO: Query available device memory
    return 0;
}

JNIEXPORT jfloat JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeGetDeviceTemperature(JNIEnv *env, jobject thiz) {
    // TODO: Query device thermal status
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

    jlong handle = 0;

    env->ReleaseStringUTFChars(modelPath, path);
    return handle;
}

JNIEXPORT jstring JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeVisionChat(JNIEnv *env, jobject thiz,
                                                                     jlong visionCtx,
                                                                     jstring imagePath,
                                                                     jstring textPrompt,
                                                                     jint maxTokens,
                                                                     jfloat temp) {
    if (visionCtx == 0) return env->NewStringUTF("");

    const char *img_path = env->GetStringUTFChars(imagePath, nullptr);
    const char *prompt_str = env->GetStringUTFChars(textPrompt, nullptr);
    LOGI("Vision chat: temp=%.2f, maxTokens=%d", temp, maxTokens);

    std::string chat_prompt = "<|im_start|>user\n<image>\n" + std::string(prompt_str) + "<|im_end|>\n<|im_start|>assistant\n";
    std::string result = "";

    env->ReleaseStringUTFChars(imagePath, img_path);
    env->ReleaseStringUTFChars(textPrompt, prompt_str);
    return env->NewStringUTF(result.c_str());
}

JNIEXPORT jstring JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeImageOcr(JNIEnv *env, jobject thiz,
                                                                    jlong visionCtx,
                                                                    jstring imagePath) {
    if (visionCtx == 0) return env->NewStringUTF("");

    const char *img_path = env->GetStringUTFChars(imagePath, nullptr);
    LOGI("OCR extraction for image");

    std::string ocr_prompt = "<|im_start|>user\n<image>\n请提取图片中的所有文字内容，保持原始格式。<|im_end|>\n<|im_start|>assistant\n";
    std::string result = "";

    env->ReleaseStringUTFChars(imagePath, img_path);
    return env->NewStringUTF(result.c_str());
}

JNIEXPORT void JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeReleaseVisionModel(JNIEnv *env, jobject thiz,
                                                                             jlong visionCtx) {
    if (visionCtx == 0) return;
    LOGI("Releasing vision model: %lld", (long long)visionCtx);
}

JNIEXPORT jboolean JNICALL
Java_com_omniai_assistant_nativebridge_LlamaBridge_nativeIsQwenVisionModel(JNIEnv *env, jobject thiz,
                                                                             jlong visionCtx) {
    LOGI("Checking Qwen vision model");
    return JNI_FALSE;
}

}
