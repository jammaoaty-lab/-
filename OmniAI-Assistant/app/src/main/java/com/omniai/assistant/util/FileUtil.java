package com.omniai.assistant.util;

import android.content.Context;

import com.omniai.assistant.common.Constants;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.DecimalFormat;

public final class FileUtil {

    private static final String[] MODEL_EXTENSIONS = {".gguf", ".bin", ".ggml", ".safetensors"};

    private FileUtil() {
        throw new UnsupportedOperationException("FileUtil cannot be instantiated");
    }

    public static boolean copyFile(File src, File dst) {
        if (src == null || dst == null || !src.exists()) {
            return false;
        }
        try (InputStream in = new FileInputStream(src); OutputStream out = new FileOutputStream(dst)) {
            byte[] buffer = new byte[8192];
            int len;
            while ((len = in.read(buffer)) != -1) {
                out.write(buffer, 0, len);
            }
            out.flush();
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    public static boolean deleteFile(File file) {
        if (file == null || !file.exists()) {
            return true;
        }
        if (file.isDirectory()) {
            File[] children = file.listFiles();
            if (children != null) {
                for (File child : children) {
                    deleteFile(child);
                }
            }
        }
        return file.delete();
    }

    public static long getFileSize(File file) {
        if (file == null || !file.exists()) {
            return 0;
        }
        if (file.isDirectory()) {
            long size = 0;
            File[] children = file.listFiles();
            if (children != null) {
                for (File child : children) {
                    size += getFileSize(child);
                }
            }
            return size;
        }
        return file.length();
    }

    public static String formatFileSize(long size) {
        if (size <= 0) {
            return "0 B";
        }
        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int digitGroups = (int) (Math.log10(size) / Math.log10(1024));
        digitGroups = Math.min(digitGroups, units.length - 1);
        DecimalFormat df = new DecimalFormat("#,##0.#");
        return df.format(size / Math.pow(1024, digitGroups)) + " " + units[digitGroups];
    }

    public static boolean isModelFile(File file) {
        if (file == null || !file.exists() || file.isDirectory()) {
            return false;
        }
        String name = file.getName().toLowerCase();
        for (String ext : MODEL_EXTENSIONS) {
            if (name.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }

    public static File getModelsDir(Context context) {
        return new File(context.getFilesDir(), Constants.MODEL_DIR);
    }

    public static File getLoraDir(Context context) {
        return new File(context.getFilesDir(), Constants.LORA_DIR);
    }

    public static File getKnowledgeDir(Context context) {
        return new File(context.getFilesDir(), Constants.KNOWLEDGE_DIR);
    }

    public static void ensureDirs(Context context) {
        File modelsDir = getModelsDir(context);
        File loraDir = getLoraDir(context);
        File knowledgeDir = getKnowledgeDir(context);
        File cacheDir = new File(context.getFilesDir(), Constants.CACHE_DIR);

        modelsDir.mkdirs();
        loraDir.mkdirs();
        knowledgeDir.mkdirs();
        cacheDir.mkdirs();
    }
}
