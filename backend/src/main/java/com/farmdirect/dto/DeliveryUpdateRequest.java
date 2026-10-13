package com.farmdirect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DeliveryUpdateRequest {

    @NotBlank(message = "Delivery status is required")
    private String deliveryStatus;

    @Size(max = 120, message = "Delivery agent can be at most 120 characters")
    private String deliveryAgent;

    public String getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(String deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public String getDeliveryAgent() {
        return deliveryAgent;
    }

    public void setDeliveryAgent(String deliveryAgent) {
        this.deliveryAgent = deliveryAgent;
    }
}
