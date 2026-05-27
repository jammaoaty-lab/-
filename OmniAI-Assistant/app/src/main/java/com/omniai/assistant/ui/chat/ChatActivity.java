package com.omniai.assistant.ui.chat;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.google.android.material.snackbar.Snackbar;
import com.omniai.assistant.R;
import com.omniai.assistant.adapter.ChatMessageAdapter;
import com.omniai.assistant.adapter.ConversationAdapter;
import com.omniai.assistant.adapter.QuickCommandAdapter;
import com.omniai.assistant.manager.ChatManager;
import com.omniai.assistant.manager.ContextManager;
import com.omniai.assistant.manager.StreamBuffer;
import com.omniai.assistant.manager.UserManager;
import com.omniai.assistant.model.ChatMessage;
import com.omniai.assistant.model.Conversation;
import com.omniai.assistant.model.QuickCommand;
import com.omniai.assistant.scheduler.AIScheduler;
import com.omniai.assistant.ui.login.LoginActivity;
import com.omniai.assistant.ui.profile.ProfileActivity;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ChatActivity extends AppCompatActivity {

    private DrawerLayout drawerLayout;
    private RecyclerView messageList;
    private RecyclerView quickCommandList;
    private EditText inputText;
    private Button sendBtn;
    private ImageButton voiceBtn;
    private ImageButton addBtn;
    private View sidebarView;
    private RecyclerView conversationList;
    private TextView modelNameText;
    private View statusIndicator;

    private ChatMessageAdapter messageAdapter;
    private ConversationAdapter conversationAdapter;
    private QuickCommandAdapter quickCommandAdapter;
    private ChatManager chatManager;
    private AIScheduler scheduler;
    private StreamBuffer streamBuffer;
    private ContextManager contextManager;
    private UserManager userManager;

    private SpeechRecognizer speechRecognizer;
    private boolean isListening = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat);

        userManager = UserManager.getInstance(this);
        chatManager = ChatManager.getInstance(this);
        scheduler = AIScheduler.getInstance(this);
        streamBuffer = StreamBuffer.getInstance();
        contextManager = ContextManager.getInstance(this);

        initViews();
        setupAdapters();
        setupDrawer();
        setupQuickCommands();
        loadConversations();

        sendBtn.setOnClickListener(v -> sendMessage());
        voiceBtn.setOnClickListener(v -> toggleVoiceInput());
        addBtn.setOnClickListener(v -> showAddOptions());

        findViewById(R.id.btn_new_chat).setOnClickListener(v -> createNewChat());
        findViewById(R.id.btn_profile).setOnClickListener(v -> {
            startActivity(new Intent(this, ProfileActivity.class));
        });

        modelNameText.setText(chatManager.getCurrentModelName());
        updateStatusIndicator(false);
    }

    private void initViews() {
        drawerLayout = findViewById(R.id.drawer_layout);
        messageList = findViewById(R.id.rv_messages);
        quickCommandList = findViewById(R.id.rv_quick_commands);
        inputText = findViewById(R.id.et_input);
        sendBtn = findViewById(R.id.btn_send);
        voiceBtn = findViewById(R.id.btn_voice);
        addBtn = findViewById(R.id.btn_add);
        sidebarView = findViewById(R.id.sidebar);
        conversationList = findViewById(R.id.rv_conversations);
        modelNameText = findViewById(R.id.tv_model_name);
        statusIndicator = findViewById(R.id.status_indicator);
    }

    private void setupAdapters() {
        messageAdapter = new ChatMessageAdapter(new ArrayList<>());
        LinearLayoutManager messageLayoutManager = new LinearLayoutManager(this);
        messageLayoutManager.setStackFromEnd(true);
        messageList.setLayoutManager(messageLayoutManager);
        messageList.setAdapter(messageAdapter);

        conversationAdapter = new ConversationAdapter(new ArrayList<>(), new ConversationAdapter.OnConversationListener() {
            @Override
            public void onConversationClick(Conversation conversation) {
                switchConversation(conversation);
            }

            @Override
            public void onConversationDelete(Conversation conversation) {
                chatManager.deleteConversation(conversation.getId());
                loadConversations();
            }
        });
        conversationList.setLayoutManager(new LinearLayoutManager(this));
        conversationList.setAdapter(conversationAdapter);
    }

    private void setupDrawer() {
        drawerLayout.setDrawerLockMode(DrawerLayout.LOCK_MODE_LOCKED_CLOSED);
        findViewById(R.id.btn_menu).setOnClickListener(v -> {
            drawerLayout.openDrawer(GravityCompat.START);
        });

        drawerLayout.addDrawerListener(new DrawerLayout.DrawerListener() {
            @Override
            public void onDrawerSlide(@NonNull View drawerView, float slideOffset) {}

            @Override
            public void onDrawerOpened(@NonNull View drawerView) {}

            @Override
            public void onDrawerClosed(@NonNull View drawerView) {}

            @Override
            public void onDrawerStateChanged(int newState) {}
        });
    }

    private void setupQuickCommands() {
        List<QuickCommand> commands = chatManager.getQuickCommands();
        quickCommandAdapter = new QuickCommandAdapter(commands, command -> {
            inputText.setText(command.getTemplate());
            inputText.setSelection(inputText.getText().length());
        });
        LinearLayoutManager cmdLayoutManager = new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false);
        quickCommandList.setLayoutManager(cmdLayoutManager);
        quickCommandList.setAdapter(quickCommandAdapter);
    }

    private void loadConversations() {
        List<Conversation> conversations = chatManager.getConversations();
        conversationAdapter.updateData(conversations);

        if (chatManager.getCurrentConversation() != null) {
            loadMessages(chatManager.getCurrentConversation());
        }
    }

    private void loadMessages(Conversation conversation) {
        List<ChatMessage> messages = chatManager.getMessages(conversation.getId());
        messageAdapter.updateData(messages);
        messageList.scrollToPosition(messageAdapter.getItemCount() - 1);
    }

    private void sendMessage() {
        String text = inputText.getText().toString().trim();
        if (TextUtils.isEmpty(text)) {
            return;
        }

        inputText.setText("");

        ChatMessage userMessage = ChatMessage.createUserMessage(text);
        messageAdapter.addMessage(userMessage);
        messageList.scrollToPosition(messageAdapter.getItemCount() - 1);

        ChatMessage aiMessage = ChatMessage.createAiMessage("");
        messageAdapter.addMessage(aiMessage);
        messageList.scrollToPosition(messageAdapter.getItemCount() - 1);

        updateStatusIndicator(true);
        modelNameText.setText(getString(R.string.ai_thinking, chatManager.getCurrentModelName()));

        chatManager.saveUserMessage(userMessage);

        scheduler.dispatch(text, contextManager.buildContext(text), new AIScheduler.ScheduleCallback() {
            @Override
            public void onToken(String token) {
                runOnUiThread(() -> {
                    streamBuffer.append(token);
                    aiMessage.setContent(streamBuffer.flush());
                    messageAdapter.updateLastMessage(aiMessage);
                    messageList.scrollToPosition(messageAdapter.getItemCount() - 1);
                });
            }

            @Override
            public void onComplete(String fullResponse) {
                runOnUiThread(() -> {
                    aiMessage.setContent(fullResponse);
                    messageAdapter.updateLastMessage(aiMessage);
                    updateStatusIndicator(false);
                    modelNameText.setText(chatManager.getCurrentModelName());
                    chatManager.saveAiMessage(aiMessage);
                    streamBuffer.reset();
                });
            }

            @Override
            public void onError(String error) {
                runOnUiThread(() -> {
                    aiMessage.setContent(getString(R.string.error_ai_response, error));
                    aiMessage.setError(true);
                    messageAdapter.updateLastMessage(aiMessage);
                    updateStatusIndicator(false);
                    modelNameText.setText(chatManager.getCurrentModelName());
                    showSnackbar(error);
                    streamBuffer.reset();
                });
            }
        });
    }

    private void createNewChat() {
        Conversation conversation = chatManager.createConversation();
        conversationAdapter.addConversation(conversation);
        switchConversation(conversation);
        drawerLayout.closeDrawer(GravityCompat.START);
    }

    private void switchConversation(Conversation conversation) {
        chatManager.setCurrentConversation(conversation);
        loadMessages(conversation);
        drawerLayout.closeDrawer(GravityCompat.START);
    }

    private void toggleVoiceInput() {
        if (isListening) {
            stopVoiceInput();
        } else {
            startVoiceInput();
        }
    }

    private void startVoiceInput() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            showSnackbar(getString(R.string.speech_not_available));
            return;
        }

        if (speechRecognizer == null) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
            speechRecognizer.setRecognitionListener(new RecognitionListener() {
                @Override
                public void onReadyForSpeech(Bundle params) {
                    isListening = true;
                    voiceBtn.setImageResource(R.drawable.ic_mic_active);
                }

                @Override
                public void onBeginningOfSpeech() {}

                @Override
                public void onRmsChanged(float rmsdB) {}

                @Override
                public void onBufferReceived(byte[] buffer) {}

                @Override
                public void onEndOfSpeech() {
                    stopVoiceInput();
                }

                @Override
                public void onError(int error) {
                    stopVoiceInput();
                    if (error != SpeechRecognizer.ERROR_NO_MATCH) {
                        showSnackbar(getString(R.string.speech_error));
                    }
                }

                @Override
                public void onResults(Bundle results) {
                    ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (matches != null && !matches.isEmpty()) {
                        inputText.setText(matches.get(0));
                        inputText.setSelection(inputText.getText().length());
                    }
                }

                @Override
                public void onPartialResults(Bundle partialResults) {}

                @Override
                public void onEvent(int eventType, Bundle params) {}
            });
        }

        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        speechRecognizer.startListening(intent);
    }

    private void stopVoiceInput() {
        isListening = false;
        voiceBtn.setImageResource(R.drawable.ic_mic);
        if (speechRecognizer != null) {
            speechRecognizer.stopListening();
        }
    }

    private void showAddOptions() {
        BottomSheetDialog bottomSheet = new BottomSheetDialog(this);
        View sheetView = getLayoutInflater().inflate(R.layout.bottom_sheet_add_options, null);
        bottomSheet.setContentView(sheetView);

        sheetView.findViewById(R.id.option_image).setOnClickListener(v -> {
            bottomSheet.dismiss();
            pickImage();
        });

        sheetView.findViewById(R.id.option_voice).setOnClickListener(v -> {
            bottomSheet.dismiss();
            startVoiceInput();
        });

        sheetView.findViewById(R.id.option_document).setOnClickListener(v -> {
            bottomSheet.dismiss();
            pickDocument();
        });

        bottomSheet.show();
    }

    private void pickImage() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("image/*");
        startActivityForResult(intent, 1001);
    }

    private void pickDocument() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("*/*");
        String[] mimeTypes = {"application/pdf", "text/plain", "text/csv"};
        intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
        startActivityForResult(intent, 1002);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK && data != null) {
            if (requestCode == 1001) {
                chatManager.handleImageUpload(data.getData(), new ChatManager.UploadCallback() {
                    @Override
                    public void onSuccess(String description) {
                        runOnUiThread(() -> {
                            inputText.setText(description);
                            inputText.setSelection(inputText.getText().length());
                        });
                    }

                    @Override
                    public void onError(String message) {
                        runOnUiThread(() -> showSnackbar(message));
                    }
                });
            } else if (requestCode == 1002) {
                chatManager.handleDocumentUpload(data.getData(), new ChatManager.UploadCallback() {
                    @Override
                    public void onSuccess(String description) {
                        runOnUiThread(() -> {
                            inputText.setText(description);
                            inputText.setSelection(inputText.getText().length());
                        });
                    }

                    @Override
                    public void onError(String message) {
                        runOnUiThread(() -> showSnackbar(message));
                    }
                });
            }
        }
    }

    private void updateStatusIndicator(boolean isThinking) {
        if (isThinking) {
            statusIndicator.setAlpha(1.0f);
            statusIndicator.setBackgroundResource(R.drawable.bg_status_thinking);
        } else {
            statusIndicator.setAlpha(0.5f);
            statusIndicator.setBackgroundResource(R.drawable.bg_status_idle);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (userManager.isTokenExpired()) {
            userManager.refreshToken(new UserManager.TokenCallback() {
                @Override
                public void onSuccess() {}

                @Override
                public void onError(String message) {
                    navigateToLogin();
                }
            });
        }
        loadConversations();
    }

    @Override
    public void onBackPressed() {
        if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
            drawerLayout.closeDrawer(GravityCompat.START);
        } else {
            moveTaskToBack(true);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
            speechRecognizer = null;
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == 2001) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startVoiceInput();
            } else {
                showSnackbar(getString(R.string.permission_denied));
            }
        }
    }

    private void navigateToLogin() {
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    private void showSnackbar(String message) {
        Snackbar.make(findViewById(android.R.id.content), message, Snackbar.LENGTH_SHORT).show();
    }
}
