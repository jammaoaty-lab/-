package com.omniai.assistant.modelmgmt;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class ModelVerifier {

    private static final long GGUF_MAGIC = 0x46475547L;
    private static final int MIN_MODEL_SIZE = 1024;

    public static class ModelInfo {
        private String name;
        private String quantType;
        private long fileSize;
        private int contextLength;
        private int layerCount;
        private String hash;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getQuantType() { return quantType; }
        public void setQuantType(String quantType) { this.quantType = quantType; }
        public long getFileSize() { return fileSize; }
        public void setFileSize(long fileSize) { this.fileSize = fileSize; }
        public int getContextLength() { return contextLength; }
        public void setContextLength(int contextLength) { this.contextLength = contextLength; }
        public int getLayerCount() { return layerCount; }
        public void setLayerCount(int layerCount) { this.layerCount = layerCount; }
        public String getHash() { return hash; }
        public void setHash(String hash) { this.hash = hash; }
    }

    public boolean verifyGguf(String filePath) {
        File file = new File(filePath);
        if (!file.exists() || file.length() < MIN_MODEL_SIZE) return false;
        try (FileInputStream fis = new FileInputStream(file)) {
            byte[] magicBytes = new byte[4];
            int read = fis.read(magicBytes);
            if (read != 4) return false;
            int magic = ByteBuffer.wrap(magicBytes).order(ByteOrder.LITTLE_ENDIAN).getInt();
            return magic == GGUF_MAGIC;
        } catch (IOException e) {
            return false;
        }
    }

    public String calculateHash(String filePath) {
        File file = new File(filePath);
        if (!file.exists()) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (FileInputStream fis = new FileInputStream(file)) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = fis.read(buffer)) != -1) {
                    digest.update(buffer, 0, bytesRead);
                }
            }
            byte[] hashBytes = digest.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException | IOException e) {
            return "";
        }
    }

    public boolean verifyHash(String filePath, String expectedHash) {
        String actualHash = calculateHash(filePath);
        return actualHash.equalsIgnoreCase(expectedHash);
    }

    public ModelInfo getModelInfo(String filePath) {
        File file = new File(filePath);
        ModelInfo info = new ModelInfo();
        info.setFileSize(file.length());
        info.setHash(calculateHash(filePath));
        info.setName(file.getName());
        if (verifyGguf(filePath)) {
            try (FileInputStream fis = new FileInputStream(file)) {
                byte[] header = new byte[48];
                int read = fis.read(header);
                if (read >= 24) {
                    ByteBuffer buf = ByteBuffer.wrap(header).order(ByteOrder.LITTLE_ENDIAN);
                    buf.getInt();
                    buf.getInt();
                    buf.getInt();
                    int metadataKVCount = buf.getInt();
                    info.setContextLength(4096);
                    info.setLayerCount(32);
                }
            } catch (IOException e) {
                info.setContextLength(4096);
                info.setLayerCount(32);
            }
            info.setQuantType(detectQuantType(filePath));
        }
        return info;
    }

    public boolean isModelCompatible(String filePath) {
        if (!verifyGguf(filePath)) return false;
        File file = new File(filePath);
        return file.length() >= MIN_MODEL_SIZE;
    }

    private String detectQuantType(String filePath) {
        String name = new File(filePath).getName().toLowerCase();
        if (name.contains("q4_0")) return "Q4_0";
        if (name.contains("q4_1")) return "Q4_1";
        if (name.contains("q5_0")) return "Q5_0";
        if (name.contains("q5_1")) return "Q5_1";
        if (name.contains("q8_0")) return "Q8_0";
        if (name.contains("q4_k")) return "Q4_K";
        if (name.contains("q5_k")) return "Q5_K";
        if (name.contains("q6_k")) return "Q6_K";
        if (name.contains("f16")) return "F16";
        if (name.contains("f32")) return "F32";
        return "Q4_0";
    }
}
