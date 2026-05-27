package com.omniai.assistant.ui.lora;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.omniai.assistant.R;
import com.omniai.assistant.manager.DataSetProcessor;
import com.omniai.assistant.manager.LoraTrainManager;

public class LoraTrainActivity extends AppCompatActivity {

    private static final int PICK_DATASET_FILE = 4001;

    private SeekBar rankSeek;
    private SeekBar alphaSeek;
    private SeekBar epochsSeek;
    private SeekBar batchSizeSeek;
    private SeekBar dropoutSeek;
    private EditText lrInput;
    private EditText ctxInput;
    private ProgressBar progressBar;
    private TextView progressText;
    private TextView logOutput;
    private Button startBtn;
    private Button pauseBtn;
    private Button resumeBtn;
    private Button stopBtn;
    private Button exportBtn;

    private LoraTrainManager trainManager;
    private DataSetProcessor dataSetProcessor;
    private Handler uiHandler;

    private LoraTrainManager.TrainState currentState = LoraTrainManager.TrainState.IDLE;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_lora_train);

        trainManager = LoraTrainManager.getInstance(this);
        dataSetProcessor = DataSetProcessor.getInstance(this);
        uiHandler = new Handler(Looper.getMainLooper());

        rankSeek = findViewById(R.id.seek_rank);
        alphaSeek = findViewById(R.id.seek_alpha);
        epochsSeek = findViewById(R.id.seek_epochs);
        batchSizeSeek = findViewById(R.id.seek_batch_size);
        dropoutSeek = findViewById(R.id.seek_dropout);
        lrInput = findViewById(R.id.input_lr);
        ctxInput = findViewById(R.id.input_ctx);
        progressBar = findViewById(R.id.progress_bar);
        progressText = findViewById(R.id.tv_progress);
        logOutput = findViewById(R.id.tv_log);
        startBtn = findViewById(R.id.btn_start);
        pauseBtn = findViewById(R.id.btn_pause);
        resumeBtn = findViewById(R.id.btn_resume);
        stopBtn = findViewById(R.id.btn_stop);
        exportBtn = findViewById(R.id.btn_export);

        setupSeekBarListeners();
        setupButtons();
        updateButtonStates();
    }

    private void setupSeekBarListeners() {
        TextView rankLabel = findViewById(R.id.tv_rank_value);
        rankSeek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                rankLabel.setText(String.valueOf(progress + 1));
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        TextView alphaLabel = findViewById(R.id.tv_alpha_value);
        alphaSeek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                alphaLabel.setText(String.valueOf(progress + 1));
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        TextView epochsLabel = findViewById(R.id.tv_epochs_value);
        epochsSeek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                epochsLabel.setText(String.valueOf(progress + 1));
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        TextView batchLabel = findViewById(R.id.tv_batch_value);
        batchSizeSeek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                batchLabel.setText(String.valueOf(progress + 1));
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        TextView dropoutLabel = findViewById(R.id.tv_dropout_value);
        dropoutSeek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                float value = progress / 100.0f;
                dropoutLabel.setText(String.format("%.2f", value));
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });
    }

    private void setupButtons() {
        startBtn.setOnClickListener(v -> startTraining());
        pauseBtn.setOnClickListener(v -> pauseTraining());
        resumeBtn.setOnClickListener(v -> resumeTraining());
        stopBtn.setOnClickListener(v -> stopTraining());
        exportBtn.setOnClickListener(v -> exportModel());

        findViewById(R.id.btn_import_dataset).setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
            intent.setType("*/*");
            String[] mimeTypes = {"application/json", "text/plain", "application/zip"};
            intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
            startActivityForResult(intent, PICK_DATASET_FILE);
        });
    }

    private void startTraining() {
        int rank = rankSeek.getProgress() + 1;
        int alpha = alphaSeek.getProgress() + 1;
        int epochs = epochsSeek.getProgress() + 1;
        int batchSize = batchSizeSeek.getProgress() + 1;
        float dropout = dropoutSeek.getProgress() / 100.0f;

        String lrStr = lrInput.getText().toString().trim();
        String ctxStr = ctxInput.getText().toString().trim();

        if (lrStr.isEmpty()) {
            Toast.makeText(this, R.string.error_lr_empty, Toast.LENGTH_SHORT).show();
            return;
        }
        if (ctxStr.isEmpty()) {
            Toast.makeText(this, R.string.error_ctx_empty, Toast.LENGTH_SHORT).show();
            return;
        }

        float learningRate = Float.parseFloat(lrStr);
        int contextLength = Integer.parseInt(ctxStr);

        LoraTrainManager.TrainConfig config = new LoraTrainManager.TrainConfig(
                rank, alpha, epochs, batchSize, dropout, learningRate, contextLength
        );

        currentState = LoraTrainManager.TrainState.TRAINING;
        updateButtonStates();

        trainManager.startTraining(config, new LoraTrainManager.TrainCallback() {
            @Override
            public void onProgress(int current, int total, float loss) {
                uiHandler.post(() -> {
                    int percent = (int) ((current / (float) total) * 100);
                    progressBar.setProgress(percent);
                    progressText.setText(getString(R.string.train_progress_format, current, total, loss));
                });
            }

            @Override
            public void onLog(String message) {
                uiHandler.post(() -> {
                    logOutput.append(message + "\n");
                });
            }

            @Override
            public void onComplete() {
                uiHandler.post(() -> {
                    currentState = LoraTrainManager.TrainState.COMPLETED;
                    updateButtonStates();
                    progressBar.setProgress(100);
                    progressText.setText(R.string.train_completed);
                    Toast.makeText(LoraTrainActivity.this, R.string.train_completed, Toast.LENGTH_SHORT).show();
                });
            }

            @Override
            public void onError(String message) {
                uiHandler.post(() -> {
                    currentState = LoraTrainManager.TrainState.IDLE;
                    updateButtonStates();
                    Toast.makeText(LoraTrainActivity.this, message, Toast.LENGTH_SHORT).show();
                });
            }
        });
    }

    private void pauseTraining() {
        trainManager.pauseTraining();
        currentState = LoraTrainManager.TrainState.PAUSED;
        updateButtonStates();
    }

    private void resumeTraining() {
        trainManager.resumeTraining();
        currentState = LoraTrainManager.TrainState.TRAINING;
        updateButtonStates();
    }

    private void stopTraining() {
        trainManager.stopTraining();
        currentState = LoraTrainManager.TrainState.IDLE;
        updateButtonStates();
        progressBar.setProgress(0);
        progressText.setText("");
    }

    private void exportModel() {
        trainManager.exportModel(new LoraTrainManager.ExportCallback() {
            @Override
            public void onSuccess(String path) {
                uiHandler.post(() -> {
                    Toast.makeText(LoraTrainActivity.this,
                            getString(R.string.export_success, path), Toast.LENGTH_SHORT).show();
                });
            }

            @Override
            public void onError(String message) {
                uiHandler.post(() -> {
                    Toast.makeText(LoraTrainActivity.this, message, Toast.LENGTH_SHORT).show();
                });
            }
        });
    }

    private void updateButtonStates() {
        startBtn.setVisibility(currentState == LoraTrainManager.TrainState.IDLE ? View.VISIBLE : View.GONE);
        pauseBtn.setVisibility(currentState == LoraTrainManager.TrainState.TRAINING ? View.VISIBLE : View.GONE);
        stopBtn.setVisibility(currentState == LoraTrainManager.TrainState.TRAINING || currentState == LoraTrainManager.TrainState.PAUSED ? View.VISIBLE : View.GONE);
        resumeBtn.setVisibility(currentState == LoraTrainManager.TrainState.PAUSED ? View.VISIBLE : View.GONE);
        exportBtn.setVisibility(currentState == LoraTrainManager.TrainState.COMPLETED ? View.VISIBLE : View.GONE);

        boolean canEdit = currentState == LoraTrainManager.TrainState.IDLE;
        rankSeek.setEnabled(canEdit);
        alphaSeek.setEnabled(canEdit);
        epochsSeek.setEnabled(canEdit);
        batchSizeSeek.setEnabled(canEdit);
        dropoutSeek.setEnabled(canEdit);
        lrInput.setEnabled(canEdit);
        ctxInput.setEnabled(canEdit);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_DATASET_FILE && resultCode == RESULT_OK && data != null) {
            Uri uri = data.getData();
            if (uri != null) {
                dataSetProcessor.process(uri, new DataSetProcessor.ProcessCallback() {
                    @Override
                    public void onSuccess(String datasetId) {
                        uiHandler.post(() -> {
                            trainManager.setDataset(datasetId);
                            Toast.makeText(LoraTrainActivity.this, R.string.dataset_imported, Toast.LENGTH_SHORT).show();
                        });
                    }

                    @Override
                    public void onError(String message) {
                        uiHandler.post(() -> Toast.makeText(LoraTrainActivity.this, message, Toast.LENGTH_SHORT).show());
                    }
                });
            }
        }
    }
}
