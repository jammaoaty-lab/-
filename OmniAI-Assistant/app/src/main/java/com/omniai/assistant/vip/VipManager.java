package com.omniai.assistant.vip;

import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import com.omniai.assistant.common.Result;
import com.omniai.assistant.model.UserProfile;
import com.omniai.assistant.model.VipPlan;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class VipManager {

    private static volatile VipManager instance;
    private UserProfile currentUser;
    private VipStatus currentStatus;
    private List<VipPlan> availablePlans;
    private VipApiService apiService;
    private SharedPreferences prefs;
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    public enum VipStatus {
        FREE, ACTIVE, EXPIRED, CANCELLED
    }

    public enum VipFeature {
        LONG_CONTEXT, FAST_INFERENCE, UNLIMITED_LORA, ADVANCED_AGENT, MULTI_DEVICE_SYNC, PREMIUM_MODELS, CLOUD_GPU
    }

    public interface SubscribeCallback {
        void onSuccess(VipPlan plan);
        void onError(String message);
    }

    public interface RestoreCallback {
        void onSuccess(VipPlan plan);
        void onError(String message);
    }

    public interface SyncCallback {
        void onSuccess();
        void onError(String message);
    }

    private VipManager(SharedPreferences prefs) {
        this.prefs = prefs;
        this.currentStatus = VipStatus.FREE;
        this.availablePlans = new ArrayList<>();
        this.apiService = new VipApiService();
        loadStatus();
    }

    public static VipManager getInstance(SharedPreferences prefs) {
        if (instance == null) {
            synchronized (VipManager.class) {
                if (instance == null) {
                    instance = new VipManager(prefs);
                }
            }
        }
        return instance;
    }

    public void subscribe(String planId, SubscribeCallback callback) {
        executorService.execute(() -> {
            String paymentToken = prefs.getString("payment_token", "");
            Result<VipPlan> result = apiService.subscribe(planId, paymentToken);
            if (result.isSuccess()) {
                currentStatus = VipStatus.ACTIVE;
                prefs.edit().putString("current_plan_id", planId).apply();
                saveStatus();
                if (callback != null) {
                    mainHandler.post(() -> callback.onSuccess(result.getData()));
                }
            } else {
                if (callback != null) {
                    mainHandler.post(() -> callback.onError(result.getError()));
                }
            }
        });
    }

    public void cancelSubscription() {
        if (currentUser == null) return;
        executorService.execute(() -> {
            Result<Boolean> result = apiService.cancelSubscription(currentUser.getUid());
            if (result.isSuccess() && result.getData()) {
                currentStatus = VipStatus.CANCELLED;
                saveStatus();
            }
        });
    }

    public void restorePurchase(String orderId, RestoreCallback callback) {
        executorService.execute(() -> {
            Result<VipPlan> result = apiService.restorePurchase(orderId);
            if (result.isSuccess()) {
                currentStatus = VipStatus.ACTIVE;
                saveStatus();
                if (callback != null) {
                    mainHandler.post(() -> callback.onSuccess(result.getData()));
                }
            } else {
                if (callback != null) {
                    mainHandler.post(() -> callback.onError(result.getError()));
                }
            }
        });
    }

    public VipPlan getCurrentPlan() {
        if (currentStatus == VipStatus.ACTIVE && !availablePlans.isEmpty()) {
            String planId = prefs.getString("current_plan_id", "");
            for (VipPlan plan : availablePlans) {
                if (plan.getId().equals(planId)) {
                    return plan;
                }
            }
        }
        return null;
    }

    public List<VipPlan> getAvailablePlans() {
        return new ArrayList<>(availablePlans);
    }

    public boolean isVip() {
        return currentStatus == VipStatus.ACTIVE;
    }

    public boolean isVipActive() {
        if (currentStatus != VipStatus.ACTIVE) return false;
        long expiry = getVipExpiry();
        return expiry > System.currentTimeMillis();
    }

    public long getVipExpiry() {
        return prefs.getLong("vip_expiry", 0L);
    }

    public int getVipDaysRemaining() {
        long expiry = getVipExpiry();
        long now = System.currentTimeMillis();
        if (expiry <= now) return 0;
        return (int) ((expiry - now) / (1000L * 60 * 60 * 24));
    }

    public void checkVipStatus() {
        if (currentUser == null) return;
        executorService.execute(() -> {
            Result<VipStatus> result = apiService.checkStatus(currentUser.getUid());
            if (result.isSuccess()) {
                currentStatus = result.getData();
                saveStatus();
            }
        });
    }

    public List<String> getVipFeatures() {
        List<String> features = new ArrayList<>();
        for (VipFeature feature : VipFeature.values()) {
            features.add(feature.name());
        }
        return features;
    }

    public boolean hasFeature(VipFeature feature) {
        if (!isVipActive()) return false;
        VipPlan plan = getCurrentPlan();
        if (plan == null) return false;
        return Arrays.asList(plan.getFeatures()).contains(feature.name());
    }

    public void enableCloudSync(SyncCallback callback) {
        if (!hasFeature(VipFeature.MULTI_DEVICE_SYNC)) {
            if (callback != null) callback.onError("Cloud sync requires VIP subscription");
            return;
        }
        prefs.edit().putBoolean("cloud_sync_enabled", true).apply();
        syncData(callback);
    }

    public void syncData(SyncCallback callback) {
        if (!prefs.getBoolean("cloud_sync_enabled", false)) {
            if (callback != null) callback.onError("Cloud sync is not enabled");
            return;
        }
        executorService.execute(() -> {
            try {
                Thread.sleep(100);
                mainHandler.post(() -> {
                    if (callback != null) callback.onSuccess();
                });
            } catch (InterruptedException e) {
                mainHandler.post(() -> {
                    if (callback != null) callback.onError("Sync interrupted");
                });
            }
        });
    }

    private void loadStatus() {
        String statusStr = prefs.getString("vip_status", VipStatus.FREE.name());
        try {
            currentStatus = VipStatus.valueOf(statusStr);
        } catch (IllegalArgumentException e) {
            currentStatus = VipStatus.FREE;
        }
    }

    private void saveStatus() {
        prefs.edit().putString("vip_status", currentStatus.name()).apply();
    }
}
