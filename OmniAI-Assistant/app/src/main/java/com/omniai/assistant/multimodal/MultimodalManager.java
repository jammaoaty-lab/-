package com.omniai.assistant.multimodal;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;

import java.util.ArrayList;
import java.util.List;

public class MultimodalManager {

    private static MultimodalManager instance;

    private OcrEngine ocrEngine;
    private SpeechRecognizer speechRecognizer;
    private TtsEngine ttsEngine;
    private ImageAnalyzer imageAnalyzer;
    private Context context;
    private Handler handler;

    private MultimodalManager(Context context) {
        this.context = context.getApplicationContext();
        this.handler = new Handler(Looper.getMainLooper());
        this.ocrEngine = new OcrEngine();
        this.speechRecognizer = new SpeechRecognizer(context);
        this.ttsEngine = new TtsEngine();
        this.imageAnalyzer = new ImageAnalyzer();
    }

    public static synchronized MultimodalManager getInstance(Context context) {
        if (instance == null) {
            instance = new MultimodalManager(context);
        }
        return instance;
    }

    public void recognizeImage(String imagePath, ImageCallback callback) {
        if (imageAnalyzer == null || !imageAnalyzer.isInitialized()) {
            if (callback != null) {
                callback.onError("Image analyzer not initialized");
            }
            return;
        }
        new Thread(() -> {
            try {
                String description = imageAnalyzer.describe(imagePath);
                handler.post(() -> {
                    if (callback != null) {
                        callback.onSuccess(description);
                    }
                });
            } catch (Exception e) {
                handler.post(() -> {
                    if (callback != null) {
                        callback.onError(e.getMessage());
                    }
                });
            }
        }).start();
    }

    public void extractOcr(String imagePath, OcrCallback callback) {
        if (ocrEngine == null || !ocrEngine.isInitialized()) {
            if (callback != null) {
                callback.onError("OCR engine not initialized");
            }
            return;
        }
        new Thread(() -> {
            try {
                String text = ocrEngine.recognize(imagePath);
                handler.post(() -> {
                    if (callback != null) {
                        callback.onSuccess(text);
                    }
                });
            } catch (Exception e) {
                handler.post(() -> {
                    if (callback != null) {
                        callback.onError(e.getMessage());
                    }
                });
            }
        }).start();
    }

    public void startVoiceRecognition(VoiceCallback callback) {
        if (speechRecognizer == null) {
            if (callback != null) {
                callback.onError("Speech recognizer not initialized");
            }
            return;
        }
        speechRecognizer.startListening();
    }

    public void stopVoiceRecognition() {
        if (speechRecognizer != null) {
            speechRecognizer.stopListening();
        }
    }

    public void synthesizeSpeech(String text, String voiceId, TtsCallback callback) {
        if (ttsEngine == null || !ttsEngine.isReady()) {
            if (callback != null) {
                callback.onError("TTS engine not ready");
            }
            return;
        }
        ttsEngine.speak(text, voiceId, new TtsEngine.UtteranceCallback() {
            @Override
            public void onStart() {
                handler.post(() -> {
                    if (callback != null) {
                        callback.onStart();
                    }
                });
            }

            @Override
            public void onComplete() {
                handler.post(() -> {
                    if (callback != null) {
                        callback.onComplete();
                    }
                });
            }

            @Override
            public void onError(String error) {
                handler.post(() -> {
                    if (callback != null) {
                        callback.onError(error);
                    }
                });
            }
        });
    }

    public void analyzeImage(String imagePath, String question, ImageCallback callback) {
        if (imageAnalyzer == null || !imageAnalyzer.isInitialized()) {
            if (callback != null) {
                callback.onError("Image analyzer not initialized");
            }
            return;
        }
        new Thread(() -> {
            try {
                String result = imageAnalyzer.analyze(imagePath, question);
                handler.post(() -> {
                    if (callback != null) {
                        callback.onSuccess(result);
                    }
                });
            } catch (Exception e) {
                handler.post(() -> {
                    if (callback != null) {
                        callback.onError(e.getMessage());
                    }
                });
            }
        }).start();
    }

    public List<String> getAvailableVoices() {
        if (ttsEngine != null && ttsEngine.isReady()) {
            return ttsEngine.getAvailableVoices();
        }
        return new ArrayList<>();
    }

    public OcrEngine getOcrEngine() {
        return ocrEngine;
    }

    public SpeechRecognizer getSpeechRecognizer() {
        return speechRecognizer;
    }

    public TtsEngine getTtsEngine() {
        return ttsEngine;
    }

    public ImageAnalyzer getImageAnalyzer() {
        return imageAnalyzer;
    }

    public void shutdown() {
        if (ocrEngine != null) {
            ocrEngine.shutdown();
        }
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
        }
        if (ttsEngine != null) {
            ttsEngine.shutdown();
        }
    }

    public interface ImageCallback {
        void onSuccess(String description);
        void onError(String error);
    }

    public interface OcrCallback {
        void onSuccess(String text);
        void onError(String error);
    }

    public interface VoiceCallback {
        void onResult(String text);
        void onPartial(String text);
        void onError(String error);
    }

    public interface TtsCallback {
        void onStart();
        void onComplete();
        void onError(String error);
    }
}
