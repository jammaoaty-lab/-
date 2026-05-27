package com.omniai.assistant.credits;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;

public class CreditsFeatureGate {

    private static volatile CreditsFeatureGate instance;

    private CreditsManager creditsManager;

    private CreditsFeatureGate() {
        this.creditsManager = CreditsManager.getInstance();
    }

    public static CreditsFeatureGate getInstance() {
        if (instance == null) {
            synchronized (CreditsFeatureGate.class) {
                if (instance == null) {
                    instance = new CreditsFeatureGate();
                }
            }
        }
        return instance;
    }

    public boolean canUseAdvancedTextModel() {
        return creditsManager.hasSufficientCredits(CreditsManager.CreditsFeature.ADVANCED_TEXT_MODEL.getCost());
    }

    public boolean canUseAdvancedVisionModel() {
        return creditsManager.hasSufficientCredits(CreditsManager.CreditsFeature.ADVANCED_VISION_MODEL.getCost());
    }

    public boolean canTrainLora() {
        return creditsManager.hasSufficientCredits(CreditsManager.CreditsFeature.UNLIMITED_LORA.getCost());
    }

    public boolean canUseCloudGpu() {
        return creditsManager.hasSufficientCredits(CreditsManager.CreditsFeature.CLOUD_GPU.getCost());
    }

    public boolean canUseLongContext() {
        return creditsManager.hasSufficientCredits(CreditsManager.CreditsFeature.LONG_CONTEXT.getCost());
    }

    public boolean canUseAdvancedAgent() {
        return creditsManager.hasSufficientCredits(CreditsManager.CreditsFeature.ADVANCED_AGENT.getCost());
    }

    public int getCost(CreditsManager.CreditsFeature feature) {
        return feature.getCost();
    }

    public boolean deductIfNeeded(CreditsManager.CreditsFeature feature) {
        return creditsManager.checkAndDeduct(feature);
    }

    public void showInsufficientCreditsDialog(Context context) {
        new AlertDialog.Builder(context)
                .setTitle("Insufficient Credits")
                .setMessage("You don't have enough credits for this feature. Please recharge to continue using advanced features.")
                .setPositiveButton("Recharge", (dialog, which) -> {
                    Intent intent = new Intent(Intent.ACTION_VIEW,
                            android.net.Uri.parse("omniai://credits/recharge"));
                    context.startActivity(intent);
                })
                .setNegativeButton("Cancel", null)
                .show();
    }
}
