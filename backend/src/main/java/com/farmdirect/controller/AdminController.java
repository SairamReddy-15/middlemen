package com.farmdirect.controller;

import com.farmdirect.dto.AdminStatsResponse;
import com.farmdirect.dto.AdminUserResponse;
import com.farmdirect.dto.DeliveryUpdateRequest;
import com.farmdirect.dto.OrderResponse;
import com.farmdirect.dto.PaymentUpdateRequest;
import com.farmdirect.dto.ProductResponse;
import com.farmdirect.dto.StatusUpdateRequest;
import com.farmdirect.service.AdminService;
import com.farmdirect.service.OrderService;
import com.farmdirect.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final ProductService productService;
    private final OrderService orderService;

    public AdminController(AdminService adminService, ProductService productService, OrderService orderService) {
        this.adminService = adminService;
        this.productService = productService;
        this.orderService = orderService;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> stats() {
        return ResponseEntity.ok(adminService.stats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> users() {
        return ResponseEntity.ok(adminService.users());
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<AdminUserResponse> setUserStatus(@PathVariable Long id,
                                                           @RequestParam boolean active) {
        return ResponseEntity.ok(adminService.setActive(id, active));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> products() {
        return ResponseEntity.ok(productService.adminAll());
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        productService.adminDelete(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted"));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> orders() {
        return ResponseEntity.ok(orderService.adminAll());
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id,
                                                           @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.adminUpdateStatus(id, request.getStatus()));
    }

    @PatchMapping("/orders/{id}/delivery")
    public ResponseEntity<OrderResponse> updateOrderDelivery(@PathVariable Long id,
                                                             @Valid @RequestBody DeliveryUpdateRequest request) {
        return ResponseEntity.ok(orderService.adminUpdateDelivery(id, request));
    }

    @PatchMapping("/orders/{id}/payment")
    public ResponseEntity<OrderResponse> updateOrderPayment(@PathVariable Long id,
                                                            @Valid @RequestBody PaymentUpdateRequest request) {
        return ResponseEntity.ok(orderService.adminUpdatePayment(id, request));
    }
}
