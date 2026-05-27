package com.omniai.assistant.vip;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class VipFeatureGate {

    private static final int FREE_MAX_CONTEXT = 4096;
    private static final int VIP_MAX_CONTEXT = 32768;
    private static final int FREE_MAX_LORA_TRAININGS = 3;
    private static final int VIP_MAX_LORA_TRAININGS = Integer.MAX_VALUE;
    private static final Set<String> PREMIUM_MODELS = new HashSet<>(Arrays.asList(
            "gpt-4", "claude-3-opus", "gemini-ultra", "llama-3-70b"
    ));

    private final VipManager vipManager;

    public VipFeatureGate(VipManager vipManager) {
        this.vipManager = vipManager;
    }

    private boolean isVipActive() {
        return vipManager != null && vipManager.isVipActive();
    }

    public boolean canUseLongContext(int requestedLength) {
        return requestedLength <= getMaxContextLength();
    }

    public boolean canUseFastInference() {
        return isVipActive();
    }

    public boolean canTrainLora() {
        if (isVipActive()) return true;
        return getRemainingQuota(VipManager.VipFeature.UNLIMITED_LORA) > 0;
    }

    public boolean canUseAdvancedAgent() {
        return isVipActive();
    }

    public boolean canSyncDevices() {
        return isVipActive();
    }

    public boolean canUsePremiumModel(String modelId) {
        if (!PREMIUM_MODELS.contains(modelId)) return true;
        return isVipActive();
    }

    public boolean canUseCloudGpu() {
        return isVipActive();
    }

    public int getMaxContextLength() {
        return isVipActive() ? VIP_MAX_CONTEXT : FREE_MAX_CONTEXT;
    }

    public int getMaxLoraTrainings() {
        return isVipActive() ? VIP_MAX_LORA_TRAININGS : FREE_MAX_LORA_TRAININGS;
    }

    public int getRemainingQuota(VipManager.VipFeature feature) {
        if (isVipActive()) {
            switch (feature) {
                case LONG_CONTEXT:
                    return VIP_MAX_CONTEXT;
                case UNLIMITED_LORA:
                    return VIP_MAX_LORA_TRAININGS;
                case CLOUD_GPU:
                case ADVANCED_AGENT:
                case MULTI_DEVICE_SYNC:
                case FAST_INFERENCE:
                case PREMIUM_MODELS:
                    return Integer.MAX_VALUE;
                default:
                    return 0;
            }
        }
        switch (feature) {
            case LONG_CONTEXT:
                return FREE_MAX_CONTEXT;
            case UNLIMITED_LORA:
                return FREE_MAX_LORA_TRAININGS;
            case CLOUD_GPU:
            case ADVANCED_AGENT:
            case MULTI_DEVICE_SYNC:
            case FAST_INFERENCE:
            case PREMIUM_MODELS:
                return 0;
            default:
                return 0;
        }
    }
}
