package com.omniai.assistant.ui.knowledge;

import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.EditText;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.snackbar.Snackbar;
import com.omniai.assistant.R;
import com.omniai.assistant.manager.KnowledgeBaseManager;
import com.omniai.assistant.model.KnowledgeBase;

import java.util.ArrayList;
import java.util.List;

public class KnowledgeBaseActivity extends AppCompatActivity {

    private static final int PICK_DOCUMENT = 5001;

    private RecyclerView kbList;
    private View fabCreate;
    private KnowledgeBaseAdapter adapter;
    private KnowledgeBaseManager kbManager;
    private EditText searchInput;

    private List<KnowledgeBase> allKnowledgeBases = new ArrayList<>();
    private String currentKbIdForImport;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_knowledge_base);

        kbManager = KnowledgeBaseManager.getInstance(this);

        kbList = findViewById(R.id.rv_kb_list);
        fabCreate = findViewById(R.id.fab_create);
        searchInput = findViewById(R.id.et_search);

        adapter = new KnowledgeBaseAdapter(new ArrayList<>(), new KnowledgeBaseAdapter.OnKbActionListener() {
            @Override
            public void onClick(KnowledgeBase kb) {
                openKbDetail(kb);
            }

            @Override
            public void onDelete(KnowledgeBase kb) {
                confirmDeleteKb(kb);
            }
        });
        kbList.setLayoutManager(new LinearLayoutManager(this));
        kbList.setAdapter(adapter);

        fabCreate.setOnClickListener(v -> showCreateDialog());

        searchInput.setOnEditorActionListener((v, actionId, event) -> {
            searchKnowledgeBases();
            return true;
        });

        loadKnowledgeBases();
    }

    private void loadKnowledgeBases() {
        allKnowledgeBases = kbManager.getAllKnowledgeBases();
        adapter.updateData(allKnowledgeBases);
    }

    private void searchKnowledgeBases() {
        String query = searchInput.getText().toString().trim();
        if (TextUtils.isEmpty(query)) {
            adapter.updateData(allKnowledgeBases);
            return;
        }

        List<KnowledgeBase> results = kbManager.search(query);
        adapter.updateData(results);
    }

    private void showCreateDialog() {
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_create_kb, null);
        EditText nameInput = dialogView.findViewById(R.id.input_kb_name);
        EditText descInput = dialogView.findViewById(R.id.input_kb_description);

        new AlertDialog.Builder(this)
                .setTitle(R.string.create_knowledge_base)
                .setView(dialogView)
                .setPositiveButton(R.string.create, (dialog, which) -> {
                    String name = nameInput.getText().toString().trim();
                    String description = descInput.getText().toString().trim();

                    if (TextUtils.isEmpty(name)) {
                        Snackbar.make(findViewById(android.R.id.content), R.string.error_kb_name_empty, Snackbar.LENGTH_SHORT).show();
                        return;
                    }

                    kbManager.createKnowledgeBase(name, description, new KnowledgeBaseManager.KbCallback() {
                        @Override
                        public void onSuccess(KnowledgeBase kb) {
                            runOnUiThread(() -> {
                                allKnowledgeBases.add(kb);
                                adapter.updateData(allKnowledgeBases);
                                Snackbar.make(findViewById(android.R.id.content), R.string.kb_created, Snackbar.LENGTH_SHORT).show();
                            });
                        }

                        @Override
                        public void onError(String message) {
                            runOnUiThread(() -> Snackbar.make(findViewById(android.R.id.content), message, Snackbar.LENGTH_SHORT).show());
                        }
                    });
                })
                .setNegativeButton(R.string.cancel, null)
                .show();
    }

    private void openKbDetail(KnowledgeBase kb) {
        currentKbIdForImport = kb.getId();

        View detailView = getLayoutInflater().inflate(R.layout.dialog_kb_detail, null);
        TextView nameView = detailView.findViewById(R.id.tv_kb_name);
        TextView docCountView = detailView.findViewById(R.id.tv_doc_count);
        TextView sizeView = detailView.findViewById(R.id.tv_kb_size);

        nameView.setText(kb.getName());
        docCountView.setText(getString(R.string.doc_count_format, kb.getDocCount()));
        sizeView.setText(formatSize(kb.getSize()));

        new AlertDialog.Builder(this)
                .setTitle(kb.getName())
                .setView(detailView)
                .setPositiveButton(R.string.import_document, (dialog, which) -> {
                    pickDocument();
                })
                .setNeutralButton(R.string.close, null)
                .show();
    }

    private void pickDocument() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("*/*");
        String[] mimeTypes = {"application/pdf", "text/plain", "text/csv", "application/json", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"};
        intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
        startActivityForResult(intent, PICK_DOCUMENT);
    }

    private void confirmDeleteKb(KnowledgeBase kb) {
        new AlertDialog.Builder(this)
                .setTitle(R.string.delete_kb_title)
                .setMessage(getString(R.string.delete_kb_message, kb.getName()))
                .setPositiveButton(R.string.confirm, (dialog, which) -> {
                    kbManager.deleteKnowledgeBase(kb.getId(), new KnowledgeBaseManager.KbCallback() {
                        @Override
                        public void onSuccess(KnowledgeBase deleted) {
                            runOnUiThread(() -> {
                                allKnowledgeBases.remove(kb);
                                adapter.updateData(allKnowledgeBases);
                            });
                        }

                        @Override
                        public void onError(String message) {
                            runOnUiThread(() -> Snackbar.make(findViewById(android.R.id.content), message, Snackbar.LENGTH_SHORT).show());
                        }
                    });
                })
                .setNegativeButton(R.string.cancel, null)
                .show();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_DOCUMENT && resultCode == RESULT_OK && data != null) {
            Uri uri = data.getData();
            if (uri != null && currentKbIdForImport != null) {
                kbManager.importDocument(currentKbIdForImport, uri, new KnowledgeBaseManager.KbCallback() {
                    @Override
                    public void onSuccess(KnowledgeBase kb) {
                        runOnUiThread(() -> {
                            loadKnowledgeBases();
                            Snackbar.make(findViewById(android.R.id.content), R.string.document_imported, Snackbar.LENGTH_SHORT).show();
                        });
                    }

                    @Override
                    public void onError(String message) {
                        runOnUiThread(() -> Snackbar.make(findViewById(android.R.id.content), message, Snackbar.LENGTH_SHORT).show());
                    }
                });
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadKnowledgeBases();
    }

    private String formatSize(long size) {
        if (size <= 0) return "0 B";
        String[] units = {"B", "KB", "MB", "GB"};
        int digitGroups = (int) (Math.log10(size) / Math.log10(1024));
        return String.format("%.1f %s", size / Math.pow(1024, digitGroups), units[digitGroups]);
    }
}
