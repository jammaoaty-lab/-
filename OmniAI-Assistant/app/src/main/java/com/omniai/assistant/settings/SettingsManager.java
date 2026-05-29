package com.omniai.assistant.settings;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import com.omniai.assistant.BuildConfig;
import com.google.gson.Gson;
import java.io.File;

public class SettingsManager {

    private static volatile SettingsManager instance;
    private final SharedPreferences prefs;
    private final Gson gson;
    private final Context context;

    public static class AiSettings {
        public String defaultModel;
        public String defaultVisionModel;
        public String systemPrompt;
        public float temperature;
        public float topP;
        public int topK;
        public float repeatPenalty;

        public AiSettings() {
            this.defaultModel = "llama-3-8b";
            this.defaultVisionModel = "qwen3-vl-2b";
            this.systemPrompt = "";
            this.temperature = 0.7f;
            this.topP = 0.9f;
            this.topK = 40;
            this.repeatPenalty = 1.1f;
        }

        public AiSettings copy() {
            AiSettings copy = new AiSettings();
            copy.defaultModel = this.defaultModel;
            copy.defaultVisionModel = this.defaultVisionModel;
            copy.systemPrompt = this.systemPrompt;
            copy.temperature = this.temperature;
            copy.topP = this.topP;
            copy.topK = this.topK;
            copy.repeatPenalty = this.repeatPenalty;
            return copy;
        }
    }

    public static class InferenceSettings {
        public int nThreads;
        public int nCtx;
        public boolean useMmap;
        public boolean useGpu;
        public InferenceSpeedMode speedMode;

        public InferenceSettings() {
            this.nThreads = 4;
            this.nCtx = 4096;
            this.useMmap = true;
            this.useGpu = false;
            this.speedMode = InferenceSpeedMode.BALANCED;
        }

        public InferenceSettings copy() {
            InferenceSettings copy = new InferenceSettings();
            copy.nThreads = this.nThreads;
            copy.nCtx = this.nCtx;
            copy.useMmap = this.useMmap;
            copy.useGpu = this.useGpu;
            copy.speedMode = this.speedMode;
            return copy;
        }
    }

    public static class PrivacySettings {
        public boolean appLockEnabled;
        public boolean fingerprintEnabled;
        public boolean incognitoMode;
        public boolean encryptData;
        public boolean filterSensitive;
        public boolean visionGpuAcceleration;
        public boolean autoOcr;
        public boolean autoCleanImageCache;

        public PrivacySettings() {
            this.appLockEnabled = false;
            this.fingerprintEnabled = false;
            this.incognitoMode = false;
            this.encryptData = false;
            this.filterSensitive = true;
            this.visionGpuAcceleration = false;
            this.autoOcr = false;
            this.autoCleanImageCache = false;
        }

        public PrivacySettings copy() {
            PrivacySettings copy = new PrivacySettings();
            copy.appLockEnabled = this.appLockEnabled;
            copy.fingerprintEnabled = this.fingerprintEnabled;
            copy.incognitoMode = this.incognitoMode;
            copy.encryptData = this.encryptData;
            copy.filterSensitive = this.filterSensitive;
            copy.visionGpuAcceleration = this.visionGpuAcceleration;
            copy.autoOcr = this.autoOcr;
            copy.autoCleanImageCache = this.autoCleanImageCache;
            return copy;
        }
    }

    public static class NetworkSettings {
        public String cloudApiUrl;
        public String cloudApiKey;
        public int timeout;
        public boolean autoFallback;

        public NetworkSettings() {
            this.cloudApiUrl = BuildConfig.API_BASE_URL;
            this.cloudApiKey = "";
            this.timeout = 30;
            this.autoFallback = true;
        }

        public NetworkSettings copy() {
            NetworkSettings copy = new NetworkSettings();
            copy.cloudApiUrl = this.cloudApiUrl;
            copy.cloudApiKey = this.cloudApiKey;
            copy.timeout = this.timeout;
            copy.autoFallback = this.autoFallback;
            return copy;
        }
    }

    public interface CacheCallback {
        void onComplete();
    }

    public interface UpdateCallback {
        void onUpdateAvailable(String version);
        void onUpToDate();
        void onError(String message);
    }

    private SettingsManager(SharedPreferences prefs) {
        this.prefs = prefs;
        this.gson = new Gson();
        this.context = null;
    }

    private SettingsManager(Context context) {
        this.prefs = context.getSharedPreferences("omniai_settings", Context.MODE_PRIVATE);
        this.gson = new Gson();
        this.context = context;
    }

    public static SettingsManager getInstance(SharedPreferences prefs) {
        if (instance == null) {
            synchronized (SettingsManager.class) {
                if (instance == null) {
                    instance = new SettingsManager(prefs);
                }
            }
        }
        return instance;
    }

    public static SettingsManager getInstance(Context context) {
        if (instance == null) {
            synchronized (SettingsManager.class) {
                if (instance == null) {
                    instance = new SettingsManager(context);
                }
            }
        }
        return instance;
    }

    public AiSettings getAiSettings() {
        String json = prefs.getString("ai_settings", "");
        if (json.isEmpty()) return new AiSettings();
        try {
            return gson.fromJson(json, AiSettings.class);
        } catch (Exception e) {
            return new AiSettings();
        }
    }

    public void updateAiSettings(AiSettings settings) {
        prefs.edit().putString("ai_settings", gson.toJson(settings)).apply();
    }

    public InferenceSettings getInferenceSettings() {
        String json = prefs.getString("inference_settings", "");
        if (json.isEmpty()) return new InferenceSettings();
        try {
            return gson.fromJson(json, InferenceSettings.class);
        } catch (Exception e) {
            return new InferenceSettings();
        }
    }

    public void updateInferenceSettings(InferenceSettings settings) {
        prefs.edit().putString("inference_settings", gson.toJson(settings)).apply();
    }

    public boolean isGpuAccelerationEnabled() {
        return prefs.getBoolean("gpu_acceleration", false);
    }

    public void setGpuAccelerationEnabled(boolean enabled) {
        prefs.edit().putBoolean("gpu_acceleration", enabled).apply();
    }

    public PrivacySettings getPrivacySettings() {
        String json = prefs.getString("privacy_settings", "");
        if (json.isEmpty()) return new PrivacySettings();
        try {
            return gson.fromJson(json, PrivacySettings.class);
        } catch (Exception e) {
            return new PrivacySettings();
        }
    }

    public void updatePrivacySettings(PrivacySettings settings) {
        prefs.edit().putString("privacy_settings", gson.toJson(settings)).apply();
    }

    public NetworkSettings getNetworkSettings() {
        String json = prefs.getString("network_settings", "");
        if (json.isEmpty()) return new NetworkSettings();
        try {
            return gson.fromJson(json, NetworkSettings.class);
        } catch (Exception e) {
            return new NetworkSettings();
        }
    }

    public void updateNetworkSettings(NetworkSettings settings) {
        prefs.edit().putString("network_settings", gson.toJson(settings)).apply();
    }

    public boolean isDeveloperMode() {
        return prefs.getBoolean("developer_mode", false);
    }

    public void setDeveloperMode(boolean enabled) {
        prefs.edit().putBoolean("developer_mode", enabled).apply();
    }

    public boolean isAutoCleanupEnabled() {
        return prefs.getBoolean("auto_cleanup", true);
    }

    public void setAutoCleanupEnabled(boolean enabled) {
        prefs.edit().putBoolean("auto_cleanup", enabled).apply();
    }

    public boolean isIncognitoMode() {
        return prefs.getBoolean("incognito_mode", false);
    }

    public void setIncognitoMode(boolean enabled) {
        prefs.edit().putBoolean("incognito_mode", enabled).apply();
    }

    public boolean isCloudFallbackEnabled() {
        return prefs.getBoolean("cloud_fallback", true);
    }

    public void setCloudFallbackEnabled(boolean enabled) {
        prefs.edit().putBoolean("cloud_fallback", enabled).apply();
    }

    public boolean isVisionGpuEnabled() {
        PrivacySettings settings = getPrivacySettings();
        return settings.visionGpuAcceleration;
    }

    public void setVisionGpuEnabled(boolean enabled) {
        PrivacySettings settings = getPrivacySettings();
        settings.visionGpuAcceleration = enabled;
        updatePrivacySettings(settings);
    }

    public boolean isAutoOcr() {
        PrivacySettings settings = getPrivacySettings();
        return settings.autoOcr;
    }

    public void setAutoOcr(boolean enabled) {
        PrivacySettings settings = getPrivacySettings();
        settings.autoOcr = enabled;
        updatePrivacySettings(settings);
    }

    public String getDefaultVisionModel() {
        AiSettings settings = getAiSettings();
        return settings.defaultVisionModel;
    }

    public void setDefaultVisionModel(String modelId) {
        AiSettings settings = getAiSettings();
        settings.defaultVisionModel = modelId;
        updateAiSettings(settings);
    }

    public void resetToDefaults() {
        prefs.edit()
                .remove("ai_settings")
                .remove("inference_settings")
                .remove("gpu_acceleration")
                .remove("privacy_settings")
                .remove("network_settings")
                .remove("developer_mode")
                .remove("auto_cleanup")
                .remove("incognito_mode")
                .remove("cloud_fallback")
                .apply();
    }

    // 新增的所有缺失方法
    public String getLanguage() {
        return prefs.getString("language", "简体中文");
    }

    public void setLanguage(String language) {
        prefs.edit().putString("language", language).apply();
    }

    public String getTheme() {
        return prefs.getString("theme", "跟随系统");
    }

    public void setTheme(String theme) {
        prefs.edit().putString("theme", theme).apply();
    }

    public boolean isNotificationsEnabled() {
        return prefs.getBoolean("settings_notifications", true);
    }

    public void setNotificationsEnabled(boolean enabled) {
        prefs.edit().putBoolean("settings_notifications", enabled).apply();
    }

    public String getDefaultModel() {
        AiSettings settings = getAiSettings();
        return settings.defaultModel;
    }

    public void setDefaultModel(String model) {
        AiSettings settings = getAiSettings();
        settings.defaultModel = model;
        updateAiSettings(settings);
    }

    public String getInferenceMode() {
        return prefs.getString("settings_inference_mode", "本地推理");
    }

    public void setInferenceMode(String mode) {
        prefs.edit().putString("settings_inference_mode", mode).apply();
    }

    public boolean isStreamOutput() {
        return prefs.getBoolean("settings_stream_output", true);
    }

    public void setStreamOutput(boolean enabled) {
        prefs.edit().putBoolean("settings_stream_output", enabled).apply();
    }

    public float getTemperature() {
        AiSettings settings = getAiSettings();
        return settings.temperature;
    }

    public void setTemperature(float temp) {
        AiSettings settings = getAiSettings();
        settings.temperature = temp;
        updateAiSettings(settings);
    }

    public boolean isCloudGpuEnabled() {
        return prefs.getBoolean("云端GPU加速", false);
    }

    public void setCloudGpuEnabled(boolean enabled) {
        prefs.edit().putBoolean("云端GPU加速", enabled).apply();
    }

    public boolean isLongContextEnabled() {
        return prefs.getBoolean("超长上下文", false);
    }

    public void setLongContextEnabled(boolean enabled) {
        prefs.edit().putBoolean("超长上下文", enabled).apply();
    }

    public boolean isAutoOcrEnabled() {
        return isAutoOcr();
    }

    public void setAutoOcrEnabled(boolean enabled) {
        setAutoOcr(enabled);
    }

    public String getVisionInferenceMode() {
        return prefs.getString("vision_inference_mode", "均衡");
    }

    public void setVisionInferenceMode(String mode) {
        prefs.edit().putString("vision_inference_mode", mode).apply();
    }

    public boolean isImageCacheAutoClean() {
        PrivacySettings settings = getPrivacySettings();
        return settings.autoCleanImageCache;
    }

    public void setImageCacheAutoClean(boolean enabled) {
        PrivacySettings settings = getPrivacySettings();
        settings.autoCleanImageCache = enabled;
        updatePrivacySettings(settings);
    }

    public boolean isCreditsConsumeWarning() {
        return prefs.getBoolean("积分消耗提醒", true);
    }

    public void setCreditsConsumeWarning(boolean enabled) {
        prefs.edit().putBoolean("积分消耗提醒", enabled).apply();
    }

    public boolean isAnalyticsEnabled() {
        return prefs.getBoolean("settings_analytics", true);
    }

    public void setAnalyticsEnabled(boolean enabled) {
        prefs.edit().putBoolean("settings_analytics", enabled).apply();
    }

    public boolean isCrashReportEnabled() {
        return prefs.getBoolean("settings_crash_report", true);
    }

    public void setCrashReportEnabled(boolean enabled) {
        prefs.edit().putBoolean("settings_crash_report", enabled).apply();
    }

    public String getCacheSize() {
        if (context == null) return "0 MB";
        try {
            long size = 0;
            File cacheDir = context.getCacheDir();
            if (cacheDir != null && cacheDir.exists()) {
                size += getDirSize(cacheDir);
            }
            return String.format("%.2f MB", size / (1024.0 * 1024.0));
        } catch (Exception e) {
            return "0 MB";
        }
    }

    private long getDirSize(File dir) {
        long size = 0;
        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    size += getDirSize(file);
                } else {
                    size += file.length();
                }
            }
        }
        return size;
    }

    public void clearCache(CacheCallback callback) {
        new Thread(() -> {
            if (context != null) {
                File cacheDir = context.getCacheDir();
                if (cacheDir != null && cacheDir.exists()) {
                    deleteDir(cacheDir);
                }
            }
            if (callback != null) {
                callback.onComplete();
            }
        }).start();
    }

    private boolean deleteDir(File dir) {
        if (dir.isDirectory()) {
            String[] children = dir.list();
            for (int i = 0; i < children.length; i++) {
                boolean success = deleteDir(new File(dir, children[i]));
                if (!success) {
                    return false;
                }
            }
        }
        return dir.delete();
    }

    public String getVersionName() {
        if (context == null) return "Unknown";
        try {
            PackageInfo info = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
            return info.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            return "Unknown";
        }
    }

    public void checkForUpdate(UpdateCallback callback) {
        if (callback != null) {
            callback.onUpToDate();
        }
    }

    public String getLicenses() {
        return "llama.cpp (MIT License)\n" +
               "AndroidX (Apache 2.0)\n" +
               "Material Components (Apache 2.0)\n" +
               "Gson (Apache 2.0)";
    }

    public boolean isDebugLogEnabled() {
        return prefs.getBoolean("settings_debug_log", false);
    }

    public void setDebugLogEnabled(boolean enabled) {
        prefs.edit().putBoolean("settings_debug_log", enabled).apply();
    }

    public String getApiEndpoint() {
        return prefs.getString("settings_api_endpoint", BuildConfig.API_BASE_URL);
    }

    public void setApiEndpoint(String endpoint) {
        prefs.edit().putString("settings_api_endpoint", endpoint).apply();
    }

    public String[] getAvailableModels() {
        return new String[]{"llama-3-8b", "qwen2-7b", "mistral-7b", "gemma-2-9b"};
    }

    public void putBoolean(String key, boolean value) {
        prefs.edit().putBoolean(key, value).apply();
    }
}
