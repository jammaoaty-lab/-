package com.omniai.assistant.inference;

import com.omniai.assistant.model.AIModel;
import com.omniai.assistant.model.LoraWeight;
import com.omniai.assistant.nativebridge.LlamaBridge;
import com.omniai.assistant.scheduler.InferenceParams;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

public class InferenceEngine {

    private static volatile InferenceEngine instance;

    private LlamaBridge bridge;
    private long modelHandle;
    private long contextHandle;
    private AIModel currentModel;
    private boolean isInitialized;
    private AtomicBoolean isInferencing = new AtomicBoolean(false);
    private ExecutorService inferenceExecutor;
    private List<InferenceListener> listeners;

    public interface InferenceListener {
        void onModelLoaded(AIModel model);
        void onModelUnloaded();
        void onInferenceStarted();
        void onInferenceCompleted(String result);
        void onInferenceError(String error);
    }

    public interface LoadCallback {
        void onLoaded(AIModel model);
        void onError(String error);
    }

    public interface InferenceCallback {
        void onSuccess(String result);
        void onError(String error);
    }

    public interface StreamCallback {
        void onToken(String token);
        void onComplete(String fullResult);
        void onError(String error);
    }

    private InferenceEngine() {
        this.bridge = LlamaBridge.getInstance();
        this.modelHandle = 0L;
        this.contextHandle = 0L;
        this.isInitialized = false;
        this.inferenceExecutor = Executors.newSingleThreadExecutor();
        this.listeners = new CopyOnWriteArrayList<>();
    }

    public static InferenceEngine getInstance() {
        if (instance == null) {
            synchronized (InferenceEngine.class) {
                if (instance == null) {
                    instance = new InferenceEngine();
                }
            }
        }
        return instance;
    }

    public void loadModel(AIModel model, LoadCallback callback) {
        inferenceExecutor.execute(() -> {
            try {
                if (modelHandle != 0L) {
                    unloadModel();
                }
                modelHandle = bridge.nativeLoadModel(
                        model.getFilePath(),
                        Runtime.getRuntime().availableProcessors(),
                        2048,
                        true,
                        model.isGpuAccelerated()
                );
                if (modelHandle == 0L) {
                    if (callback != null) callback.onError("Failed to load model: " + model.getFilePath());
                    return;
                }
                currentModel = model;
                currentModel.setLoaded(true);
                isInitialized = true;
                for (InferenceListener l : listeners) {
                    l.onModelLoaded(model);
                }
                if (callback != null) callback.onLoaded(model);
            } catch (Exception e) {
                if (callback != null) callback.onError(e.getMessage());
            }
        });
    }

    public void unloadModel() {
        if (contextHandle != 0L) {
            destroyContext();
        }
        if (modelHandle != 0L) {
            bridge.nativeFreeModel(modelHandle);
            modelHandle = 0L;
        }
        if (currentModel != null) {
            currentModel.setLoaded(false);
        }
        currentModel = null;
        isInitialized = false;
        for (InferenceListener l : listeners) {
            l.onModelUnloaded();
        }
    }

    public long createContext(int nCtx) {
        if (modelHandle == 0L) return 0L;
        contextHandle = bridge.nativeCreateContext(modelHandle, nCtx);
        return contextHandle;
    }

    public void destroyContext() {
        if (contextHandle != 0L) {
            bridge.nativeFreeContext(contextHandle);
            contextHandle = 0L;
        }
    }

    public void complete(String prompt, InferenceParams params, InferenceCallback callback) {
        if (!isModelLoaded()) {
            if (callback != null) callback.onError("Model not loaded");
            return;
        }
        if (!isInferencing.compareAndSet(false, true)) {
            if (callback != null) callback.onError("Inference already in progress");
            return;
        }
        inferenceExecutor.execute(() -> {
            try {
                for (InferenceListener l : listeners) {
                    l.onInferenceStarted();
                }
                if (contextHandle == 0L) {
                    createContext(params.getNCtx());
                }
                String result = bridge.nativeComplete(
                        contextHandle,
                        prompt,
                        params.getNPredict(),
                        params.getTemperature(),
                        params.getTopP(),
                        params.getTopK(),
                        params.getRepeatPenalty()
                );
                for (InferenceListener l : listeners) {
                    l.onInferenceCompleted(result);
                }
                if (callback != null) callback.onSuccess(result);
            } catch (Exception e) {
                for (InferenceListener l : listeners) {
                    l.onInferenceError(e.getMessage());
                }
                if (callback != null) callback.onError(e.getMessage());
            } finally {
                isInferencing.set(false);
            }
        });
    }

    public void streamComplete(String prompt, InferenceParams params, StreamCallback callback) {
        if (!isModelLoaded()) {
            if (callback != null) callback.onError("Model not loaded");
            return;
        }
        if (!isInferencing.compareAndSet(false, true)) {
            if (callback != null) callback.onError("Inference already in progress");
            return;
        }
        inferenceExecutor.execute(() -> {
            try {
                for (InferenceListener l : listeners) {
                    l.onInferenceStarted();
                }
                if (contextHandle == 0L) {
                    createContext(params.getNCtx());
                }
                StringBuilder fullResult = new StringBuilder();
                int generated = 0;
                int maxTokens = params.getNPredict();
                while (generated < maxTokens && isInferencing.get()) {
                    String token = bridge.nativeComplete(
                            contextHandle,
                            prompt + fullResult.toString(),
                            1,
                            params.getTemperature(),
                            params.getTopP(),
                            params.getTopK(),
                            params.getRepeatPenalty()
                    );
                    if (token == null || token.isEmpty()) break;
                    boolean shouldStop = false;
                    for (String stop : params.getStopTokens()) {
                        if (token.contains(stop)) {
                            shouldStop = true;
                            break;
                        }
                    }
                    if (shouldStop) break;
                    fullResult.append(token);
                    generated++;
                    if (callback != null) callback.onToken(token);
                }
                if (callback != null) callback.onComplete(fullResult.toString());
                for (InferenceListener l : listeners) {
                    l.onInferenceCompleted(fullResult.toString());
                }
            } catch (Exception e) {
                for (InferenceListener l : listeners) {
                    l.onInferenceError(e.getMessage());
                }
                if (callback != null) callback.onError(e.getMessage());
            } finally {
                isInferencing.set(false);
            }
        });
    }

    public void abortCompletion() {
        if (isInferencing.get() && contextHandle != 0L) {
            bridge.nativeAbortCompletion(contextHandle);
        }
    }

    public boolean isModelLoaded() {
        return isInitialized && modelHandle != 0L;
    }

    public boolean isGpuAvailable() {
        return bridge.nativeIsGpuAvailable();
    }

    public long getDeviceMemory() {
        return bridge.nativeGetDeviceMemory();
    }

    public float getDeviceTemperature() {
        return bridge.nativeGetDeviceTemperature();
    }

    public void applyLora(LoraWeight lora, float scale) {
        if (modelHandle == 0L) return;
        bridge.nativeApplyLora(modelHandle, lora.getFilePath(), scale);
    }

    public void removeLora() {
        if (modelHandle == 0L) return;
        bridge.nativeRemoveLora(modelHandle);
    }

    public int[] tokenize(String text) {
        if (modelHandle == 0L) return new int[0];
        return bridge.nativeTokenize(modelHandle, text, true);
    }

    public AIModel getLoadedModel() {
        return currentModel;
    }

    public void addListener(InferenceListener listener) {
        listeners.add(listener);
    }

    public void removeListener(InferenceListener listener) {
        listeners.remove(listener);
    }

    public boolean isInferencing() {
        return isInferencing.get();
    }

    public void shutdown() {
        abortCompletion();
        unloadModel();
        inferenceExecutor.shutdownNow();
    }
}
