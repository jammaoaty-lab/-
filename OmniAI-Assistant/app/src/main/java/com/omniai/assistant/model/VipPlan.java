package com.omniai.assistant.model;

public class VipPlan {

    private String id;
    private String name;
    private String price;
    private String period;
    private String[] features;
    private boolean isPopular;

    public VipPlan() {
        this.features = new String[0];
        this.isPopular = false;
    }

    public VipPlan(String id, String name, String price, String period, String[] features, boolean isPopular) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.period = period;
        this.features = features;
        this.isPopular = isPopular;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public String[] getFeatures() {
        return features;
    }

    public void setFeatures(String[] features) {
        this.features = features;
    }

    public boolean isPopular() {
        return isPopular;
    }

    public void setPopular(boolean popular) {
        isPopular = popular;
    }
}
