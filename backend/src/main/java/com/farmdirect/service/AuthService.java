package com.farmdirect.service;

import com.farmdirect.dto.AuthResponse;
import com.farmdirect.dto.LoginRequest;
import com.farmdirect.dto.RegisterRequest;
import com.farmdirect.dto.UserResponse;
import com.farmdirect.exception.ApiException;
import com.farmdirect.model.Role;
import com.farmdirect.model.User;
import com.farmdirect.repository.UserRepository;
import com.farmdirect.security.JwtService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(409, "An account with this email already exists");
        }
        Role role = parseRole(req.getRole());
        User user = new User(req.getName().trim(), email,
                passwordEncoder.encode(req.getPassword()), role);
        user.setPhone(req.getPhone());
        user.setAddress(req.getAddress());
        user.setLocation(req.getLocation());
        user.setFarmName(role == Role.FARMER
                ? (isBlank(req.getFarmName()) ? req.getName().trim() + " Farm" : req.getFarmName().trim())
                : req.getFarmName());
        userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(user), role.name(), UserResponse.from(user));
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(401, "Invalid email or password"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new ApiException(401, "Invalid email or password");
        }
        if (!user.isActive()) {
            throw new ApiException(403, "This account has been deactivated. Contact the administrator.");
        }
        return new AuthResponse(jwtService.generateToken(user),
                user.getRole() == null ? Role.CUSTOMER.name() : user.getRole().name(),
                UserResponse.from(user));
    }

    /** The authenticated user from the current JWT / SecurityContext. */
    public User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ApiException(401, "Not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(401, "Not authenticated"));
    }

    public Long currentUserId() {
        return currentUser().getUserId();
    }

    private Role parseRole(String value) {
        if (value == null || value.isBlank()) {
            return Role.CUSTOMER;
        }
        Role role;
        try {
            role = Role.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(400, "Role must be FARMER or CUSTOMER");
        }
        if (role == Role.ADMIN) {
            throw new ApiException(400, "Administrator accounts cannot be self-registered");
        }
        return role;
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
