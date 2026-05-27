package com.omniai.assistant;

import android.app.Application;
import com.omniai.assistant.common.Constants;
import com.omniai.assistant.common.EventBus;
import com.omniai.assistant.util.FileUtil;

public class OmniAIApplication extends Application {

    private static OmniAIApplication instance;

    private UserManager userManager;
    private InferenceEngine inferenceEngine;
    private CloudFallbackManager cloudFallbackManager;
    private SecurityManager securityManager;
    private CacheManager cacheManager;
    private VipManager vipManager;
    private ThermalMonitor thermalMonitor;
    private KnowledgeBaseManager knowledgeBaseManager;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;

        FileUtil.ensureDirs(this);

        userManager = new UserManager(this);
        securityManager = new SecurityManager(this);
        cacheManager = new CacheManager(this);
        vipManager = new VipManager(this);
        thermalMonitor = new ThermalMonitor(this);
        knowledgeBaseManager = new KnowledgeBaseManager(this);
        inferenceEngine = new InferenceEngine(this);
        cloudFallbackManager = new CloudFallbackManager(this);

        userManager.initialize();
        securityManager.initialize();
        cacheManager.initialize();
        vipManager.initialize();
        thermalMonitor.start();
        knowledgeBaseManager.initialize();
        inferenceEngine.initialize();
        cloudFallbackManager.initialize();
    }

    public static OmniAIApplication getInstance() {
        return instance;
    }

    public UserManager getUserManager() {
        return userManager;
    }

    public InferenceEngine getInferenceEngine() {
        return inferenceEngine;
    }

    public CloudFallbackManager getCloudFallbackManager() {
        return cloudFallbackManager;
    }

    public SecurityManager getSecurityManager() {
        return securityManager;
    }

    public CacheManager getCacheManager() {
        return cacheManager;
    }

    public VipManager getVipManager() {
        return vipManager;
    }

    public ThermalMonitor getThermalMonitor() {
        return thermalMonitor;
    }

    public KnowledgeBaseManager getKnowledgeBaseManager() {
        return knowledgeBaseManager;
    }

    @Override
    public void onTerminate() {
        super.onTerminate();
        if (thermalMonitor != null) {
            thermalMonitor.stop();
        }
        if (inferenceEngine != null) {
            inferenceEngine.shutdown();
        }
        if (cloudFallbackManager != null) {
            cloudFallbackManager.shutdown();
        }
        if (cacheManager != null) {
            cacheManager.flush();
        }
        EventBus.getDefault().clear();
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
        if (cacheManager != null) {
            cacheManager.clearNonCritical();
        }
        if (inferenceEngine != null) {
            inferenceEngine.onLowMemory();
        }
    }

    @Override
    public void onTrimMemory(int level) {
        super.onTrimMemory(level);
        if (level >= TRIM_MEMORY_MODERATE && cacheManager != null) {
            cacheManager.clearNonCritical();
        }
        if (level >= TRIM_MEMORY_COMPLETE && inferenceEngine != null) {
            inferenceEngine.onLowMemory();
        }
    }
}
