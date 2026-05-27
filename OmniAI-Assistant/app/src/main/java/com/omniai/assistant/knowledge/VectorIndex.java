package com.omniai.assistant.knowledge;

import java.util.ArrayList;
import java.util.List;

public class VectorIndex {

    private List<float[]> vectors;
    private List<String> contents;
    private List<String> sources;
    private int dimension;

    public VectorIndex() {
        this(768);
    }

    public VectorIndex(int dimension) {
        this.dimension = dimension;
        this.vectors = new ArrayList<>();
        this.contents = new ArrayList<>();
        this.sources = new ArrayList<>();
    }

    public void addVector(float[] vector, String content, String source) {
        if (vector == null || vector.length != dimension) {
            throw new IllegalArgumentException("Vector dimension mismatch. Expected: " + dimension + ", Got: " + (vector != null ? vector.length : 0));
        }
        vectors.add(vector.clone());
        contents.add(content);
        sources.add(source);
    }

    public void removeVector(int index) {
        if (index < 0 || index >= vectors.size()) {
            throw new IndexOutOfBoundsException("Index out of range: " + index);
        }
        vectors.remove(index);
        contents.remove(index);
        sources.remove(index);
    }

    public List<SearchResult> search(float[] query, int topK) {
        if (query == null || query.length != dimension) {
            throw new IllegalArgumentException("Query vector dimension mismatch");
        }
        List<SearchResult> results = new ArrayList<>();
        if (vectors.isEmpty()) {
            return results;
        }
        float queryNorm = norm(query);
        if (queryNorm == 0) {
            return results;
        }
        for (int i = 0; i < vectors.size(); i++) {
            float similarity = cosineSimilarity(query, vectors.get(i), queryNorm);
            results.add(new SearchResult(contents.get(i), sources.get(i), similarity));
        }
        results.sort((a, b) -> Float.compare(b.score, a.score));
        if (topK > 0 && results.size() > topK) {
            return new ArrayList<>(results.subList(0, topK));
        }
        return results;
    }

    private float cosineSimilarity(float[] a, float[] b, float normA) {
        float normB = norm(b);
        if (normB == 0) {
            return 0f;
        }
        float dot = 0f;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
        }
        return dot / (normA * normB);
    }

    private float norm(float[] v) {
        float sum = 0f;
        for (float f : v) {
            sum += f * f;
        }
        return (float) Math.sqrt(sum);
    }

    public int size() {
        return vectors.size();
    }

    public void clear() {
        vectors.clear();
        contents.clear();
        sources.clear();
    }

    public void saveIndex(String path) {
        try {
            java.io.File file = new java.io.File(path);
            java.io.File parent = file.getParentFile();
            if (parent != null && !parent.exists()) {
                parent.mkdirs();
            }
            java.io.DataOutputStream dos = new java.io.DataOutputStream(
                    new java.io.BufferedOutputStream(new java.io.FileOutputStream(file)));
            dos.writeInt(dimension);
            dos.writeInt(vectors.size());
            for (int i = 0; i < vectors.size(); i++) {
                float[] vec = vectors.get(i);
                dos.writeInt(vec.length);
                for (float v : vec) {
                    dos.writeFloat(v);
                }
                dos.writeUTF(contents.get(i));
                dos.writeUTF(sources.get(i));
            }
            dos.flush();
            dos.close();
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to save index", e);
        }
    }

    public void loadIndex(String path) {
        try {
            java.io.DataInputStream dis = new java.io.DataInputStream(
                    new java.io.BufferedInputStream(new java.io.FileInputStream(path)));
            int dim = dis.readInt();
            int count = dis.readInt();
            List<float[]> loadedVectors = new ArrayList<>();
            List<String> loadedContents = new ArrayList<>();
            List<String> loadedSources = new ArrayList<>();
            for (int i = 0; i < count; i++) {
                int vecLen = dis.readInt();
                float[] vec = new float[vecLen];
                for (int j = 0; j < vecLen; j++) {
                    vec[j] = dis.readFloat();
                }
                loadedVectors.add(vec);
                loadedContents.add(dis.readUTF());
                loadedSources.add(dis.readUTF());
            }
            dis.close();
            this.dimension = dim;
            this.vectors = loadedVectors;
            this.contents = loadedContents;
            this.sources = loadedSources;
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to load index", e);
        }
    }

    public int getDimension() {
        return dimension;
    }

    public static class SearchResult {

        public String content;
        public String source;
        public float score;

        public SearchResult(String content, String source, float score) {
            this.content = content;
            this.source = source;
            this.score = score;
        }
    }
}
