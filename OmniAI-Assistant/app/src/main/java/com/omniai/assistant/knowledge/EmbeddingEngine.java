package com.omniai.assistant.knowledge;

import com.omniai.assistant.nativebridge.LlamaBridge;

import java.util.ArrayList;
import java.util.List;

public class EmbeddingEngine {

    private LlamaBridge bridge;
    private long modelHandle;
    private boolean isInitialized;
    private static final int DEFAULT_DIMENSION = 768;

    public EmbeddingEngine() {
        this.bridge = LlamaBridge.getInstance();
        this.modelHandle = -1;
        this.isInitialized = false;
    }

    public void initialize(String modelPath) {
        if (isInitialized) {
            shutdown();
        }
        modelHandle = bridge.loadModel(modelPath, 4, 512, true, false);
        if (modelHandle <= 0) {
            throw new RuntimeException("Failed to load embedding model: " + modelPath);
        }
        isInitialized = true;
    }

    public void shutdown() {
        if (isInitialized && modelHandle > 0) {
            bridge.freeModel(modelHandle);
            modelHandle = -1;
            isInitialized = false;
        }
    }

    public float[] embed(String text) {
        if (!isInitialized || modelHandle <= 0) {
            throw new IllegalStateException("EmbeddingEngine is not initialized");
        }
        long ctxHandle = bridge.createContext(modelHandle, 512);
        if (ctxHandle <= 0) {
            throw new RuntimeException("Failed to create context for embedding");
        }
        try {
            float[] result = bridge.embed(ctxHandle, text);
            if (result == null || result.length == 0) {
                throw new RuntimeException("Embedding generation returned empty result");
            }
            return result;
        } finally {
            bridge.freeContext(ctxHandle);
        }
    }

    public List<float[]> embedBatch(List<String> texts) {
        if (!isInitialized || modelHandle <= 0) {
            throw new IllegalStateException("EmbeddingEngine is not initialized");
        }
        List<float[]> results = new ArrayList<>();
        for (String text : texts) {
            float[] embedding = embed(text);
            results.add(embedding);
        }
        return results;
    }

    public boolean isInitialized() {
        return isInitialized;
    }

    public int getEmbeddingDimension() {
        return DEFAULT_DIMENSION;
    }
}
