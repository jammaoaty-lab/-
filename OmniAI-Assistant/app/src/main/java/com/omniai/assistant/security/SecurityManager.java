package com.omniai.assistant.security;

import android.content.Context;
import android.os.CancellationSignal;

import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import java.util.concurrent.Executor;

public class SecurityManager {

    private static SecurityManager instance;

    private boolean appLockEnabled;
    private boolean fingerprintEnabled;
    private boolean incognitoMode;
    private String appLockPin;
    private Context context;
    private BiometricPrompt biometricPrompt;
    private DataEncryptor dataEncryptor;
    private SensitiveFilter sensitiveFilter;

    private SecurityManager(Context context) {
        this.context = context.getApplicationContext();
        this.appLockEnabled = false;
        this.fingerprintEnabled = false;
        this.incognitoMode = false;
        this.appLockPin = null;
        this.dataEncryptor = new DataEncryptor(context);
        this.sensitiveFilter = new SensitiveFilter();
        this.sensitiveFilter.loadSensitiveWords();
    }

    public static synchronized SecurityManager getInstance(Context context) {
        if (instance == null) {
            instance = new SecurityManager(context);
        }
        return instance;
    }

    public void enableAppLock(String pin) {
        if (pin == null || pin.length() < 4) {
            throw new IllegalArgumentException("PIN must be at least 4 digits");
        }
        this.appLockPin = dataEncryptor.encryptString(pin);
        this.appLockEnabled = true;
    }

    public void disableAppLock() {
        this.appLockEnabled = false;
        this.appLockPin = null;
    }

    public boolean verifyPin(String pin) {
        if (!appLockEnabled || appLockPin == null) {
            return false;
        }
        String encryptedInput = dataEncryptor.encryptString(pin);
        return appLockPin.equals(encryptedInput);
    }

    public void enableFingerprint() {
        this.fingerprintEnabled = true;
    }

    public void disableFingerprint() {
        this.fingerprintEnabled = false;
    }

    public void authenticateFingerprint(AuthCallback callback) {
        if (!(context instanceof FragmentActivity)) {
            if (callback != null) {
                callback.onError("Context must be a FragmentActivity");
            }
            return;
        }
        FragmentActivity activity = (FragmentActivity) context;
        Executor executor = ContextCompat.getMainExecutor(activity);
        biometricPrompt = new BiometricPrompt(activity, executor, new BiometricPrompt.AuthenticationCallback() {
            @Override
            public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                if (callback != null) {
                    callback.onSuccess();
                }
            }

            @Override
            public void onAuthenticationFailed() {
                if (callback != null) {
                    callback.onError("Authentication failed");
                }
            }

            @Override
            public void onAuthenticationError(int errorCode, CharSequence errString) {
                if (callback != null) {
                    callback.onError(errString != null ? errString.toString() : "Authentication error");
                }
            }
        });

        BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
                .setTitle("Biometric Authentication")
                .setSubtitle("Verify your identity to access OmniAI")
                .setNegativeButtonText("Cancel")
                .build();

        biometricPrompt.authenticate(promptInfo);
    }

    public boolean isAppLockEnabled() {
        return appLockEnabled;
    }

    public boolean isFingerprintEnabled() {
        return fingerprintEnabled;
    }

    public void setIncognitoMode(boolean enabled) {
        this.incognitoMode = enabled;
    }

    public boolean isIncognitoMode() {
        return incognitoMode;
    }

    public String encryptData(String data) {
        return dataEncryptor.encryptString(data);
    }

    public String decryptData(String encrypted) {
        return dataEncryptor.decryptString(encrypted);
    }

    public boolean encryptModelFile(String filePath) {
        String outputPath = filePath + ".enc";
        return dataEncryptor.encryptFile(filePath, outputPath);
    }

    public boolean decryptModelFile(String filePath) {
        if (!filePath.endsWith(".enc")) {
            return false;
        }
        String outputPath = filePath.substring(0, filePath.length() - 4);
        return dataEncryptor.decryptFile(filePath, outputPath);
    }

    public boolean isSensitiveContent(String text) {
        return sensitiveFilter.containsSensitive(text);
    }

    public String sanitizePrompt(String prompt) {
        return sensitiveFilter.filterText(prompt);
    }

    public boolean checkPromptInjection(String prompt) {
        return sensitiveFilter.detectInjection(prompt);
    }

    public interface AuthCallback {
        void onSuccess();
        void onError(String error);
    }
}
