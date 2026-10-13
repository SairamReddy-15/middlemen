package com.farmdirect.model;

/**
 * Lifecycle of an order, from placement through farmer fulfilment to delivery.
 * Described in the marketplace workflow: pending, accepted, processing, packed,
 * dispatched, delivered/completed (with rejected and cancelled as closed out).
 */
public enum OrderStatus {
    PENDING("Pending", 1),
    ACCEPTED("Accepted", 2),
    PROCESSING("Processing", 3),
    PACKED("Packed", 4),
    DISPATCHED("Dispatched", 5),
    DELIVERED("Delivered", 6),
    COMPLETED("Completed", 7),
    REJECTED("Rejected", 0),
    CANCELLED("Cancelled", 0);

    private final String label;
    private final int stage;

    OrderStatus(String label, int stage) {
        this.label = label;
        this.stage = stage;
    }

    public String getLabel() {
        return label;
    }

    /** Ordered fulfilment stage (0 = closed out). */
    public int getStage() {
        return stage;
    }

    public boolean isTerminal() {
        return this == REJECTED || this == CANCELLED || this == COMPLETED;
    }

    public static OrderStatus parse(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Order status is required");
        }
        try {
            return OrderStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Unknown order status: " + value);
        }
    }
}
