package com.farmdirect.dto;

import com.farmdirect.model.OrderItem;

public class OrderItemResponse {

    private Long productId;
    private String productName;
    private String unit;
    private Double unitPrice;
    private Integer quantity;
    private Double subtotal;

    public static OrderItemResponse from(OrderItem item) {
        OrderItemResponse dto = new OrderItemResponse();
        dto.productId = item.getProduct() == null ? null : item.getProduct().getProductId();
        dto.productName = item.getProductName();
        dto.unit = item.getUnit();
        dto.unitPrice = item.getUnitPrice();
        dto.quantity = item.getQuantity();
        dto.subtotal = item.getSubtotal();
        return dto;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getUnit() {
        return unit;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Double getSubtotal() {
        return subtotal;
    }
}
