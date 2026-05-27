package com.omniai.assistant.ui.terminal;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ScrollView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.content.ContextCompat;

import com.omniai.assistant.R;
import com.omniai.assistant.common.Constants;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class TerminalActivity extends AppCompatActivity {

    private static final String TAG = "TerminalActivity";
    private static final String ASSETS_BIN_DIR = "llama-bin";
    private static final String SCRIPT_COPY_FAILED = "Failed to copy %s to app dir\n";
    private static final String PROMPT = "llama> ";
    private static final int MAX_LINES = 1000;

    private TextView tvOutput;
    private EditText etInput;
    private ScrollView scrollView;
    private ImageButton btnSend;

    private StringBuilder outputBuffer = new StringBuilder();
    private List<String> commandHistory = new ArrayList<>();
    private int historyIndex = -1;

    private File appFilesDir;
    private File appBinDir;
    private Handler mainHandler = new Handler(Looper.getMainLooper());
    private ExecutorService executorService = Executors.newSingleThreadExecutor();

    public static void start(Context context) {
        context.startActivity(new Intent(context, TerminalActivity.class));
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_terminal);

        initViews();
        initPaths();
        setupToolbar();
        setupListeners();
        
        appendWelcomeMessage();
        executorService.execute(this::initializeBinaries);
    }

    private void initViews() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        tvOutput = findViewById(R.id.tvOutput);
        etInput = findViewById(R.id.etInput);
        scrollView = findViewById(R.id.scrollView);
        btnSend = findViewById(R.id.btnSend);
    }

    private void initPaths() {
        appFilesDir = getFilesDir();
        appBinDir = new File(appFilesDir, "bin");
        if (!appBinDir.exists()) {
            appBinDir.mkdirs();
        }
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setTitle("OmniAI Terminal");
        toolbar.setTitleTextColor(0xFF00FF00);
        toolbar.setNavigationOnClickListener(v -> finish());
    }

    private void setupListeners() {
        btnSend.setOnClickListener(v -> executeCurrentInput());
        
        etInput.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_DONE || 
                (event != null && event.getKeyCode() == KeyEvent.KEYCODE_ENTER && event.getAction() == KeyEvent.ACTION_DOWN)) {
                executeCurrentInput();
                return true;
            }
            return false;
        });

        etInput.setOnKeyListener((v, keyCode, event) -> {
            if (event.getAction() == KeyEvent.ACTION_DOWN) {
                if (keyCode == KeyEvent.KEYCODE_DPAD_UP && historyIndex > 0) {
                    historyIndex--;
                    etInput.setText(commandHistory.get(historyIndex));
                    etInput.setSelection(etInput.getText().length());
                    return true;
                } else if (keyCode == KeyEvent.KEYCODE_DPAD_DOWN) {
                    if (historyIndex < commandHistory.size() - 1) {
                        historyIndex++;
                        etInput.setText(commandHistory.get(historyIndex));
                    } else {
                        historyIndex = commandHistory.size();
                        etInput.setText("");
                    }
                    etInput.setSelection(etInput.getText().length());
                    return true;
                }
            }
            return false;
        });
    }

    private void appendWelcomeMessage() {
        String welcome = "OmniAI Terminal v1.0\n" +
                        "======================\n" +
                        "llama.cpp command shell ready\n" +
                        "Type 'help' for available commands\n\n";
        appendOutput(welcome);
    }

    private void initializeBinaries() {
        appendOutput("[Initializing llama.cpp binaries...]\n");
        
        try {
            String[] assets = getAssets().list(ASSETS_BIN_DIR);
            if (assets != null) {
                for (String asset : assets) {
                    copyAssetToBin(asset);
                }
            }
            
            checkAndSetPermissions();
            
            appendOutput("[Binaries ready]\n");
            appendOutput(String.format("Working directory: %s\n", appBinDir.getAbsolutePath()));
            
        } catch (IOException e) {
            appendOutput(String.format(SCRIPT_COPY_FAILED, e.getMessage()));
        }
    }

    private void copyAssetToBin(String filename) {
        File destFile = new File(appBinDir, filename);
        
        if (destFile.exists()) {
            appendOutput(String.format("- %s exists, skipping\n", filename));
            return;
        }

        appendOutput(String.format("- Copying %s...", filename));
        
        try (InputStream is = getAssets().open(ASSETS_BIN_DIR + "/" + filename);
             FileOutputStream os = new FileOutputStream(destFile)) {
            
            byte[] buffer = new byte[8192];
            int read;
            while ((read = is.read(buffer)) != -1) {
                os.write(buffer, 0, read);
            }
            
            appendOutput("done\n");
            
        } catch (IOException e) {
            appendOutput(String.format("failed: %s\n", e.getMessage()));
        }
    }

    private void checkAndSetPermissions() {
        File[] files = appBinDir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (!file.canExecute()) {
                    boolean success = file.setExecutable(true);
                    appendOutput(String.format("- chmod +x %s: %s\n",
                        file.getName(), success ? "OK" : "failed"));
                }
            }
        }
    }

    private void executeCurrentInput() {
        String command = etInput.getText().toString().trim();
        if (TextUtils.isEmpty(command)) return;
        
        // Add to history
        commandHistory.add(command);
        historyIndex = commandHistory.size();
        etInput.setText("");
        
        appendOutput(PROMPT + command + "\n");
        executeCommand(command);
    }

    private void executeCommand(String command) {
        executorService.execute(() -> {
            try {
                String[] args = command.split("\\s+");
                if (args.length == 0) return;
                
                switch (args[0].toLowerCase()) {
                    case "help":
                        showHelp();
                        break;
                    case "clear":
                        clearOutput();
                        break;
                    case "ls":
                        listFiles(args);
                        break;
                    case "cd":
                        changeDirectory(args);
                        break;
                    case "pwd":
                        showWorkingDir();
                        break;
                    case "main":
                    case "server":
                    case "llama-cli":
                    case "llama-server":
                        executeLlamaCommand(command);
                        break;
                    case "exit":
                    case "quit":
                        finish();
                        break;
                    default:
                        executeShellCommand(command);
                        break;
                }
            } catch (Exception e) {
                appendOutput(String.format("Error: %s\n", e.getMessage()));
            }
        });
    }

    private void showHelp() {
        String help = "Available commands:\n" +
                     "  help          - Show this help message\n" +
                     "  clear         - Clear terminal screen\n" +
                     "  ls [path]     - List directory contents\n" +
                     "  pwd           - Show current directory\n" +
                     "  main ...      - Run llama.cpp main\n" +
                     "  server ...    - Run llama.cpp server\n" +
                     "  llama-cli ... - Run llama-cli\n" +
                     "  llama-server ... - Run llama-server\n" +
                     "  exit/quit     - Exit terminal\n";
        appendOutput(help);
    }

    private void clearOutput() {
        mainHandler.post(() -> {
            outputBuffer.setLength(0);
            tvOutput.setText("");
        });
    }

    private void listFiles(String[] args) {
        File dir = appBinDir;
        if (args.length > 1) {
            dir = new File(args[1]);
            if (!dir.isAbsolute()) {
                dir = new File(appBinDir, args[1]);
            }
        }
        
        if (!dir.exists() || !dir.isDirectory()) {
            appendOutput("ls: No such directory\n");
            return;
        }
        
        File[] files = dir.listFiles();
        if (files == null) {
            appendOutput("ls: Empty directory\n");
            return;
        }
        
        StringBuilder sb = new StringBuilder();
        for (File file : files) {
            sb.append(String.format("%s%s%s\n",
                file.isDirectory() ? "[DIR] " : "      ",
                file.getName(),
                file.canExecute() ? " *" : ""));
        }
        appendOutput(sb.toString());
    }

    private void showWorkingDir() {
        appendOutput(appBinDir.getAbsolutePath() + "\n");
    }

    private void changeDirectory(String[] args) {
        // For this terminal, we keep working dir fixed to appBinDir
        // But still show feedback
        appendOutput("cd: Working directory fixed to " + appBinDir.getAbsolutePath() + "\n");
    }

    private void executeLlamaCommand(String command) {
        executeShellCommand(command);
    }

    private void executeShellCommand(String command) {
        Process process = null;
        try {
            ProcessBuilder pb = new ProcessBuilder();
            pb.directory(appBinDir);
            pb.command("sh", "-c", command);
            pb.redirectErrorStream(true);
            
            process = pb.start();
            
            final BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()));
            
            String line;
            while ((line = reader.readLine()) != null) {
                appendOutput(line + "\n");
            }
            
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                appendOutput(String.format("[Exit code: %d]\n", exitCode));
            }
            
        } catch (Exception e) {
            appendOutput(String.format("Command failed: %s\n", e.getMessage()));
        } finally {
            if (process != null) {
                process.destroy();
            }
        }
    }

    private void appendOutput(String text) {
        mainHandler.post(() -> {
            outputBuffer.append(text);
            
            String fullText = outputBuffer.toString();
            int lineCount = 0;
            int index = fullText.length();
            while (index >= 0 && lineCount < MAX_LINES) {
                index = fullText.lastIndexOf('\n', index - 1);
                lineCount++;
            }
            
            if (lineCount >= MAX_LINES && index >= 0) {
                fullText = fullText.substring(index + 1);
                outputBuffer = new StringBuilder(fullText);
            }
            
            tvOutput.setText(fullText);
            
            scrollView.post(() -> {
                scrollView.fullScroll(View.FOCUS_DOWN);
            });
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        executorService.shutdown();
    }
}
