package com.omniai.assistant.vip;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.omniai.assistant.common.Result;
import com.omniai.assistant.model.VipPlan;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.List;
import java.util.concurrent.TimeUnit;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class VipApiService {

    private final OkHttpClient client;
    private final String apiBaseUrl;
    private final Gson gson;
    private static final MediaType JSON_MEDIA = MediaType.get("application/json; charset=utf-8");

    public VipApiService() {
        this("https://api.omniai.com/v1/vip/");
    }

    public VipApiService(String apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
        this.gson = new Gson();
        this.client = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
    }

    public Result<VipPlan> subscribe(String planId, String paymentToken) {
        try {
            String json = gson.toJson(new SubscribeRequest(planId, paymentToken));
            RequestBody body = RequestBody.create(json, JSON_MEDIA);
            Request request = new Request.Builder()
                    .url(apiBaseUrl + "subscribe")
                    .post(body)
                    .build();
            try (Response response = client.newCall(request).execute()) {
                if (response.isSuccessful() && response.body() != null) {
                    VipPlan plan = gson.fromJson(response.body().string(), VipPlan.class);
                    return Result.success(plan);
                }
                return Result.error("Subscribe failed: " + response.code());
            }
        } catch (IOException e) {
            return Result.error("Network error: " + e.getMessage());
        }
    }

    public Result<Boolean> cancelSubscription(String userId) {
        try {
            RequestBody body = RequestBody.create("", JSON_MEDIA);
            Request request = new Request.Builder()
                    .url(apiBaseUrl + "cancel?userId=" + userId)
                    .post(body)
                    .build();
            try (Response response = client.newCall(request).execute()) {
                return Result.success(response.isSuccessful());
            }
        } catch (IOException e) {
            return Result.error("Network error: " + e.getMessage());
        }
    }

    public Result<VipPlan> restorePurchase(String orderId) {
        try {
            String json = gson.toJson(new RestoreRequest(orderId));
            RequestBody body = RequestBody.create(json, JSON_MEDIA);
            Request request = new Request.Builder()
                    .url(apiBaseUrl + "restore")
                    .post(body)
                    .build();
            try (Response response = client.newCall(request).execute()) {
                if (response.isSuccessful() && response.body() != null) {
                    VipPlan plan = gson.fromJson(response.body().string(), VipPlan.class);
                    return Result.success(plan);
                }
                return Result.error("Restore failed: " + response.code());
            }
        } catch (IOException e) {
            return Result.error("Network error: " + e.getMessage());
        }
    }

    public Result<VipManager.VipStatus> checkStatus(String userId) {
        try {
            Request request = new Request.Builder()
                    .url(apiBaseUrl + "status?userId=" + userId)
                    .get()
                    .build();
            try (Response response = client.newCall(request).execute()) {
                if (response.isSuccessful() && response.body() != null) {
                    String statusStr = response.body().string().trim();
                    VipManager.VipStatus status = VipManager.VipStatus.valueOf(statusStr);
                    return Result.success(status);
                }
                return Result.error("Status check failed: " + response.code());
            }
        } catch (IOException e) {
            return Result.error("Network error: " + e.getMessage());
        }
    }

    public Result<List<VipPlan>> getPlans() {
        try {
            Request request = new Request.Builder()
                    .url(apiBaseUrl + "plans")
                    .get()
                    .build();
            try (Response response = client.newCall(request).execute()) {
                if (response.isSuccessful() && response.body() != null) {
                    Type listType = new TypeToken<List<VipPlan>>(){}.getType();
                    List<VipPlan> plans = gson.fromJson(response.body().string(), listType);
                    return Result.success(plans);
                }
                return Result.error("Get plans failed: " + response.code());
            }
        } catch (IOException e) {
            return Result.error("Network error: " + e.getMessage());
        }
    }

    public Result<Boolean> validateReceipt(String receiptData) {
        try {
            String json = gson.toJson(new ReceiptRequest(receiptData));
            RequestBody body = RequestBody.create(json, JSON_MEDIA);
            Request request = new Request.Builder()
                    .url(apiBaseUrl + "validate")
                    .post(body)
                    .build();
            try (Response response = client.newCall(request).execute()) {
                return Result.success(response.isSuccessful());
            }
        } catch (IOException e) {
            return Result.error("Network error: " + e.getMessage());
        }
    }

    private static class SubscribeRequest {
        final String planId;
        final String paymentToken;
        SubscribeRequest(String planId, String paymentToken) {
            this.planId = planId;
            this.paymentToken = paymentToken;
        }
    }

    private static class RestoreRequest {
        final String orderId;
        RestoreRequest(String orderId) {
            this.orderId = orderId;
        }
    }

    private static class ReceiptRequest {
        final String receiptData;
        ReceiptRequest(String receiptData) {
            this.receiptData = receiptData;
        }
    }
}
