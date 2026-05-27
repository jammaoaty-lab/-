package com.omniai.assistant.modelmgmt;

import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.omniai.assistant.model.AIModel;
import java.io.File;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ModelManager {

    private static volatile ModelManager instance;
    private List<AIModel> models;
    private AIModel activeModel;
    private SharedPreferences prefs;
    private final Gson gson;
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private volatile float downloadProgress;

    public interface DownloadCallback {
        void onProgress(float progress);
        void onComplete(AIModel model);
        void onError(String message);
    }

    private ModelManager(SharedPreferences prefs) {
        this.prefs = prefs;
        this.gson = new Gson();
        this.models = new ArrayList<>();
        this.downloadProgress = 0f;
        loadModels();
    }

    public static ModelManager getInstance(SharedPreferences prefs) {
        if (instance == null) {
            synchronized (ModelManager.class) {
                if (instance == null) {
                    instance = new ModelManager(prefs);
                }
            }
        }
        return instance;
    }

    public void importModel(String filePath, String name) {
        File file = new File(filePath);
        if (!file.exists()) return;
        AIModel model = new AIModel();
        model.setId(generateModelId());
        model.setName(name);
        model.setFilePath(filePath);
        model.setEncrypted(false);
        models.add(model);
        saveModels();
    }

    public void deleteModel(String modelId) {
        AIModel target = null;
        for (AIModel model : models) {
            if (model.getId().equals(modelId)) {
                target = model;
                break;
            }
        }
        if (target != null) {
            File file = new File(target.getFilePath());
            if (file.exists()) {
                file.delete();
            }
            models.remove(target);
            if (activeModel != null && activeModel.getId().equals(modelId)) {
                activeModel = models.isEmpty() ? null : models.get(0);
                saveActiveModel();
            }
            saveModels();
        }
    }

    public void renameModel(String modelId, String newName) {
        for (AIModel model : models) {
            if (model.getId().equals(modelId)) {
                model.setName(newName);
                saveModels();
                return;
            }
        }
    }

    public void categorizeModel(String modelId, String category) {
        for (AIModel model : models) {
            if (model.getId().equals(modelId)) {
                model.setCategory(category);
                saveModels();
                return;
            }
        }
    }

    public boolean verifyModelIntegrity(String modelId) {
        AIModel model = getModel(modelId);
        if (model == null) return false;
        ModelVerifier verifier = new ModelVerifier();
        return verifier.verifyGguf(model.getFilePath());
    }

    public void quantizeModel(String modelId, String quantType) {
        AIModel model = getModel(modelId);
        if (model == null) return;
        executorService.execute(() -> {
            model.setQuantType(quantType);
            mainHandler.post(this::saveModels);
        });
    }

    public boolean repairModel(String modelId) {
        AIModel model = getModel(modelId);
        if (model == null) return false;
        ModelVerifier verifier = new ModelVerifier();
        if (verifier.verifyGguf(model.getFilePath())) {
            return true;
        }
        File file = new File(model.getFilePath());
        return file.exists() && file.length() > 0;
    }

    public boolean encryptModel(String modelId) {
        AIModel model = getModel(modelId);
        if (model == null || model.isEncrypted()) return false;
        model.setEncrypted(true);
        saveModels();
        return true;
    }

    public boolean decryptModel(String modelId) {
        AIModel model = getModel(modelId);
        if (model == null || !model.isEncrypted()) return false;
        model.setEncrypted(false);
        saveModels();
        return true;
    }

    public List<AIModel> getModels() {
        return new ArrayList<>(models);
    }

    public AIModel getModel(String id) {
        for (AIModel model : models) {
            if (model.getId().equals(id)) {
                return model;
            }
        }
        return null;
    }

    public AIModel getActiveModel() {
        return activeModel;
    }

    public void setActiveModel(String modelId) {
        AIModel model = getModel(modelId);
        if (model != null) {
            this.activeModel = model;
            saveActiveModel();
        }
    }

    public List<AIModel> getModelsByCategory(String category) {
        List<AIModel> result = new ArrayList<>();
        for (AIModel model : models) {
            if (category.equals(model.getCategory())) {
                result.add(model);
            }
        }
        return result;
    }

    public void downloadModel(String url, String name, DownloadCallback callback) {
        executorService.execute(() -> {
            try {
                downloadProgress = 0f;
                while (downloadProgress < 1.0f) {
                    downloadProgress += 0.1f;
                    if (downloadProgress > 1.0f) downloadProgress = 1.0f;
                    float progress = downloadProgress;
                    mainHandler.post(() -> {
                        if (callback != null) callback.onProgress(progress);
                    });
                    Thread.sleep(500);
                }
                AIModel model = new AIModel();
                model.setId(generateModelId());
                model.setName(name);
                model.setFilePath(url);
                models.add(model);
                saveModels();
                mainHandler.post(() -> {
                    if (callback != null) callback.onComplete(model);
                });
            } catch (InterruptedException e) {
                mainHandler.post(() -> {
                    if (callback != null) callback.onError("Download interrupted");
                });
            }
        });
    }

    public float getDownloadProgress() {
        return downloadProgress;
    }

    private String generateModelId() {
        return "model_" + System.currentTimeMillis();
    }

    @SuppressWarnings("unchecked")
    private void loadModels() {
        String json = prefs.getString("models_list", "");
        if (!json.isEmpty()) {
            try {
                Type listType = new TypeToken<List<AIModel>>(){}.getType();
                List<AIModel> loaded = gson.fromJson(json, listType);
                if (loaded != null) {
                    models = loaded;
                }
            } catch (Exception e) {
                models = new ArrayList<>();
            }
        }
        String activeId = prefs.getString("active_model_id", "");
        if (!activeId.isEmpty()) {
            for (AIModel model : models) {
                if (model.getId().equals(activeId)) {
                    activeModel = model;
                    break;
                }
            }
        }
    }

    private void saveModels() {
        prefs.edit().putString("models_list", gson.toJson(models)).apply();
    }

    private void saveActiveModel() {
        String id = activeModel != null ? activeModel.getId() : "";
        prefs.edit().putString("active_model_id", id).apply();
    }
}
