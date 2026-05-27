package com.omniai.assistant.cloud;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;

import com.omniai.assistant.inference.InferenceEngine;
import com.omniai.assistant.inference.ThermalMonitor;
import com.omniai.assistant.util.NetworkUtil;

public class CloudFallbackManager {

    private static volatile CloudFallbackManager instance;

    private boolean isCloudActive;
    private String fallbackReason;
    private CloudInferenceClient cloudClient;
    private InferenceEngine localEngine;
    private Context context;
    private FallbackListener listener;
    private Handler handler;

    private static final long RESTORE_CHECK_INTERVAL_MS = 30000L;

    private final Runnable restoreCheckRunnable = new Runnable() {
        @Override
        public void run() {
            if (!isCloudActive) return;
            if (shouldRestoreToLocal()) {
                restoreLocal();
            } else {
                handler.postDelayed(this, RESTORE_CHECK_INTERVAL_MS);
            }
        }
    };

    public interface FallbackListener {
        void onFallbackToCloud(String reason);
        void onRestoredToLocal();
    }

    private CloudFallbackManager() {
        this.cloudClient = new CloudInferenceClient();
        this.localEngine = InferenceEngine.getInstance();
        this.handler = new Handler(Looper.getMainLooper());
        this.isCloudActive = false;
        this.fallbackReason = "";
    }

    public static CloudFallbackManager getInstance() {
        if (instance == null) {
            synchronized (CloudFallbackManager.class) {
                if (instance == null) {
                    instance = new CloudFallbackManager();
                }
            }
        }
        return instance;
    }

    public void setContext(Context context) {
        this.context = context.getApplicationContext();
    }

    public void checkAndFallback(String reason) {
        if (isCloudActive) return;
        if (!cloudClient.isAvailable()) {
            cloudClient.checkAvailability();
        }
        if (!cloudClient.isAvailable()) return;

        isCloudActive = true;
        fallbackReason = reason;
        if (listener != null) {
            listener.onFallbackToCloud(reason);
        }
        handler.postDelayed(restoreCheckRunnable, RESTORE_CHECK_INTERVAL_MS);
    }

    public void restoreLocal() {
        if (!isCloudActive) return;
        isCloudActive = false;
        fallbackReason = "";
        handler.removeCallbacks(restoreCheckRunnable);
        if (listener != null) {
            listener.onRestoredToLocal();
        }
    }

    public boolean isCloudActive() {
        return isCloudActive;
    }

    public String getFallbackReason() {
        return fallbackReason;
    }

    public void setFallbackListener(FallbackListener listener) {
        this.listener = listener;
    }

    public boolean shouldFallback() {
        if (!localEngine.isModelLoaded()) {
            return true;
        }
        if (isMemoryLow()) {
            return true;
        }
        ThermalMonitor.ThermalStatus thermalStatus = ThermalMonitor.getInstance().checkThermalStatus();
        if (thermalStatus == ThermalMonitor.ThermalStatus.HIGH || thermalStatus == ThermalMonitor.ThermalStatus.CRITICAL) {
            return true;
        }
        return false;
    }

    private boolean shouldRestoreToLocal() {
        if (!localEngine.isModelLoaded()) {
            return false;
        }
        if (isMemoryLow()) {
            return false;
        }
        ThermalMonitor.ThermalStatus thermalStatus = ThermalMonitor.getInstance().checkThermalStatus();
        if (thermalStatus == ThermalMonitor.ThermalStatus.HIGH || thermalStatus == ThermalMonitor.ThermalStatus.CRITICAL) {
            return false;
        }
        if (context != null && !NetworkUtil.isNetworkAvailable(context)) {
            return false;
        }
        return true;
    }

    private boolean isMemoryLow() {
        long deviceMemory = localEngine.getDeviceMemory();
        return deviceMemory > 0 && deviceMemory < 512 * 1024 * 1024;
    }

    public CloudInferenceClient getCloudClient() {
        return cloudClient;
    }
}
