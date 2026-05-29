package com.omniai.assistant;

import android.app.Application;
import android.content.SharedPreferences;
import com.omniai.assistant.common.Constants;
import com.omniai.assistant.common.EventBus;
import com.omniai.assistant.credits.CreditsManager;
import com.omniai.assistant.inference.InferenceEngine;
import com.omniai.assistant.inference.VisionInferenceEngine;
import com.omniai.assistant.cache.CacheManager;
import com.omniai.assistant.cloud.CloudFallbackManager;
import com.omniai.assistant.inference.ThermalMonitor;
import com.omniai.assistant.knowledge.KnowledgeBaseManager;
import com.omniai.assistant.model.AIModel;
import com.omniai.assistant.modelmgmt.PreinstalledModelManager;
import com.omniai.assistant.security.SecurityManager;
import com.omniai.assistant.user.UserManager;
import com.omniai.assistant.util.FileUtil;

public class OmniAIApplication extends Application {

    private static OmniAIApplication instance;

    private UserManager userManager;
    private InferenceEngine inferenceEngine;
    private VisionInferenceEngine visionInferenceEngine;
    private CloudFallbackManager cloudFallbackManager;
    private SecurityManager securityManager;
    private CacheManager cacheManager;
    private CreditsManager creditsManager;
    private ThermalMonitor thermalMonitor;
    private KnowledgeBaseManager knowledgeBaseManager;
    private PreinstalledModelManager preinstalledModelManager;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;

        FileUtil.ensureDirs(this);

        CreditsManager.init(this);
        VisionInferenceEngine.init(this);

        UserManager.init(this);
        userManager = UserManager.getInstance();
        
        securityManager = SecurityManager.getInstance(this);
        cacheManager = CacheManager.getInstance(this);
        creditsManager = CreditsManager.getInstance();
        thermalMonitor = ThermalMonitor.getInstance();
        
        // Initialize KnowledgeBaseManager
        KnowledgeBaseManager.init(this);
        knowledgeBaseManager = KnowledgeBaseManager.getInstance();
        
        inferenceEngine = InferenceEngine.getInstance();
        visionInferenceEngine = VisionInferenceEngine.getInstance();
        cloudFallbackManager = CloudFallbackManager.getInstance();
        cloudFallbackManager.setContext(this);

        preinstalledModelManager = PreinstalledModelManager.getInstance(this);
        preinstalledModelManager.ensureModelsExtracted(new PreinstalledModelManager.ExtractionCallback() {
            @Override
            public void onProgress(String modelName, float progress) {}

            @Override
            public void onModelReady(AIModel model) {}

            @Override
            public void onAllModelsReady() {}

            @Override
            public void onError(String message) {}
            
            @Override
            public void onRequiresFeatureInstall() {}
        });
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

    public VisionInferenceEngine getVisionInferenceEngine() {
        return visionInferenceEngine;
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

    public CreditsManager getCreditsManager() {
        return creditsManager;
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
        if (visionInferenceEngine != null) {
            visionInferenceEngine.unloadVisionModel();
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
        if (visionInferenceEngine != null && visionInferenceEngine.isVisionModelLoaded()) {
            visionInferenceEngine.unloadVisionModel();
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
        if (level >= TRIM_MEMORY_RUNNING_LOW && visionInferenceEngine != null && visionInferenceEngine.isVisionModelLoaded()) {
            visionInferenceEngine.unloadVisionModel();
        }
    }
}
