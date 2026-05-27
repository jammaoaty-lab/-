package com.omniai.assistant.lora;

import com.omniai.assistant.model.LoraWeight;
import com.omniai.assistant.nativebridge.LlamaBridge;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class LoraTrainManager {

    private LlamaBridge bridge;
    private TrainState currentState;
    private TrainConfig currentConfig;
    private List<TrainLogEntry> logEntries;
    private float progress;
    private LoraTrainListener listener;
    private ExecutorService trainExecutor;
    private boolean isAborted;

    private static volatile LoraTrainManager instance;

    private LoraTrainManager() {
        bridge = LlamaBridge.getInstance();
        currentState = TrainState.IDLE;
        logEntries = Collections.synchronizedList(new ArrayList<>());
        progress = 0f;
        isAborted = false;
        trainExecutor = Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "LoraTrainThread");
            t.setPriority(Thread.NORM_PRIORITY - 1);
            return t;
        });
    }

    public static LoraTrainManager getInstance() {
        if (instance == null) {
            synchronized (LoraTrainManager.class) {
                if (instance == null) {
                    instance = new LoraTrainManager();
                }
            }
        }
        return instance;
    }

    public void startTraining(TrainConfig config, LoraTrainListener listener) {
        if (currentState != TrainState.IDLE && currentState != TrainState.COMPLETED && currentState != TrainState.ERROR) {
            throw new IllegalStateException("Training is already in progress. Current state: " + currentState);
        }
        this.currentConfig = config;
        this.listener = listener;
        this.progress = 0f;
        this.isAborted = false;
        this.logEntries.clear();
        trainExecutor.submit(this::runTraining);
    }

    private void runTraining() {
        try {
            setState(TrainState.PREPARING);
            addLog(TrainState.PREPARING, "Preparing training data...", 0f);

            File dataFile = new File(currentConfig.dataPath);
            if (!dataFile.exists()) {
                throw new RuntimeException("Training data not found: " + currentConfig.dataPath);
            }

            File outputDir = new File(currentConfig.outputPath);
            if (!outputDir.exists()) {
                outputDir.mkdirs();
            }

            setState(TrainState.TOKENIZING);
            addLog(TrainState.TOKENIZING, "Tokenizing training data...", 0f);

            setState(TrainState.TRAINING);
            addLog(TrainState.TRAINING, "Starting LoRA training...", 0f);

            boolean success = bridge.trainLora(
                    0,
                    currentConfig.dataPath,
                    currentConfig.outputPath,
                    currentConfig.loraRank,
                    currentConfig.loraAlpha,
                    currentConfig.learningRate,
                    currentConfig.epochs,
                    currentConfig.batchSize,
                    currentConfig.dropout
            );

            if (isAborted) {
                setState(TrainState.IDLE);
                addLog(TrainState.IDLE, "Training aborted", 0f);
                return;
            }

            if (!success) {
                throw new RuntimeException("Native training failed");
            }

            while (!isAborted) {
                progress = bridge.getTrainProgress();
                if (listener != null) {
                    listener.onProgress(progress);
                }
                String logJson = bridge.getTrainLog();
                if (logJson != null && !logJson.isEmpty()) {
                    addLog(TrainState.TRAINING, logJson, 0f);
                }
                if (progress >= 1.0f) {
                    break;
                }
                Thread.sleep(500);
            }

            if (isAborted) {
                bridge.abortTraining();
                setState(TrainState.IDLE);
                addLog(TrainState.IDLE, "Training aborted", 0f);
                return;
            }

            setState(TrainState.SAVING);
            addLog(TrainState.SAVING, "Saving LoRA weights...", 0f);
            progress = 1.0f;

            setState(TrainState.MERGING);
            addLog(TrainState.MERGING, "Finalizing LoRA adapter...", 0f);

            setState(TrainState.COMPLETED);
            addLog(TrainState.COMPLETED, "Training completed successfully", 0f);

            if (listener != null) {
                listener.onCompleted(currentConfig.outputPath);
            }

        } catch (Exception e) {
            setState(TrainState.ERROR);
            addLog(TrainState.ERROR, e.getMessage(), 0f);
            if (listener != null) {
                listener.onError(e.getMessage());
            }
        }
    }

    public void pauseTraining() {
        if (currentState == TrainState.TRAINING) {
            isAborted = true;
            bridge.abortTraining();
            setState(TrainState.PAUSED);
            addLog(TrainState.PAUSED, "Training paused", 0f);
        }
    }

    public void resumeTraining() {
        if (currentState == TrainState.PAUSED) {
            isAborted = false;
            startTraining(currentConfig, listener);
        }
    }

    public void stopTraining() {
        if (currentState == TrainState.TRAINING || currentState == TrainState.PAUSED ||
                currentState == TrainState.PREPARING || currentState == TrainState.TOKENIZING) {
            isAborted = true;
            bridge.abortTraining();
            setState(TrainState.IDLE);
            addLog(TrainState.IDLE, "Training stopped", 0f);
        }
    }

    public boolean isTraining() {
        return currentState == TrainState.TRAINING || currentState == TrainState.PREPARING ||
                currentState == TrainState.TOKENIZING || currentState == TrainState.SAVING ||
                currentState == TrainState.MERGING;
    }

    public float getProgress() {
        return progress;
    }

    public List<TrainLogEntry> getLogEntries() {
        return new ArrayList<>(logEntries);
    }

    public String exportLora(String outputPath) {
        if (currentConfig == null || currentState != TrainState.COMPLETED) {
            throw new IllegalStateException("No completed training to export");
        }
        File srcDir = new File(currentConfig.outputPath);
        File dstDir = new File(outputPath);
        if (!dstDir.exists()) {
            dstDir.mkdirs();
        }
        File[] files = srcDir.listFiles();
        if (files != null) {
            for (File file : files) {
                copyFile(file, new File(dstDir, file.getName()));
            }
        }
        return outputPath;
    }

    private void copyFile(File src, File dst) {
        try {
            java.io.InputStream in = new java.io.FileInputStream(src);
            java.io.OutputStream out = new java.io.FileOutputStream(dst);
            byte[] buffer = new byte[8192];
            int len;
            while ((len = in.read(buffer)) > 0) {
                out.write(buffer, 0, len);
            }
            in.close();
            out.close();
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to copy file: " + src.getPath(), e);
        }
    }

    public boolean applyLora(String loraPath, float scale) {
        return bridge.applyLora(0, loraPath, scale);
    }

    public boolean removeLora() {
        return bridge.removeLora(0);
    }

    public List<LoraWeight> listLoraWeights() {
        List<LoraWeight> weights = new ArrayList<>();
        File loraDir = new File(com.omniai.assistant.common.Constants.LORA_DIR);
        if (!loraDir.exists()) {
            return weights;
        }
        File[] dirs = loraDir.listFiles(File::isDirectory);
        if (dirs == null) {
            return weights;
        }
        for (File dir : dirs) {
            LoraWeight w = new LoraWeight();
            w.setId(dir.getName());
            w.setName(dir.getName());
            w.setFilePath(dir.getAbsolutePath());
            w.setFileSize(calculateDirSize(dir));
            w.setEnabled(true);
            w.setCreatedAt(dir.lastModified());
            weights.add(w);
        }
        return weights;
    }

    private long calculateDirSize(File dir) {
        long size = 0;
        File[] files = dir.listFiles();
        if (files != null) {
            for (File f : files) {
                if (f.isFile()) {
                    size += f.length();
                } else {
                    size += calculateDirSize(f);
                }
            }
        }
        return size;
    }

    public boolean deleteLora(String loraId) {
        File loraDir = new File(com.omniai.assistant.common.Constants.LORA_DIR, loraId);
        if (!loraDir.exists()) {
            return false;
        }
        return deleteRecursive(loraDir);
    }

    private boolean deleteRecursive(File file) {
        if (file.isDirectory()) {
            File[] children = file.listFiles();
            if (children != null) {
                for (File child : children) {
                    deleteRecursive(child);
                }
            }
        }
        return file.delete();
    }

    public boolean enableLora(String loraId) {
        List<LoraWeight> weights = listLoraWeights();
        for (LoraWeight w : weights) {
            if (w.getId().equals(loraId)) {
                w.setEnabled(true);
                return applyLora(w.getFilePath(), 1.0f);
            }
        }
        return false;
    }

    public boolean disableLora(String loraId) {
        return removeLora();
    }

    public void mergeLoraWeights(List<String> loraIds) {
        if (loraIds == null || loraIds.size() < 2) {
            throw new IllegalArgumentException("At least 2 LoRA weights required for merging");
        }
        throw new UnsupportedOperationException("LoRA weight merging is not yet supported");
    }

    public void resetLora() {
        removeLora();
        currentState = TrainState.IDLE;
        currentConfig = null;
        progress = 0f;
        logEntries.clear();
        isAborted = false;
    }

    private void setState(TrainState state) {
        this.currentState = state;
        if (listener != null) {
            listener.onStateChanged(state);
        }
    }

    private void addLog(TrainState state, String message, float loss) {
        TrainLogEntry entry = new TrainLogEntry(System.currentTimeMillis(), state, message, loss);
        logEntries.add(entry);
        if (listener != null) {
            listener.onLog(entry);
        }
    }

    public enum TrainState {
        IDLE,
        PREPARING,
        TOKENIZING,
        TRAINING,
        SAVING,
        MERGING,
        PAUSED,
        COMPLETED,
        ERROR
    }

    public static class TrainConfig {

        private String dataPath;
        private String outputPath;
        private int loraRank;
        private float loraAlpha;
        private float learningRate;
        private int epochs;
        private int batchSize;
        private float dropout;
        private int contextLength;

        public TrainConfig() {
            this.loraRank = 8;
            this.loraAlpha = 16.0f;
            this.learningRate = 1e-4f;
            this.epochs = 3;
            this.batchSize = 4;
            this.dropout = 0.05f;
            this.contextLength = 512;
        }

        public String getDataPath() {
            return dataPath;
        }

        public void setDataPath(String dataPath) {
            this.dataPath = dataPath;
        }

        public String getOutputPath() {
            return outputPath;
        }

        public void setOutputPath(String outputPath) {
            this.outputPath = outputPath;
        }

        public int getLoraRank() {
            return loraRank;
        }

        public void setLoraRank(int loraRank) {
            this.loraRank = loraRank;
        }

        public float getLoraAlpha() {
            return loraAlpha;
        }

        public void setLoraAlpha(float loraAlpha) {
            this.loraAlpha = loraAlpha;
        }

        public float getLearningRate() {
            return learningRate;
        }

        public void setLearningRate(float learningRate) {
            this.learningRate = learningRate;
        }

        public int getEpochs() {
            return epochs;
        }

        public void setEpochs(int epochs) {
            this.epochs = epochs;
        }

        public int getBatchSize() {
            return batchSize;
        }

        public void setBatchSize(int batchSize) {
            this.batchSize = batchSize;
        }

        public float getDropout() {
            return dropout;
        }

        public void setDropout(float dropout) {
            this.dropout = dropout;
        }

        public int getContextLength() {
            return contextLength;
        }

        public void setContextLength(int contextLength) {
            this.contextLength = contextLength;
        }
    }

    public static class TrainLogEntry {

        private long timestamp;
        private TrainState state;
        private String message;
        private float loss;

        public TrainLogEntry(long timestamp, TrainState state, String message, float loss) {
            this.timestamp = timestamp;
            this.state = state;
            this.message = message;
            this.loss = loss;
        }

        public long getTimestamp() {
            return timestamp;
        }

        public TrainState getState() {
            return state;
        }

        public String getMessage() {
            return message;
        }

        public float getLoss() {
            return loss;
        }
    }

    public interface LoraTrainListener {
        void onStateChanged(TrainState state);
        void onProgress(float progress);
        void onLog(TrainLogEntry entry);
        void onError(String error);
        void onCompleted(String outputPath);
    }
}
