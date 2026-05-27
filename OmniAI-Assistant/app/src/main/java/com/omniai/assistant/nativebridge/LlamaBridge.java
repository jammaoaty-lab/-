package com.omniai.assistant.nativebridge;

public class LlamaBridge {

    static {
        System.loadLibrary("omniainative");
    }

    public native long nativeLoadModel(String modelPath, int nThreads, int nCtx, boolean useMmap, boolean useGpu);

    public native void nativeFreeModel(long modelHandle);

    public native long nativeCreateContext(long modelHandle, int nCtx);

    public native void nativeFreeContext(long ctxHandle);

    public native String nativeComplete(long ctxHandle, String prompt, int nPredict, float temperature, float topP, int topK, float repeatPenalty);

    public native void nativeAbortCompletion(long ctxHandle);

    public native int[] nativeTokenize(long modelHandle, String text, boolean addBos);

    public native float[] nativeEmbed(long ctxHandle, String text);

    public native boolean nativeTrainLora(long modelHandle, String dataPath, String outputPath, int loraRank, float loraAlpha, float learningRate, int epochs, int batchSize, float dropout);

    public native void nativeAbortTraining();

    public native float nativeGetTrainProgress();

    public native String nativeGetTrainLog();

    public native boolean nativeApplyLora(long modelHandle, String loraPath, float scale);

    public native boolean nativeRemoveLora(long modelHandle);

    public native int nativeGetDeviceMemory();

    public native float nativeGetDeviceTemperature();

    public native boolean nativeIsGpuAvailable();

    private static volatile LlamaBridge instance;

    private LlamaBridge() {}

    public static LlamaBridge getInstance() {
        if (instance == null) {
            synchronized (LlamaBridge.class) {
                if (instance == null) {
                    instance = new LlamaBridge();
                }
            }
        }
        return instance;
    }

    public long loadModel(String modelPath, int nThreads, int nCtx, boolean useMmap, boolean useGpu) {
        return nativeLoadModel(modelPath, nThreads, nCtx, useMmap, useGpu);
    }

    public void freeModel(long modelHandle) {
        nativeFreeModel(modelHandle);
    }

    public long createContext(long modelHandle, int nCtx) {
        return nativeCreateContext(modelHandle, nCtx);
    }

    public void freeContext(long ctxHandle) {
        nativeFreeContext(ctxHandle);
    }

    public String complete(long ctxHandle, String prompt, int nPredict, float temperature, float topP, int topK, float repeatPenalty) {
        return nativeComplete(ctxHandle, prompt, nPredict, temperature, topP, topK, repeatPenalty);
    }

    public void abortCompletion(long ctxHandle) {
        nativeAbortCompletion(ctxHandle);
    }

    public int[] tokenize(long modelHandle, String text, boolean addBos) {
        return nativeTokenize(modelHandle, text, addBos);
    }

    public float[] embed(long ctxHandle, String text) {
        return nativeEmbed(ctxHandle, text);
    }

    public boolean trainLora(long modelHandle, String dataPath, String outputPath, int loraRank, float loraAlpha, float learningRate, int epochs, int batchSize, float dropout) {
        return nativeTrainLora(modelHandle, dataPath, outputPath, loraRank, loraAlpha, learningRate, epochs, batchSize, dropout);
    }

    public void abortTraining() {
        nativeAbortTraining();
    }

    public float getTrainProgress() {
        return nativeGetTrainProgress();
    }

    public String getTrainLog() {
        return nativeGetTrainLog();
    }

    public boolean applyLora(long modelHandle, String loraPath, float scale) {
        return nativeApplyLora(modelHandle, loraPath, scale);
    }

    public boolean removeLora(long modelHandle) {
        return nativeRemoveLora(modelHandle);
    }

    public int getDeviceMemory() {
        return nativeGetDeviceMemory();
    }

    public float getDeviceTemperature() {
        return nativeGetDeviceTemperature();
    }

    public boolean isGpuAvailable() {
        return nativeIsGpuAvailable();
    }
}
