package com.farmdirect.model;

public enum DeliveryStatus {
    PENDING("Pending"),
    ASSIGNED("Assigned"),
    IN_TRANSIT("In transit"),
    DELIVERED("Delivered");

    private final String label;

    DeliveryStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static DeliveryStatus parse(String value) {
        if (value == null || value.isBlank()) {
            return PENDING;
        }
        try {
            return DeliveryStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Unknown delivery status: " + value
                    + " (use PENDING, ASSIGNED, IN_TRANSIT or DELIVERED)");
        }
    }
}
