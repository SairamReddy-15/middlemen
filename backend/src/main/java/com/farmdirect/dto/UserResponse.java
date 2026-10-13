package com.farmdirect.dto;

import com.farmdirect.model.User;

import java.time.LocalDateTime;

public class UserResponse {

    private Long userId;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String address;
    private String location;
    private String farmName;
    private boolean active;
    private LocalDateTime createdAt;

    public static UserResponse from(User u) {
        UserResponse dto = new UserResponse();
        dto.userId = u.getUserId();
        dto.name = u.getName();
        dto.email = u.getEmail();
        dto.role = u.getRole() == null ? null : u.getRole().name();
        dto.phone = u.getPhone();
        dto.address = u.getAddress();
        dto.location = u.getLocation();
        dto.farmName = u.getFarmName();
        dto.active = u.isActive();
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

    public String getAddress() {
        return address;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
