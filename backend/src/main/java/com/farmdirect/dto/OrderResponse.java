package com.farmdirect.dto;

import com.farmdirect.model.DeliveryStatus;
import com.farmdirect.model.Order;
import com.farmdirect.model.PaymentMethod;
import com.farmdirect.model.PaymentStatus;

import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Long orderId;

    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private Long farmerId;
    private String farmerName;
    private String farmName;

    private String status;
    private String statusLabel;
    private int stage;
    private boolean terminal;

    private String paymentMethod;
    private String paymentMethodLabel;
    private String paymentStatus;
    private String paymentStatusLabel;
    private String paymentReference;

    private Double totalAmount;
    private int itemCount;

    private String deliveryAddress;
    private String contactPhone;
    private String notes;

    private String deliveryStatus;
    private String deliveryStatusLabel;
    private String deliveryAgent;
    private LocalDateTime deliveredAt;

    private List<OrderItemResponse> items;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrderResponse from(Order o) {
        OrderResponse dto = new OrderResponse();
        dto.orderId = o.getOrderId();

        if (o.getCustomer() != null) {
            dto.customerId = o.getCustomer().getUserId();
            dto.customerName = o.getCustomer().getName();
            dto.customerEmail = o.getCustomer().getEmail();
            dto.customerPhone = o.getCustomer().getPhone();
        }
        if (o.getFarmer() != null) {
            dto.farmerId = o.getFarmer().getUserId();
            dto.farmerName = o.getFarmer().getName();
            dto.farmName = o.getFarmer().getFarmName();
        }

        dto.status = o.getStatus().name();
        dto.statusLabel = o.getStatus().getLabel();
        dto.stage = o.getStatus().getStage();
        dto.terminal = o.getStatus().isTerminal();

        PaymentMethod pm = o.getPaymentMethod();
        dto.paymentMethod = pm.name();
        dto.paymentMethodLabel = pm.getLabel();
        PaymentStatus ps = o.getPaymentStatus();
        dto.paymentStatus = ps.name();
        dto.paymentStatusLabel = ps.getLabel();
        dto.paymentReference = o.getPaymentReference();

        dto.totalAmount = o.getTotalAmount();
        dto.itemCount = o.getItems() == null ? 0 : o.getItems().size();

        dto.deliveryAddress = o.getDeliveryAddress();
        dto.contactPhone = o.getContactPhone();
        dto.notes = o.getNotes();

        DeliveryStatus ds = o.getDeliveryStatus();
        dto.deliveryStatus = ds.name();
        dto.deliveryStatusLabel = ds.getLabel();
        dto.deliveryAgent = o.getDeliveryAgent();
        dto.deliveredAt = o.getDeliveredAt();

        dto.items = o.getItems() == null ? List.of()
                : o.getItems().stream().map(OrderItemResponse::from).toList();

        dto.createdAt = o.getCreatedAt();
        dto.updatedAt = o.getUpdatedAt();
        return dto;
    }

    public Long getOrderId() {
        return orderId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
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

    public String getStatus() {
        return status;
    }

    public String getStatusLabel() {
        return statusLabel;
    }

    public int getStage() {
        return stage;
    }

    public boolean isTerminal() {
        return terminal;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getPaymentMethodLabel() {
        return paymentMethodLabel;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public String getPaymentStatusLabel() {
        return paymentStatusLabel;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public int getItemCount() {
        return itemCount;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public String getNotes() {
        return notes;
    }

    public String getDeliveryStatus() {
        return deliveryStatus;
    }

    public String getDeliveryStatusLabel() {
        return deliveryStatusLabel;
    }

    public String getDeliveryAgent() {
        return deliveryAgent;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
