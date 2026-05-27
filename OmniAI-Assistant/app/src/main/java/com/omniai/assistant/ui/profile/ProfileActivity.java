package com.omniai.assistant.ui.profile;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.google.android.material.snackbar.Snackbar;
import com.omniai.assistant.R;
import com.omniai.assistant.manager.UserManager;
import com.omniai.assistant.manager.VipManager;
import com.omniai.assistant.model.UserProfile;
import com.omniai.assistant.ui.knowledge.KnowledgeBaseActivity;
import com.omniai.assistant.ui.login.LoginActivity;
import com.omniai.assistant.ui.lora.LoraTrainActivity;
import com.omniai.assistant.ui.model.ModelManagerActivity;

public class ProfileActivity extends AppCompatActivity {

    private ImageView avatarView;
    private TextView nicknameText;
    private TextView uidText;
    private View vipBadge;
    private TextView vipExpiryText;
    private TextView deviceCountText;

    private UserManager userManager;
    private VipManager vipManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        userManager = UserManager.getInstance(this);
        vipManager = VipManager.getInstance(this);

        avatarView = findViewById(R.id.iv_avatar);
        nicknameText = findViewById(R.id.tv_nickname);
        uidText = findViewById(R.id.tv_uid);
        vipBadge = findViewById(R.id.vip_badge);
        vipExpiryText = findViewById(R.id.tv_vip_expiry);
        deviceCountText = findViewById(R.id.tv_device_count);

        loadUserProfile();
        setupMenuItems();
        setupVipCard();
        setupLogout();
    }

    private void loadUserProfile() {
        UserProfile profile = userManager.getUserProfile();
        if (profile != null) {
            Glide.with(this)
                    .load(profile.getAvatarUrl())
                    .placeholder(R.drawable.ic_avatar_placeholder)
                    .circleCrop()
                    .into(avatarView);

            nicknameText.setText(profile.getNickname());
            uidText.setText(getString(R.string.uid_format, profile.getUid()));
            deviceCountText.setText(getString(R.string.device_count_format, profile.getDeviceCount()));
        }
    }

    private void setupMenuItems() {
        findViewById(R.id.menu_model_center).setOnClickListener(v -> {
            startActivity(new Intent(this, ModelManagerActivity.class));
        });

        findViewById(R.id.menu_lora_train).setOnClickListener(v -> {
            startActivity(new Intent(this, LoraTrainActivity.class));
        });

        findViewById(R.id.menu_knowledge_base).setOnClickListener(v -> {
            startActivity(new Intent(this, KnowledgeBaseActivity.class));
        });

        findViewById(R.id.menu_settings).setOnClickListener(v -> {
            startActivity(new Intent(this, com.omniai.assistant.ui.settings.SettingsActivity.class));
        });

        findViewById(R.id.menu_about).setOnClickListener(v -> {
            showAboutDialog();
        });
    }

    private void setupVipCard() {
        VipManager.VipInfo vipInfo = vipManager.getVipInfo();
        if (vipInfo != null && vipInfo.isActive()) {
            vipBadge.setVisibility(View.VISIBLE);
            vipExpiryText.setText(getString(R.string.vip_expiry_format, vipInfo.getExpiryDate()));
        } else {
            vipBadge.setVisibility(View.GONE);
            vipExpiryText.setText(R.string.vip_not_active);
        }

        findViewById(R.id.btn_upgrade_vip).setOnClickListener(v -> {
            vipManager.subscribe(this, new VipManager.SubscribeCallback() {
                @Override
                public void onSuccess() {
                    runOnUiThread(() -> {
                        showSnackbar(getString(R.string.vip_subscribe_success));
                        setupVipCard();
                    });
                }

                @Override
                public void onError(String message) {
                    runOnUiThread(() -> showSnackbar(message));
                }
            });
        });
    }

    private void setupLogout() {
        findViewById(R.id.btn_logout).setOnClickListener(v -> {
            new AlertDialog.Builder(this)
                    .setTitle(R.string.logout_confirm_title)
                    .setMessage(R.string.logout_confirm_message)
                    .setPositiveButton(R.string.confirm, (dialog, which) -> {
                        userManager.logout();
                        Intent intent = new Intent(this, LoginActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                        finish();
                    })
                    .setNegativeButton(R.string.cancel, null)
                    .show();
        });
    }

    private void showAboutDialog() {
        new AlertDialog.Builder(this)
                .setTitle(R.string.about_title)
                .setMessage(R.string.about_message)
                .setPositiveButton(R.string.ok, null)
                .show();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadUserProfile();
        setupVipCard();
    }

    private void showSnackbar(String message) {
        Snackbar.make(findViewById(android.R.id.content), message, Snackbar.LENGTH_SHORT).show();
    }
}
