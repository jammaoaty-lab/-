package com.omniai.assistant.ui.settings;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.omniai.assistant.R;
import com.omniai.assistant.manager.SettingsManager;

import java.util.ArrayList;
import java.util.List;

public class SettingsActivity extends AppCompatActivity {

    private static final int DEV_MODE_TAP_COUNT = 7;

    private RecyclerView settingsList;
    private SettingsAdapter adapter;
    private SettingsManager settingsManager;

    private int versionTapCount = 0;
    private Handler tapResetHandler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);

        settingsManager = SettingsManager.getInstance(this);
        tapResetHandler = new Handler(Looper.getMainLooper());

        settingsList = findViewById(R.id.rv_settings);
        adapter = new SettingsAdapter(buildSettingItems(), new SettingsAdapter.OnSettingChangeListener() {
            @Override
            public void onSwitchChanged(String key, boolean value) {
                settingsManager.putBoolean(key, value);
                handleSwitchChange(key, value);
            }

            @Override
            public void onClicked(String key) {
                handleSettingClick(key);
            }
        });

        settingsList.setLayoutManager(new LinearLayoutManager(this));
        settingsList.setAdapter(adapter);

        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle(R.string.settings);
        }
    }

    private List<SettingsAdapter.SettingItem> buildSettingItems() {
        List<SettingsAdapter.SettingItem> items = new ArrayList<>();

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_group_general), null, 0, null, false, false, false, "general"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_language),
                settingsManager.getLanguage(),
                R.drawable.ic_language,
                null, false, false, true, "general"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_theme),
                settingsManager.getTheme(),
                R.drawable.ic_theme,
                null, false, false, true, "general"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_notifications),
                null,
                R.drawable.ic_notifications,
                null, true, settingsManager.isNotificationsEnabled(), false, "general"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_group_ai), null, 0, null, false, false, false, "ai"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_default_model),
                settingsManager.getDefaultModel(),
                R.drawable.ic_model,
                null, false, false, true, "ai"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_inference_mode),
                settingsManager.getInferenceMode(),
                R.drawable.ic_inference,
                null, false, false, true, "ai"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_stream_output),
                null,
                R.drawable.ic_stream,
                null, true, settingsManager.isStreamOutput(), false, "ai"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_temperature),
                String.valueOf(settingsManager.getTemperature()),
                R.drawable.ic_temperature,
                null, false, false, true, "ai"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_group_privacy), null, 0, null, false, false, false, "privacy"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_analytics),
                null,
                R.drawable.ic_analytics,
                null, true, settingsManager.isAnalyticsEnabled(), false, "privacy"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_crash_report),
                null,
                R.drawable.ic_crash,
                null, true, settingsManager.isCrashReportEnabled(), false, "privacy"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_clear_cache),
                settingsManager.getCacheSize(),
                R.drawable.ic_cache,
                null, false, false, true, "privacy"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_group_about), null, 0, null, false, false, false, "about"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_version),
                settingsManager.getVersionName(),
                R.drawable.ic_version,
                null, false, false, false, "about"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_check_update),
                null,
                R.drawable.ic_update,
                null, false, false, true, "about"
        ));

        items.add(new SettingsAdapter.SettingItem(
                getString(R.string.settings_licenses),
                null,
                R.drawable.ic_licenses,
                null, false, false, true, "about"
        ));

        if (settingsManager.isDeveloperMode()) {
            items.add(new SettingsAdapter.SettingItem(
                    getString(R.string.settings_group_developer), null, 0, null, false, false, false, "developer"
            ));

            items.add(new SettingsAdapter.SettingItem(
                    getString(R.string.settings_developer_mode),
                    null,
                    R.drawable.ic_developer,
                    null, true, true, false, "developer"
            ));

            items.add(new SettingsAdapter.SettingItem(
                    getString(R.string.settings_debug_log),
                    null,
                    R.drawable.ic_log,
                    null, true, settingsManager.isDebugLogEnabled(), false, "developer"
            ));

            items.add(new SettingsAdapter.SettingItem(
                    getString(R.string.settings_api_endpoint),
                    settingsManager.getApiEndpoint(),
                    R.drawable.ic_api,
                    null, false, false, true, "developer"
            ));
        }

        return items;
    }

    private void handleSwitchChange(String key, boolean value) {
        switch (key) {
            case "settings_notifications":
                settingsManager.setNotificationsEnabled(value);
                break;
            case "settings_stream_output":
                settingsManager.setStreamOutput(value);
                break;
            case "settings_analytics":
                settingsManager.setAnalyticsEnabled(value);
                break;
            case "settings_crash_report":
                settingsManager.setCrashReportEnabled(value);
                break;
            case "settings_developer_mode":
                settingsManager.setDeveloperMode(value);
                break;
            case "settings_debug_log":
                settingsManager.setDebugLogEnabled(value);
                break;
        }
    }

    private void handleSettingClick(String key) {
        switch (key) {
            case "settings_language":
                showLanguagePicker();
                break;
            case "settings_theme":
                showThemePicker();
                break;
            case "settings_default_model":
                showModelPicker();
                break;
            case "settings_inference_mode":
                showInferenceModePicker();
                break;
            case "settings_temperature":
                showTemperatureDialog();
                break;
            case "settings_clear_cache":
                clearCache();
                break;
            case "settings_version":
                handleVersionTap();
                break;
            case "settings_check_update":
                checkForUpdate();
                break;
            case "settings_licenses":
                showLicenses();
                break;
            case "settings_api_endpoint":
                showApiEndpointDialog();
                break;
        }
    }

    private void showLanguagePicker() {
        String[] languages = getResources().getStringArray(R.array.languages);
        new android.app.AlertDialog.Builder(this)
                .setTitle(R.string.settings_language)
                .setItems(languages, (dialog, which) -> {
                    settingsManager.setLanguage(languages[which]);
                    adapter.updateData(buildSettingItems());
                })
                .show();
    }

    private void showThemePicker() {
        String[] themes = getResources().getStringArray(R.array.themes);
        new android.app.AlertDialog.Builder(this)
                .setTitle(R.string.settings_theme)
                .setItems(themes, (dialog, which) -> {
                    settingsManager.setTheme(themes[which]);
                    adapter.updateData(buildSettingItems());
                })
                .show();
    }

    private void showModelPicker() {
        String[] models = settingsManager.getAvailableModels();
        new android.app.AlertDialog.Builder(this)
                .setTitle(R.string.settings_default_model)
                .setItems(models, (dialog, which) -> {
                    settingsManager.setDefaultModel(models[which]);
                    adapter.updateData(buildSettingItems());
                })
                .show();
    }

    private void showInferenceModePicker() {
        String[] modes = getResources().getStringArray(R.array.inference_modes);
        new android.app.AlertDialog.Builder(this)
                .setTitle(R.string.settings_inference_mode)
                .setItems(modes, (dialog, which) -> {
                    settingsManager.setInferenceMode(modes[which]);
                    adapter.updateData(buildSettingItems());
                })
                .show();
    }

    private void showTemperatureDialog() {
        android.widget.SeekBar seekBar = new android.widget.SeekBar(this);
        seekBar.setMax(20);
        seekBar.setProgress((int) (settingsManager.getTemperature() * 10));
        new android.app.AlertDialog.Builder(this)
                .setTitle(R.string.settings_temperature)
                .setView(seekBar)
                .setPositiveButton(R.string.confirm, (dialog, which) -> {
                    float temp = seekBar.getProgress() / 10.0f;
                    settingsManager.setTemperature(temp);
                    adapter.updateData(buildSettingItems());
                })
                .setNegativeButton(R.string.cancel, null)
                .show();
    }

    private void clearCache() {
        settingsManager.clearCache(new SettingsManager.CacheCallback() {
            @Override
            public void onComplete() {
                runOnUiThread(() -> {
                    Toast.makeText(SettingsActivity.this, R.string.cache_cleared, Toast.LENGTH_SHORT).show();
                    adapter.updateData(buildSettingItems());
                });
            }
        });
    }

    private void handleVersionTap() {
        versionTapCount++;
        tapResetHandler.removeCallbacksAndMessages(null);
        tapResetHandler.postDelayed(() -> versionTapCount = 0, 3000);

        if (versionTapCount >= DEV_MODE_TAP_COUNT) {
            versionTapCount = 0;
            if (!settingsManager.isDeveloperMode()) {
                settingsManager.setDeveloperMode(true);
                Toast.makeText(this, R.string.developer_mode_enabled, Toast.LENGTH_SHORT).show();
                adapter.updateData(buildSettingItems());
            } else {
                Toast.makeText(this, R.string.developer_mode_already_enabled, Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void checkForUpdate() {
        settingsManager.checkForUpdate(new SettingsManager.UpdateCallback() {
            @Override
            public void onUpdateAvailable(String version) {
                runOnUiThread(() -> Toast.makeText(SettingsActivity.this,
                        getString(R.string.update_available, version), Toast.LENGTH_SHORT).show());
            }

            @Override
            public void onUpToDate() {
                runOnUiThread(() -> Toast.makeText(SettingsActivity.this,
                        R.string.already_up_to_date, Toast.LENGTH_SHORT).show());
            }

            @Override
            public void onError(String message) {
                runOnUiThread(() -> Toast.makeText(SettingsActivity.this, message, Toast.LENGTH_SHORT).show());
            }
        });
    }

    private void showLicenses() {
        new android.app.AlertDialog.Builder(this)
                .setTitle(R.string.settings_licenses)
                .setMessage(settingsManager.getLicenses())
                .setPositiveButton(R.string.ok, null)
                .show();
    }

    private void showApiEndpointDialog() {
        android.widget.EditText input = new android.widget.EditText(this);
        input.setText(settingsManager.getApiEndpoint());
        new android.app.AlertDialog.Builder(this)
                .setTitle(R.string.settings_api_endpoint)
                .setView(input)
                .setPositiveButton(R.string.confirm, (dialog, which) -> {
                    String endpoint = input.getText().toString().trim();
                    settingsManager.setApiEndpoint(endpoint);
                    adapter.updateData(buildSettingItems());
                })
                .setNegativeButton(R.string.cancel, null)
                .show();
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
