package com.omniai.assistant.inference;

import android.os.Handler;
import android.os.Looper;

import com.omniai.assistant.nativebridge.LlamaBridge;

public class ThermalMonitor {

    private static volatile ThermalMonitor instance;

    private float currentTemp;
    private float highThreshold = 45.0f;
    private float criticalThreshold = 50.0f;
    private boolean isMonitoring;
    private Handler monitoringHandler;
    private ThermalListener listener;
    private LlamaBridge bridge;

    private static final long POLLING_INTERVAL_MS = 5000L;

    private final Runnable monitoringRunnable = new Runnable() {
        @Override
        public void run() {
            if (!isMonitoring) return;
            currentTemp = bridge.nativeGetDeviceTemperature();
            if (listener != null) {
                listener.onTemperatureChanged(currentTemp);
                ThermalStatus status = checkThermalStatus();
                if (status == ThermalStatus.HIGH || status == ThermalStatus.CRITICAL) {
                    listener.onThermalWarning(status);
                }
            }
            monitoringHandler.postDelayed(this, POLLING_INTERVAL_MS);
        }
    };

    private ThermalMonitor() {
        this.bridge = LlamaBridge.getInstance();
        this.monitoringHandler = new Handler(Looper.getMainLooper());
        this.currentTemp = 0.0f;
        this.isMonitoring = false;
    }

    public static ThermalMonitor getInstance() {
        if (instance == null) {
            synchronized (ThermalMonitor.class) {
                if (instance == null) {
                    instance = new ThermalMonitor();
                }
            }
        }
        return instance;
    }

    public void startMonitoring() {
        if (isMonitoring) return;
        isMonitoring = true;
        monitoringHandler.post(monitoringRunnable);
    }

    public void stopMonitoring() {
        isMonitoring = false;
        monitoringHandler.removeCallbacks(monitoringRunnable);
    }

    public float getCurrentTemp() {
        return currentTemp;
    }

    public boolean isOverheated() {
        return currentTemp >= highThreshold;
    }

    public boolean isCritical() {
        return currentTemp >= criticalThreshold;
    }

    public void setThresholds(float high, float critical) {
        this.highThreshold = high;
        this.criticalThreshold = critical;
    }

    public ThermalStatus checkThermalStatus() {
        if (currentTemp >= criticalThreshold) {
            return ThermalStatus.CRITICAL;
        } else if (currentTemp >= highThreshold) {
            return ThermalStatus.HIGH;
        } else if (currentTemp >= highThreshold - 5.0f) {
            return ThermalStatus.WARM;
        } else {
            return ThermalStatus.NORMAL;
        }
    }

    public void setThermalListener(ThermalListener listener) {
        this.listener = listener;
    }

    public boolean isMonitoring() {
        return isMonitoring;
    }

    public enum ThermalStatus {
        NORMAL,
        WARM,
        HIGH,
        CRITICAL
    }

    public interface ThermalListener {
        void onTemperatureChanged(float temperature);
        void onThermalWarning(ThermalStatus status);
    }
}
