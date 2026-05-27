package com.omniai.assistant.ui.model;

import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.tabs.TabLayout;
import com.omniai.assistant.R;
import com.omniai.assistant.manager.ModelManager;
import com.omniai.assistant.model.AIModel;

import java.util.ArrayList;
import java.util.List;

public class ModelManagerActivity extends AppCompatActivity {

    private static final int PICK_MODEL_FILE = 3001;

    private TabLayout tabLayout;
    private RecyclerView modelList;
    private View fabImport;
    private ModelCardAdapter adapter;
    private ModelManager modelManager;

    private List<AIModel> localModels = new ArrayList<>();
    private List<AIModel> downloadModels = new ArrayList<>();
    private int currentTab = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_model_manager);

        modelManager = ModelManager.getInstance(this);

        tabLayout = findViewById(R.id.tab_layout);
        modelList = findViewById(R.id.rv_model_list);
        fabImport = findViewById(R.id.fab_import);

        adapter = new ModelCardAdapter(new ArrayList<>(), new ModelCardAdapter.OnModelActionListener() {
            @Override
            public void onEnable(AIModel model) {
                toggleModelEnable(model);
            }

            @Override
            public void onDelete(AIModel model) {
                confirmDeleteModel(model);
            }

            @Override
            public void onClick(AIModel model) {
                handleModelClick(model);
            }
        });
        modelList.setLayoutManager(new LinearLayoutManager(this));
        modelList.setAdapter(adapter);

        tabLayout.addTab(tabLayout.newTab().setText(R.string.tab_local_models));
        tabLayout.addTab(tabLayout.newTab().setText(R.string.tab_download_models));

        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                currentTab = tab.getPosition();
                updateModelList();
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {}

            @Override
            public void onTabReselected(TabLayout.Tab tab) {}
        });

        fabImport.setOnClickListener(v -> showImportDialog());

        modelList.setOnLongClickListener(v -> false);

        loadModels();
    }

    private void loadModels() {
        localModels = modelManager.getLocalModels();
        downloadModels = modelManager.getDownloadModels();
        updateModelList();
    }

    private void updateModelList() {
        if (currentTab == 0) {
            adapter.updateData(localModels);
            fabImport.setVisibility(View.VISIBLE);
        } else {
            adapter.updateData(downloadModels);
            fabImport.setVisibility(View.GONE);
        }
    }

    private void toggleModelEnable(AIModel model) {
        if (model.isEnabled()) {
            modelManager.unloadModel(model, new ModelManager.ModelCallback() {
                @Override
                public void onSuccess() {
                    runOnUiThread(() -> {
                        model.setEnabled(false);
                        adapter.notifyDataSetChanged();
                    });
                }

                @Override
                public void onError(String message) {
                    runOnUiThread(() -> Toast.makeText(ModelManagerActivity.this, message, Toast.LENGTH_SHORT).show());
                }
            });
        } else {
            modelManager.loadModel(model, new ModelManager.ModelCallback() {
                @Override
                public void onSuccess() {
                    runOnUiThread(() -> {
                        model.setEnabled(true);
                        adapter.notifyDataSetChanged();
                    });
                }

                @Override
                public void onError(String message) {
                    runOnUiThread(() -> Toast.makeText(ModelManagerActivity.this, message, Toast.LENGTH_SHORT).show());
                }
            });
        }
    }

    private void confirmDeleteModel(AIModel model) {
        new AlertDialog.Builder(this)
                .setTitle(R.string.delete_model_title)
                .setMessage(getString(R.string.delete_model_message, model.getName()))
                .setPositiveButton(R.string.confirm, (dialog, which) -> {
                    modelManager.deleteModel(model, new ModelManager.ModelCallback() {
                        @Override
                        public void onSuccess() {
                            runOnUiThread(() -> loadModels());
                        }

                        @Override
                        public void onError(String message) {
                            runOnUiThread(() -> Toast.makeText(ModelManagerActivity.this, message, Toast.LENGTH_SHORT).show());
                        }
                    });
                })
                .setNegativeButton(R.string.cancel, null)
                .show();
    }

    private void handleModelClick(AIModel model) {
        if (currentTab == 1) {
            downloadModel(model);
            return;
        }

        if (model.isEnabled()) {
            modelManager.unloadModel(model, new ModelManager.ModelCallback() {
                @Override
                public void onSuccess() {
                    runOnUiThread(() -> {
                        model.setEnabled(false);
                        adapter.notifyDataSetChanged();
                    });
                }

                @Override
                public void onError(String message) {
                    runOnUiThread(() -> Toast.makeText(ModelManagerActivity.this, message, Toast.LENGTH_SHORT).show());
                }
            });
        } else {
            modelManager.loadModel(model, new ModelManager.ModelCallback() {
                @Override
                public void onSuccess() {
                    runOnUiThread(() -> {
                        model.setEnabled(true);
                        adapter.notifyDataSetChanged();
                    });
                }

                @Override
                public void onError(String message) {
                    runOnUiThread(() -> Toast.makeText(ModelManagerActivity.this, message, Toast.LENGTH_SHORT).show());
                }
            });
        }
    }

    private void downloadModel(AIModel model) {
        modelManager.downloadModel(model, new ModelManager.DownloadCallback() {
            @Override
            public void onProgress(int progress) {}

            @Override
            public void onSuccess() {
                runOnUiThread(() -> {
                    Toast.makeText(ModelManagerActivity.this, getString(R.string.model_download_success, model.getName()), Toast.LENGTH_SHORT).show();
                    loadModels();
                });
            }

            @Override
            public void onError(String message) {
                runOnUiThread(() -> Toast.makeText(ModelManagerActivity.this, message, Toast.LENGTH_SHORT).show());
            }
        });
    }

    private void showImportDialog() {
        String[] options = {getString(R.string.import_from_file), getString(R.string.import_from_url)};
        new AlertDialog.Builder(this)
                .setTitle(R.string.import_model)
                .setItems(options, (dialog, which) -> {
                    if (which == 0) {
                        pickModelFile();
                    } else {
                        showUrlImportDialog();
                    }
                })
                .show();
    }

    private void pickModelFile() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("*/*");
        String[] mimeTypes = {"application/octet-stream", "application/zip", "application/x-gzip"};
        intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
        startActivityForResult(intent, PICK_MODEL_FILE);
    }

    private void showUrlImportDialog() {
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_import_url, null);
        new AlertDialog.Builder(this)
                .setTitle(R.string.import_from_url)
                .setView(dialogView)
                .setPositiveButton(R.string.import_model, (dialog, which) -> {
                    android.widget.EditText urlInput = dialogView.findViewById(R.id.input_url);
                    String url = urlInput.getText().toString().trim();
                    if (!url.isEmpty()) {
                        importModelFromUrl(url);
                    }
                })
                .setNegativeButton(R.string.cancel, null)
                .show();
    }

    private void importModelFromUrl(String url) {
        modelManager.importModel(url, new ModelManager.ModelCallback() {
            @Override
            public void onSuccess() {
                runOnUiThread(() -> {
                    Toast.makeText(ModelManagerActivity.this, R.string.import_success, Toast.LENGTH_SHORT).show();
                    loadModels();
                });
            }

            @Override
            public void onError(String message) {
                runOnUiThread(() -> Toast.makeText(ModelManagerActivity.this, message, Toast.LENGTH_SHORT).show());
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_MODEL_FILE && resultCode == RESULT_OK && data != null) {
            Uri uri = data.getData();
            if (uri != null) {
                modelManager.importModel(uri, new ModelManager.ModelCallback() {
                    @Override
                    public void onSuccess() {
                        runOnUiThread(() -> {
                            Toast.makeText(ModelManagerActivity.this, R.string.import_success, Toast.LENGTH_SHORT).show();
                            loadModels();
                        });
                    }

                    @Override
                    public void onError(String message) {
                        runOnUiThread(() -> Toast.makeText(ModelManagerActivity.this, message, Toast.LENGTH_SHORT).show());
                    }
                });
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadModels();
    }
}
