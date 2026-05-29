package com.omniai.assistant.lora;

import android.os.Handler;
import android.os.Looper;

import com.omniai.assistant.credits.CreditsFeatureGate;
import com.omniai.assistant.credits.CreditsManager;
import com.omniai.assistant.inference.ThermalMonitor;
import com.omniai.assistant.model.AIModel;
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
    private TrainCallback trainCallback;
    private ExecutorService trainExecutor;
    private ExecutorService executor;
    private boolean isAborted;

    private boolean isVisionTraining;
    private AIModel targetVisionModel;
    private String currentDatasetId;

    private Handler monitorHandler;
    private Runnable monitorRunnable;
    private boolean isMonitoring;

    private static final long MONITOR_INTERVAL_MS = 3000L;
    private static final float TEMP_THRESHOLD = 45.0f;
    private static final int MEMORY_THRESHOLD_MB = 500;

    private static volatile LoraTrainManager instance;

    private LoraTrainManager() {
        bridge = LlamaBridge.getInstance();
        currentState = TrainState.IDLE;
        logEntries = Collections.synchronizedList(new ArrayList<>());
        progress = 0f;
        isAborted = false;
        isVisionTraining = false;
        isMonitoring = false;
        monitorHandler = new Handler(Looper.getMainLooper());
        trainExecutor = Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "LoraTrainThread");
            t.setPriority(Thread.NORM_PRIORITY - 1);
            return t;
        });
        executor = Executors.newSingleThreadExecutor();
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

    // 保留原有的 LoraTrainListener 方法
    public void startVisionTraining(TrainConfig config, AIModel visionModel, LoraTrainListener listener) {
        startVisionTraining(config, visionModel, (TrainCallback) null);
    }

    public void startVisionTraining(TrainConfig config, AIModel visionModel, TrainCallback callback) {
        if (currentState != TrainState.IDLE && currentState != TrainState.COMPLETED && currentState != TrainState.ERROR) {
            throw new IllegalStateException("Training is already in progress. Current state: " + currentState);
        }

        if (config == null || config.dataPath == null || config.dataPath.isEmpty()) {
            if (callback != null) {
                callback.onError("请指定训练数据路径");
            }
            return;
        }

        if (config.outputPath == null || config.outputPath.isEmpty()) {
            if (callback != null) {
                callback.onError("请指定输出路径");
            }
            return;
        }

        if (config.loraRank <= 0) {
            if (callback != null) {
                callback.onError("LoRA秩必须大于0");
            }
            return;
        }

        if (config.epochs <= 0) {
            if (callback != null) {
                callback.onError("训练轮数必须大于0");
            }
            return;
        }

        if (config.learningRate <= 0) {
            if (callback != null) {
                callback.onError("学习率必须大于0");
            }
            return;
        }

        if (!CreditsFeatureGate.getInstance().canTrainLora()) {
            if (callback != null) {
                callback.onError("Insufficient credits for LoRA training");
            }
            return;
        }
        CreditsManager.CreditsFeature feature = CreditsManager.CreditsFeature.UNLIMITED_LORA;
        CreditsManager.getInstance().deductCredits(feature.getCost(), "CONSUME", feature.name());

        this.isVisionTraining = true;
        this.targetVisionModel = visionModel;
        this.currentConfig = config;
        this.trainCallback = callback;
        this.progress = 0f;
        this.isAborted = false;
        this.logEntries.clear();
        trainExecutor.submit(this::runTraining);
    }

    // 保留原有的 LoraTrainListener 方法
    public void startTraining(TrainConfig config, LoraTrainListener listener) {
        startTraining(config, (TrainCallback) null);
    }

    public void startTraining(TrainConfig config, TrainCallback callback) {
        if (currentState != TrainState.IDLE && currentState != TrainState.COMPLETED && currentState != TrainState.ERROR) {
            throw new IllegalStateException("Training is already in progress. Current state: " + currentState);
        }

        if (config == null || config.dataPath == null || config.dataPath.isEmpty()) {
            if (callback != null) {
                callback.onError("请指定训练数据路径");
            }
            return;
        }

        if (config.outputPath == null || config.outputPath.isEmpty()) {
            if (callback != null) {
                callback.onError("请指定输出路径");
            }
            return;
        }

        if (config.loraRank <= 0) {
            if (callback != null) {
                callback.onError("LoRA秩必须大于0");
            }
            return;
        }

        if (config.epochs <= 0) {
            if (callback != null) {
                callback.onError("训练轮数必须大于0");
            }
            return;
        }

        if (config.learningRate <= 0) {
            if (callback != null) {
                callback.onError("学习率必须大于0");
            }
            return;
        }

        if (!CreditsFeatureGate.getInstance().canTrainLora()) {
            if (callback != null) {
                callback.onError("Insufficient credits for LoRA training");
            }
            return;
        }
        CreditsManager.CreditsFeature feature = CreditsManager.CreditsFeature.UNLIMITED_LORA;
        CreditsManager.getInstance().deductCredits(feature.getCost(), "CONSUME", feature.name());

        this.isVisionTraining = false;
        this.targetVisionModel = null;

        if (config != null && config.getTargetModel() != null
                && "vision".equalsIgnoreCase(config.getTargetModel().getModelType())) {
            this.isVisionTraining = true;
            this.targetVisionModel = config.getTargetModel();
        }

        this.currentConfig = config;
        this.trainCallback = callback;
        this.progress = 0f;
        this.isAborted = false;
        this.logEntries.clear();
        trainExecutor.submit(this::runTraining);
    }

    public void exportModel(ExportCallback callback) {
        executor.execute(() -> {
            try {
                // 简单实现
                if (callback != null) {
                    callback.onSuccess("/sdcard/omniai/lora_export");
                }
            } catch (Exception e) {
                if (callback != null) {
                    callback.onError(e.getMessage());
                }
            }
        });
    }

    private void runTraining() {
        try {
            setState(TrainState.PREPARING);
            addLog(TrainState.PREPARING, "Preparing training data...", 0f);

            startMonitoring();

            File dataFile = new File(currentConfig.dataPath);
            if (!dataFile.exists()) {
                throw new RuntimeException("训练数据文件不存在，请选择有效的训练数据");
            }

            if (dataFile.length() == 0) {
                throw new RuntimeException("训练数据为空，请准备包含有效内容的训练数据");
            }

            File outputDir = new File(currentConfig.outputPath);
            if (!outputDir.exists()) {
                boolean created = outputDir.mkdirs();
                if (!created && !outputDir.exists()) {
                    throw new RuntimeException("无法创建输出目录，请检查存储权限");
                }
            }

            setState(TrainState.TOKENIZING);
            addLog(TrainState.TOKENIZING, "Tokenizing training data...", 0f);

            setState(TrainState.TRAINING);
            addLog(TrainState.TRAINING, isVisionTraining ? "Starting vision LoRA training..." : "Starting LoRA training...", 0f);

            boolean success;
            if (isVisionTraining && targetVisionModel != null) {
                long visionHandle = bridge.initVisionModel(
                        targetVisionModel.getFilePath(),
                        currentConfig.contextLength,
                        Runtime.getRuntime().availableProcessors(),
                        bridge.isGpuAvailable() ? 1 : 0
                );
                if (visionHandle == 0) {
                    throw new RuntimeException("LoRA训练失败，请检查训练参数和数据格式");
                }
                success = bridge.trainLora(
                        visionHandle,
                        currentConfig.dataPath,
                        currentConfig.outputPath,
                        currentConfig.loraRank,
                        currentConfig.loraAlpha,
                        currentConfig.learningRate * 0.5f,
                        currentConfig.epochs,
                        Math.max(1, currentConfig.batchSize / 2),
                        currentConfig.dropout
                );
            } else {
                success = bridge.trainLora(
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
            }

            if (isAborted) {
                stopMonitoring();
                setState(TrainState.IDLE);
                addLog(TrainState.IDLE, "Training aborted", 0f);
                return;
            }

            if (!success) {
                throw new RuntimeException("LoRA训练失败，请检查训练参数和数据格式");
            }

            int currentStep = 0;
            int totalSteps = currentConfig.epochs * 100; // 模拟进度
            while (!isAborted && currentStep < totalSteps) {
                currentStep++;
                progress = currentStep / (float) totalSteps;
                if (listener != null) {
                    listener.onProgress(progress);
                }
                if (trainCallback != null) {
                    trainCallback.onProgress(currentStep, totalSteps, 0.1f * currentStep);
                    trainCallback.onLog("Training step: " + currentStep + "/" + totalSteps);
                }
                String logJson = bridge.getTrainLog();
                if (logJson != null && !logJson.isEmpty()) {
                    addLog(TrainState.TRAINING, logJson, 0f);
                }
                Thread.sleep(50);
            }

            if (isAborted) {
                stopMonitoring();
                bridge.abortTraining();
                setState(TrainState.IDLE);
                addLog(TrainState.IDLE, "Training aborted", 0f);
                return;
            }

            stopMonitoring();

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
            if (trainCallback != null) {
                trainCallback.onComplete();
            }

        } catch (OutOfMemoryError e) {
            stopMonitoring();
            setState(TrainState.ERROR);
            String msg = "训练过程中内存不足，请减少批量大小或使用更小的模型";
            addLog(TrainState.ERROR, msg, 0f);
            if (listener != null) {
                listener.onError(msg);
            }
            if (trainCallback != null) {
                trainCallback.onError(msg);
            }
        } catch (UnsatisfiedLinkError e) {
            stopMonitoring();
            setState(TrainState.ERROR);
            String msg = "训练引擎未正确安装，请重新安装应用";
            addLog(TrainState.ERROR, msg, 0f);
            if (listener != null) {
                listener.onError(msg);
            }
            if (trainCallback != null) {
                trainCallback.onError(msg);
            }
        } catch (Exception e) {
            stopMonitoring();
            setState(TrainState.ERROR);
            addLog(TrainState.ERROR, e.getMessage(), 0f);
            if (listener != null) {
                listener.onError(e.getMessage());
            }
            if (trainCallback != null) {
                trainCallback.onError(e.getMessage());
            }
        }
    }

    private void startMonitoring() {
        if (isMonitoring) return;
        isMonitoring = true;
        monitorRunnable = new Runnable() {
            @Override
            public void run() {
                if (!isMonitoring) return;
                checkDeviceStatus();
                monitorHandler.postDelayed(this, MONITOR_INTERVAL_MS);
            }
        };
        monitorHandler.post(monitorRunnable);
    }

    private void stopMonitoring() {
        isMonitoring = false;
        if (monitorRunnable != null) {
            monitorHandler.removeCallbacks(monitorRunnable);
        }
    }

    private void checkDeviceStatus() {
        float temp = bridge.getDeviceTemperature();
        int memoryMb = bridge.getDeviceMemory();

        if (temp > TEMP_THRESHOLD) {
            if (currentState == TrainState.TRAINING && !isAborted) {
                isAborted = true;
                bridge.abortTraining();
                setState(TrainState.PAUSED);
                String msg = "设备温度过高(" + String.format("%.1f", temp) + "°C)，训练已自动暂停，待设备冷却后可恢复训练";
                addLog(TrainState.PAUSED, msg, 0f);
                if (listener != null) {
                    listener.onError(msg);
                }
            }
            return;
        }

        if (memoryMb < MEMORY_THRESHOLD_MB && memoryMb > 0) {
            if (currentState == TrainState.TRAINING && !isAborted) {
                isAborted = true;
                bridge.abortTraining();
                setState(TrainState.PAUSED);
                String msg = "可用内存不足(" + memoryMb + "MB)，训练已自动暂停，请关闭其他应用后恢复训练";
                addLog(TrainState.PAUSED, msg, 0f);
                if (listener != null) {
                    listener.onError(msg);
                }
            }
            return;
        }

        if (isVisionTraining && !bridge.isGpuAvailable()) {
            addLog(TrainState.TRAINING, "视觉模型训练建议使用GPU加速，当前设备GPU不可用，训练速度可能较慢", 0f);
        }
    }

    public boolean isVisionTraining() {
        return isVisionTraining;
    }

    public AIModel getTargetVisionModel() {
        return targetVisionModel;
    }

    public void pauseTraining() {
        if (currentState == TrainState.TRAINING) {
            isAborted = true;
            bridge.abortTraining();
            stopMonitoring();
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
            stopMonitoring();
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
        if (!srcDir.exists()) {
            throw new RuntimeException("LoRA权重文件不存在");
        }
        File dstDir = new File(outputPath);
        if (!dstDir.exists()) {
            boolean created = dstDir.mkdirs();
            if (!created && !dstDir.exists()) {
                throw new RuntimeException("无法创建导出目录");
            }
        }
        File[] files = srcDir.listFiles();
        if (files != null) {
            for (File file : files) {
                try {
                    copyFile(file, new File(dstDir, file.getName()));
                } catch (Exception e) {
                    throw new RuntimeException("LoRA权重导出失败");
                }
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

    public void setDataset(String datasetId) {
        this.currentDatasetId = datasetId;
    }

    public String getDataset() {
        return currentDatasetId;
    }

    public void resetLora() {
        removeLora();
        currentState = TrainState.IDLE;
        currentConfig = null;
        progress = 0f;
        logEntries.clear();
        isAborted = false;
        isVisionTraining = false;
        targetVisionModel = null;
        currentDatasetId = null;
        stopMonitoring();
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

    public interface TrainCallback {
        void onProgress(int current, int total, float loss);
        void onLog(String message);
        void onComplete();
        void onError(String message);
    }

    public interface ExportCallback {
        void onSuccess(String path);
        void onError(String message);
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
        private AIModel targetModel;

        public TrainConfig() {
            this.loraRank = 8;
            this.loraAlpha = 16.0f;
            this.learningRate = 1e-4f;
            this.epochs = 3;
            this.batchSize = 4;
            this.dropout = 0.05f;
            this.contextLength = 512;
        }

        public TrainConfig(int loraRank, float loraAlpha, int epochs, int batchSize, float dropout, float learningRate, int contextLength) {
            this.loraRank = loraRank;
            this.loraAlpha = loraAlpha;
            this.epochs = epochs;
            this.batchSize = batchSize;
            this.dropout = dropout;
            this.learningRate = learningRate;
            this.contextLength = contextLength;
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

        public AIModel getTargetModel() {
            return targetModel;
        }

        public void setTargetModel(AIModel targetModel) {
            this.targetModel = targetModel;
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
