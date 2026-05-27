package com.omniai.assistant.ui.login;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.material.snackbar.Snackbar;
import com.omniai.assistant.R;
import com.omniai.assistant.manager.UserManager;
import com.omniai.assistant.ui.chat.ChatActivity;

public class LoginActivity extends AppCompatActivity {

    private static final int RC_GOOGLE_SIGN_IN = 9001;

    private EditText accountInput;
    private EditText passwordInput;
    private EditText phoneInput;
    private EditText codeInput;
    private Button loginBtn;
    private View passwordSection;
    private View codeSection;
    private TextView toggleMode;
    private TextView switchToRegister;

    private boolean isPasswordMode = true;
    private UserManager userManager;
    private GoogleSignInClient googleSignInClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        userManager = UserManager.getInstance(this);

        accountInput = findViewById(R.id.input_account);
        passwordInput = findViewById(R.id.input_password);
        phoneInput = findViewById(R.id.input_phone);
        codeInput = findViewById(R.id.input_code);
        loginBtn = findViewById(R.id.btn_login);
        passwordSection = findViewById(R.id.section_password);
        codeSection = findViewById(R.id.section_code);
        toggleMode = findViewById(R.id.tv_toggle_mode);
        switchToRegister = findViewById(R.id.tv_switch_register);

        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestProfile()
                .build();
        googleSignInClient = GoogleSignIn.getClient(this, gso);

        toggleMode.setOnClickListener(v -> {
            isPasswordMode = !isPasswordMode;
            updateModeUI();
        });

        switchToRegister.setOnClickListener(v -> {
            startActivity(new Intent(this, RegisterActivity.class));
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
        });

        loginBtn.setOnClickListener(v -> attemptLogin());

        findViewById(R.id.btn_google).setOnClickListener(v -> {
            Intent signInIntent = googleSignInClient.getSignInIntent();
            startActivityForResult(signInIntent, RC_GOOGLE_SIGN_IN);
        });

        findViewById(R.id.btn_wechat).setOnClickListener(v -> loginWithWeChat());
        findViewById(R.id.btn_qq).setOnClickListener(v -> loginWithQQ());
        findViewById(R.id.btn_apple).setOnClickListener(v -> loginWithApple());

        findViewById(R.id.btn_send_code).setOnClickListener(v -> sendVerificationCode());

        updateModeUI();
    }

    private void updateModeUI() {
        if (isPasswordMode) {
            passwordSection.setVisibility(View.VISIBLE);
            codeSection.setVisibility(View.GONE);
            phoneInput.setVisibility(View.GONE);
            toggleMode.setText(R.string.switch_to_code_login);
        } else {
            passwordSection.setVisibility(View.GONE);
            codeSection.setVisibility(View.VISIBLE);
            phoneInput.setVisibility(View.VISIBLE);
            toggleMode.setText(R.string.switch_to_password_login);
        }
    }

    private void attemptLogin() {
        if (isPasswordMode) {
            loginWithPassword();
        } else {
            loginWithCode();
        }
    }

    private void loginWithPassword() {
        String account = accountInput.getText().toString().trim();
        String password = passwordInput.getText().toString().trim();

        if (TextUtils.isEmpty(account)) {
            showSnackbar(getString(R.string.error_account_empty));
            return;
        }

        if (!isValidAccount(account)) {
            showSnackbar(getString(R.string.error_account_format));
            return;
        }

        if (TextUtils.isEmpty(password)) {
            showSnackbar(getString(R.string.error_password_empty));
            return;
        }

        loginBtn.setEnabled(false);
        userManager.login(account, password, new UserManager.LoginCallback() {
            @Override
            public void onSuccess() {
                navigateToChat();
            }

            @Override
            public void onError(String message) {
                loginBtn.setEnabled(true);
                showSnackbar(message);
            }
        });
    }

    private void loginWithCode() {
        String phone = phoneInput.getText().toString().trim();
        String code = codeInput.getText().toString().trim();

        if (TextUtils.isEmpty(phone)) {
            showSnackbar(getString(R.string.error_phone_empty));
            return;
        }

        if (!isValidPhone(phone)) {
            showSnackbar(getString(R.string.error_phone_format));
            return;
        }

        if (TextUtils.isEmpty(code)) {
            showSnackbar(getString(R.string.error_code_empty));
            return;
        }

        loginBtn.setEnabled(false);
        userManager.loginWithCode(phone, code, new UserManager.LoginCallback() {
            @Override
            public void onSuccess() {
                navigateToChat();
            }

            @Override
            public void onError(String message) {
                loginBtn.setEnabled(true);
                showSnackbar(message);
            }
        });
    }

    private void sendVerificationCode() {
        String phone = phoneInput.getText().toString().trim();
        if (TextUtils.isEmpty(phone)) {
            showSnackbar(getString(R.string.error_phone_empty));
            return;
        }
        if (!isValidPhone(phone)) {
            showSnackbar(getString(R.string.error_phone_format));
            return;
        }
        userManager.sendVerificationCode(phone, new UserManager.CodeCallback() {
            @Override
            public void onSuccess() {
                showSnackbar(getString(R.string.code_sent));
            }

            @Override
            public void onError(String message) {
                showSnackbar(message);
            }
        });
    }

    private void loginWithWeChat() {
        userManager.loginWeChat(this, new UserManager.LoginCallback() {
            @Override
            public void onSuccess() {
                navigateToChat();
            }

            @Override
            public void onError(String message) {
                showSnackbar(message);
            }
        });
    }

    private void loginWithQQ() {
        userManager.loginQQ(this, new UserManager.LoginCallback() {
            @Override
            public void onSuccess() {
                navigateToChat();
            }

            @Override
            public void onError(String message) {
                showSnackbar(message);
            }
        });
    }

    private void loginWithApple() {
        userManager.loginApple(this, new UserManager.LoginCallback() {
            @Override
            public void onSuccess() {
                navigateToChat();
            }

            @Override
            public void onError(String message) {
                showSnackbar(message);
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == RC_GOOGLE_SIGN_IN) {
            userManager.handleGoogleSignInResult(data, new UserManager.LoginCallback() {
                @Override
                public void onSuccess() {
                    navigateToChat();
                }

                @Override
                public void onError(String message) {
                    showSnackbar(message);
                }
            });
        }
    }

    private void navigateToChat() {
        Intent intent = new Intent(this, ChatActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
        finish();
    }

    private boolean isValidAccount(String account) {
        return isValidEmail(account) || isValidPhone(account);
    }

    private boolean isValidEmail(String email) {
        return !TextUtils.isEmpty(email) && android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches();
    }

    private boolean isValidPhone(String phone) {
        return !TextUtils.isEmpty(phone) && phone.matches("^1[3-9]\\d{9}$");
    }

    private void showSnackbar(String message) {
        Snackbar.make(findViewById(android.R.id.content), message, Snackbar.LENGTH_SHORT).show();
    }
}
