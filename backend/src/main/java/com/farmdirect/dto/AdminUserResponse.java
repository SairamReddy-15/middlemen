package com.farmdirect.dto;

import com.farmdirect.model.User;

import java.time.LocalDateTime;

public class AdminUserResponse {

    private Long userId;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String location;
    private String farmName;
    private boolean active;
    private long productCount;
    private long orderCount;
    private LocalDateTime createdAt;

    public static AdminUserResponse from(User u, long productCount, long orderCount) {
        AdminUserResponse dto = new AdminUserResponse();
        dto.userId = u.getUserId();
        dto.name = u.getName();
        dto.email = u.getEmail();
        dto.role = u.getRole() == null ? null : u.getRole().name();
        dto.phone = u.getPhone();
        dto.location = u.getLocation();
        dto.farmName = u.getFarmName();
        dto.active = u.isActive();
        dto.productCount = productCount;
        dto.orderCount = orderCount;
        dto.createdAt = u.getCreatedAt();
        return dto;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getPhone() {
        return phone;
    }

    public String getLocation() {
        return location;
    }

    public String getFarmName() {
        return farmName;
    }

    public boolean isActive() {
        return active;
    }

    public long getProductCount() {
        return productCount;
    }

    public long getOrderCount() {
        return orderCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
