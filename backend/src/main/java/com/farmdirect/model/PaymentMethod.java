package com.farmdirect.model;

public enum PaymentMethod {
    CASH_ON_DELIVERY("Cash on delivery"),
    ONLINE("Online payment");

    private final String label;

    PaymentMethod(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static PaymentMethod parse(String value) {
        if (value == null || value.isBlank()) {
            return CASH_ON_DELIVERY;
        }
        try {
            return PaymentMethod.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Unknown payment method: " + value
                    + " (use CASH_ON_DELIVERY or ONLINE)");
        }
    }
}
