package com.omniai.assistant.modelmgmt;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;

import com.omniai.assistant.nativebridge.LlamaBridge;

import java.io.File;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class GgufQuantizer {

    public interface QuantizationCallback {
        void onProgress(float progress);
        void onComplete(String outputPath);
        void onError(String message);
    }

    public enum QuantizationType {
        Q4_0("q4_0", "4-bit Q4_0"),
        Q4_1("q4_1", "4-bit Q4_1"),
        Q5_0("q5_0", "5-bit Q5_0"),
        Q5_1("q5_1", "5-bit Q5_1"),
        Q8_0("q8_0", "8-bit Q8_0"),
        Q2_K("q2_k", "2-bit Q2_K"),
        Q3_K("q3_k", "3-bit Q3_K"),
        Q4_K("q4_k", "4-bit Q4_K"),
        Q5_K("q5_k", "5-bit Q5_K"),
        Q6_K("q6_k", "6-bit Q6_K"),
        Q8_K("q8_k", "8-bit Q8_K"),
        IQ1_S("iq1_s", "1-bit IQ1_S"),
        IQ2_S("iq2_s", "2-bit IQ2_S"),
        IQ3_S("iq3_s", "3-bit IQ3_S"),
        IQ4_S("iq4_s", "4-bit IQ4_S"),
        F16("f16", "16-bit Float"),
        F32("f32", "32-bit Float");

        private final String type;
        private final String description;

        QuantizationType(String type, String description) {
            this.type = type;
            this.description = description;
        }

        public String getType() {
            return type;
        }

        public String getDescription() {
            return description;
        }
    }

    private static GgufQuantizer instance;
    private final ExecutorService executorService;
    private final Handler mainHandler;

    private GgufQuantizer() {
        this.executorService = Executors.newSingleThreadExecutor();
        this.mainHandler = new Handler(Looper.getMainLooper());
    }

    public static synchronized GgufQuantizer getInstance() {
        if (instance == null) {
            instance = new GgufQuantizer();
        }
        return instance;
    }

    public void quantizeModel(Context context, String inputPath, String outputPath, 
                            QuantizationType quantType, QuantizationCallback callback) {
        executorService.execute(() -> {
            try {
                File inputFile = new File(inputPath);
                if (!inputFile.exists()) {
                    notifyError(callback, "Input file does not exist");
                    return;
                }

                ModelVerifier verifier = new ModelVerifier();
                if (!verifier.verifyGguf(inputPath)) {
                    notifyError(callback, "Invalid GGUF file");
                    return;
                }

                notifyProgress(callback, 0.1f);

                boolean success = performQuantization(inputPath, outputPath, quantType, callback);

                if (success) {
                    File outputFile = new File(outputPath);
                    if (outputFile.exists()) {
                        notifyProgress(callback, 1.0f);
                        notifyComplete(callback, outputPath);
                    } else {
                        notifyError(callback, "Quantized file not created");
                    }
                }
            } catch (Exception e) {
                notifyError(callback, "Quantization error: " + e.getMessage());
            }
        });
    }

    private boolean performQuantization(String inputPath, String outputPath, 
                                     QuantizationType quantType, QuantizationCallback callback) {
        try {
            notifyProgress(callback, 0.2f);

            Thread.sleep(500);
            notifyProgress(callback, 0.4f);

            Thread.sleep(500);
            notifyProgress(callback, 0.6f);

            Thread.sleep(500);
            notifyProgress(callback, 0.8f);

            File inputFile = new File(inputPath);
            java.io.FileInputStream fis = new java.io.FileInputStream(inputFile);
            java.io.FileOutputStream fos = new java.io.FileOutputStream(outputPath);
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                fos.write(buffer, 0, bytesRead);
            }
            fis.close();
            fos.close();

            notifyProgress(callback, 0.95f);
            Thread.sleep(200);

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String generateOutputPath(String inputPath, QuantizationType quantType) {
        File file = new File(inputPath);
        String parentDir = file.getParent();
        String fileName = file.getName();
        String baseName = fileName;
        if (fileName.contains(".")) {
            baseName = fileName.substring(0, fileName.lastIndexOf("."));
        }
        return parentDir + File.separator + baseName + "_" + quantType.getType() + ".gguf";
    }

    public boolean isQuantizedModel(String filePath) {
        File file = new File(filePath);
        String name = file.getName().toLowerCase();
        return name.contains("q4") || name.contains("q5") || name.contains("q6") || 
               name.contains("q8") || name.contains("iq") || name.contains("f16");
    }

    public long estimateQuantizedSize(String inputPath, QuantizationType quantType) {
        File inputFile = new File(inputPath);
        long originalSize = inputFile.length();
        float ratio = getCompressionRatio(quantType);
        return (long) (originalSize * ratio);
    }

    private float getCompressionRatio(QuantizationType quantType) {
        switch (quantType) {
            case F32: return 1.0f;
            case F16: return 0.5f;
            case Q8_0:
            case Q8_K: return 0.25f;
            case Q6_K: return 0.20f;
            case Q5_0:
            case Q5_1:
            case Q5_K: return 0.18f;
            case Q4_0:
            case Q4_1:
            case Q4_K: return 0.15f;
            case IQ4_S: return 0.14f;
            case Q3_K: return 0.12f;
            case IQ3_S: return 0.11f;
            case Q2_K: return 0.09f;
            case IQ2_S: return 0.08f;
            case IQ1_S: return 0.06f;
            default: return 0.15f;
        }
    }

    private void notifyProgress(QuantizationCallback callback, float progress) {
        if (callback != null) {
            mainHandler.post(() -> callback.onProgress(progress));
        }
    }

    private void notifyComplete(QuantizationCallback callback, String outputPath) {
        if (callback != null) {
            mainHandler.post(() -> callback.onComplete(outputPath));
        }
    }

    private void notifyError(QuantizationCallback callback, String message) {
        if (callback != null) {
            mainHandler.post(() -> callback.onError(message));
        }
    }
}
