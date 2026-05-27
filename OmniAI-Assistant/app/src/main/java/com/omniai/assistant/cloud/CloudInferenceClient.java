package com.omniai.assistant.cloud;

import com.omniai.assistant.scheduler.InferenceParams;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.nio.charset.StandardCharsets;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

public class CloudInferenceClient {

    private static final MediaType JSON_MEDIA_TYPE = MediaType.get("application/json; charset=utf-8");

    private OkHttpClient client;
    private String apiBaseUrl;
    private String apiKey;
    private boolean isAvailable;

    public interface CloudCallback {
        void onSuccess(String result);
        void onError(String error);
    }

    public interface StreamCallback {
        void onToken(String token);
        void onComplete(String fullResult);
        void onError(String error);
    }

    public CloudInferenceClient() {
        this.client = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(120, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
        this.apiBaseUrl = "";
        this.apiKey = "";
        this.isAvailable = false;
    }

    public void complete(String prompt, InferenceParams params, CloudCallback callback) {
        try {
            JSONObject requestBody = buildRequestJson(prompt, params);
            RequestBody body = RequestBody.create(requestBody.toString(), JSON_MEDIA_TYPE);
            Request request = new Request.Builder()
                    .url(apiBaseUrl + "/v1/completions")
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .post(body)
                    .build();

            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    isAvailable = false;
                    if (callback != null) callback.onError(e.getMessage());
                }

                @Override
                public void onResponse(Call call, Response response) {
                    try {
                        if (!response.isSuccessful()) {
                            if (callback != null) callback.onError("HTTP " + response.code());
                            return;
                        }
                        String responseBody = response.body().string();
                        JSONObject json = new JSONObject(responseBody);
                        JSONArray choices = json.getJSONArray("choices");
                        String text = choices.getJSONObject(0).getString("text");
                        isAvailable = true;
                        if (callback != null) callback.onSuccess(text);
                    } catch (Exception e) {
                        if (callback != null) callback.onError(e.getMessage());
                    }
                }
            });
        } catch (Exception e) {
            if (callback != null) callback.onError(e.getMessage());
        }
    }

    public void streamComplete(String prompt, InferenceParams params, StreamCallback callback) {
        try {
            JSONObject requestBody = buildRequestJson(prompt, params);
            requestBody.put("stream", true);
            RequestBody body = RequestBody.create(requestBody.toString(), JSON_MEDIA_TYPE);
            Request request = new Request.Builder()
                    .url(apiBaseUrl + "/v1/completions")
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .post(body)
                    .build();

            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    isAvailable = false;
                    if (callback != null) callback.onError(e.getMessage());
                }

                @Override
                public void onResponse(Call call, Response response) {
                    try {
                        if (!response.isSuccessful()) {
                            if (callback != null) callback.onError("HTTP " + response.code());
                            return;
                        }
                        BufferedReader reader = new BufferedReader(
                                new InputStreamReader(response.body().byteStream(), StandardCharsets.UTF_8));
                        StringBuilder fullResult = new StringBuilder();
                        String line;
                        while ((line = reader.readLine()) != null) {
                            if (line.startsWith("data: ")) {
                                String data = line.substring(6).trim();
                                if (data.equals("[DONE]")) break;
                                JSONObject chunk = new JSONObject(data);
                                JSONArray choices = chunk.getJSONArray("choices");
                                String token = choices.getJSONObject(0).getString("text");
                                fullResult.append(token);
                                if (callback != null) callback.onToken(token);
                            }
                        }
                        reader.close();
                        isAvailable = true;
                        if (callback != null) callback.onComplete(fullResult.toString());
                    } catch (Exception e) {
                        if (callback != null) callback.onError(e.getMessage());
                    }
                }
            });
        } catch (Exception e) {
            if (callback != null) callback.onError(e.getMessage());
        }
    }

    public void checkAvailability() {
        if (apiBaseUrl.isEmpty() || apiKey.isEmpty()) {
            isAvailable = false;
            return;
        }
        try {
            Request request = new Request.Builder()
                    .url(apiBaseUrl + "/v1/models")
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .get()
                    .build();
            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    isAvailable = false;
                }

                @Override
                public void onResponse(Call call, Response response) {
                    isAvailable = response.isSuccessful();
                }
            });
        } catch (Exception e) {
            isAvailable = false;
        }
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public void setApiBaseUrl(String apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    private JSONObject buildRequestJson(String prompt, InferenceParams params) throws Exception {
        JSONObject json = new JSONObject();
        json.put("prompt", prompt);
        json.put("max_tokens", params.getNPredict());
        json.put("temperature", params.getTemperature());
        json.put("top_p", params.getTopP());
        json.put("n", 1);
        if (params.getSystemPrompt() != null && !params.getSystemPrompt().isEmpty()) {
            json.put("system", params.getSystemPrompt());
        }
        if (!params.getStopTokens().isEmpty()) {
            JSONArray stops = new JSONArray();
            for (String stop : params.getStopTokens()) {
                stops.put(stop);
            }
            json.put("stop", stops);
        }
        return json;
    }
}
