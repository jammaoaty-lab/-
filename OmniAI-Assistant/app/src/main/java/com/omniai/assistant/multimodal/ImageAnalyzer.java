package com.omniai.assistant.multimodal;

import android.app.ActivityManager;

import com.omniai.assistant.inference.VisionInferenceEngine;

import java.io.File;
import java.util.Arrays;
import java.util.List;

public class ImageAnalyzer {

    private VisionInferenceEngine visionEngine;
    private boolean isInitialized;
    private android.content.Context context;

    private static final long MAX_IMAGE_SIZE = 20 * 1024 * 1024;
    private static final List<String> SUPPORTED_FORMATS = Arrays.asList("jpg", "jpeg", "png", "webp");

    public interface ImageCallback {
        void onSuccess(String result);
        void onError(String error);
    }

    public ImageAnalyzer() {
        this.isInitialized = false;
        this.visionEngine = null;
    }

    public void initialize() {
        visionEngine = VisionInferenceEngine.getInstance();
        isInitialized = true;
    }

    public void setContext(android.content.Context context) {
        this.context = context.getApplicationContext();
    }

    public String analyze(String imagePath, String question) {
        if (!isInitialized || visionEngine == null) {
            throw new IllegalStateException("Image analyzer not initialized");
        }
        if (!validateImageFile(imagePath)) {
            throw new IllegalArgumentException("Invalid image file");
        }
        checkMemoryBeforeInference();
        final String[] result = new String[1];
        final Exception[] error = new Exception[1];
        Thread thread = new Thread(() -> {
            try {
                result[0] = visionEngine.visionChat(imagePath, question, new VisionInferenceEngine.VisionCallback() {
                    @Override
                    public void onSuccess(String res) {
                        result[0] = res;
                    }

                    @Override
                    public void onError(String err) {
                        error[0] = new RuntimeException(err);
                    }
                });
            } catch (Exception e) {
                error[0] = e;
            }
        });
        thread.start();
        try {
            thread.join(60000);
        } catch (InterruptedException e) {
            throw new RuntimeException("Analysis interrupted", e);
        }
        if (error[0] != null) {
            throw new RuntimeException(error[0].getMessage());
        }
        return result[0] != null ? result[0] : "";
    }

    public String describe(String imagePath) {
        if (!isInitialized || visionEngine == null) {
            throw new IllegalStateException("Image analyzer not initialized");
        }
        if (!validateImageFile(imagePath)) {
            throw new IllegalArgumentException("Invalid image file");
        }
        checkMemoryBeforeInference();
        final String[] result = new String[1];
        final Exception[] error = new Exception[1];
        Thread thread = new Thread(() -> {
            try {
                result[0] = visionEngine.visionChat(imagePath, "Describe this image in detail.", new VisionInferenceEngine.VisionCallback() {
                    @Override
                    public void onSuccess(String res) {
                        result[0] = res;
                    }

                    @Override
                    public void onError(String err) {
                        error[0] = new RuntimeException(err);
                    }
                });
            } catch (Exception e) {
                error[0] = e;
            }
        });
        thread.start();
        try {
            thread.join(60000);
        } catch (InterruptedException e) {
            throw new RuntimeException("Description interrupted", e);
        }
        if (error[0] != null) {
            throw new RuntimeException(error[0].getMessage());
        }
        return result[0] != null ? result[0] : "";
    }

    public void analyzeWithQuestion(String imagePath, String question, ImageCallback callback) {
        if (callback == null) return;
        if (!isInitialized || visionEngine == null) {
            callback.onError("Image analyzer not initialized");
            return;
        }
        if (!validateImageFile(imagePath)) {
            callback.onError("Invalid image file: does not exist, unsupported format, or exceeds 20MB");
            return;
        }
        if (!checkMemoryForCallback()) {
            callback.onError("Insufficient memory for image analysis");
            return;
        }
        visionEngine.visionChat(imagePath, question, new VisionInferenceEngine.VisionCallback() {
            @Override
            public void onSuccess(String result) {
                callback.onSuccess(result);
            }

            @Override
            public void onError(String error) {
                callback.onError(error);
            }
        });
    }

    public boolean isInitialized() {
        return isInitialized;
    }

    private boolean validateImageFile(String imagePath) {
        if (imagePath == null || imagePath.isEmpty()) return false;
        File file = new File(imagePath);
        if (!file.exists()) return false;
        if (file.length() > MAX_IMAGE_SIZE) return false;
        String extension = getImageExtension(imagePath);
        return !extension.isEmpty() && SUPPORTED_FORMATS.contains(extension.toLowerCase());
    }

    private String getImageExtension(String path) {
        int dotIndex = path.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < path.length() - 1) {
            return path.substring(dotIndex + 1).toLowerCase();
        }
        return "";
    }

    private void checkMemoryBeforeInference() {
        if (context == null) return;
        ActivityManager am = (ActivityManager) context.getSystemService(android.content.Context.ACTIVITY_SERVICE);
        if (am != null) {
            ActivityManager.MemoryInfo mi = new ActivityManager.MemoryInfo();
            am.getMemoryInfo(mi);
            if (mi.availMem < 512L * 1024 * 1024) {
                throw new RuntimeException("Insufficient memory for inference");
            }
        }
    }

    private boolean checkMemoryForCallback() {
        if (context == null) return true;
        ActivityManager am = (ActivityManager) context.getSystemService(android.content.Context.ACTIVITY_SERVICE);
        if (am != null) {
            ActivityManager.MemoryInfo mi = new ActivityManager.MemoryInfo();
            am.getMemoryInfo(mi);
            return mi.availMem >= 512L * 1024 * 1024;
        }
        return true;
    }
}
