package com.farmdirect.dto;

import com.farmdirect.model.Product;
import com.farmdirect.model.ProductCategory;

import java.time.LocalDateTime;

public class ProductResponse {

    private Long productId;
    private Long farmerId;
    private String farmerName;
    private String farmName;
    private String farmerPhone;
    private String name;
    private String category;
    private String categoryLabel;
    private String description;
    private Double price;
    private String unit;
    private Integer stockQuantity;
    private String imageUrl;
    private String location;
    private boolean active;
    private boolean inStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductResponse from(Product p) {
        ProductResponse dto = new ProductResponse();
        dto.productId = p.getProductId();
        if (p.getFarmer() != null) {
            dto.farmerId = p.getFarmer().getUserId();
            dto.farmerName = p.getFarmer().getName();
            dto.farmName = p.getFarmer().getFarmName();
            dto.farmerPhone = p.getFarmer().getPhone();
        }
        dto.name = p.getName();
        dto.category = p.getCategory() == null ? ProductCategory.OTHER.name() : p.getCategory().name();
        dto.categoryLabel = p.getCategory() == null ? ProductCategory.OTHER.getLabel() : p.getCategory().getLabel();
        dto.description = p.getDescription();
        dto.price = p.getPrice();
        dto.unit = p.getUnit();
        dto.stockQuantity = p.getStockQuantity();
        dto.imageUrl = p.getImageUrl();
        dto.location = p.getLocation();
        dto.active = p.isActive();
        dto.inStock = p.isInStock();
        dto.createdAt = p.getCreatedAt();
        dto.updatedAt = p.getUpdatedAt();
        return dto;
    }

    public Long getProductId() {
        return productId;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public String getFarmerName() {
        return farmerName;
    }

    public String getFarmName() {
        return farmName;
    }

    public String getFarmerPhone() {
        return farmerPhone;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public String getCategoryLabel() {
        return categoryLabel;
    }

    public String getDescription() {
        return description;
    }

    public Double getPrice() {
        return price;
    }

    public String getUnit() {
        return unit;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getLocation() {
        return location;
    }

    public boolean isActive() {
        return active;
    }

    public boolean isInStock() {
        return inStock;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
