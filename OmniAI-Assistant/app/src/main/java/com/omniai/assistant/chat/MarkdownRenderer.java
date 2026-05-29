package com.omniai.assistant.chat;

import android.graphics.Color;
import android.text.method.LinkMovementMethod;
import android.widget.TextView;

import io.noties.markwon.Markwon;
import io.noties.markwon.core.CorePlugin;
import io.noties.markwon.ext.strikethrough.StrikethroughPlugin;
import io.noties.markwon.ext.tables.TablePlugin;
import io.noties.markwon.ext.tasklist.TaskListPlugin;
import io.noties.markwon.html.HtmlPlugin;
import io.noties.markwon.image.ImagesPlugin;

public class MarkdownRenderer {

    private static volatile MarkdownRenderer instance;
    private Markwon markwon;

    private MarkdownRenderer() {
    }

    public static MarkdownRenderer getInstance() {
        if (instance == null) {
            synchronized (MarkdownRenderer.class) {
                if (instance == null) {
                    instance = new MarkdownRenderer();
                }
            }
        }
        return instance;
    }

    public void renderMarkdown(TextView textView, String markdown) {
        if (markwon == null) {
            markwon = configureMarkwon(textView);
        }
        markwon.setMarkdown(textView, markdown != null ? markdown : "");
    }

    public Markwon configureMarkwon(TextView textView) {
        if (markwon != null) {
            return markwon;
        }

        markwon = Markwon.builder(textView.getContext())
                .usePlugin(CorePlugin.create())
                .usePlugin(HtmlPlugin.create())
                .usePlugin(ImagesPlugin.create())
                .usePlugin(TablePlugin.create(textView.getContext()))
                .usePlugin(StrikethroughPlugin.create())
                .usePlugin(TaskListPlugin.create(textView.getContext()))
                .build();

        textView.setMovementMethod(LinkMovementMethod.getInstance());

        return markwon;
    }

    public void setCodeHighlightTheme() {
        if (markwon != null) {
            markwon = null;
        }
    }
}
