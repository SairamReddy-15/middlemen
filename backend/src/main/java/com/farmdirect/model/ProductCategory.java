package com.farmdirect.model;

/**
 * Categories a farmer can list a product under in the marketplace.
 */
public enum ProductCategory {
    VEGETABLES("Vegetables"),
    FRUITS("Fruits"),
    GRAINS("Grains & Cereals"),
    PULSES("Pulses & Legumes"),
    DAIRY("Dairy & Milk"),
    SPICES("Spices & Herbs"),
    OTHER("Other");

    private final String label;

    ProductCategory(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static ProductCategory parse(String value) {
        if (value == null || value.isBlank()) {
            return OTHER;
        }
        try {
            return ProductCategory.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Unknown category: " + value
                    + " (use VEGETABLES, FRUITS, GRAINS, PULSES, DAIRY, SPICES or OTHER)");
        }
    }
}
