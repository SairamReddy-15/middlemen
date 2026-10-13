package com.farmdirect.controller;

import com.farmdirect.dto.DeliveryUpdateRequest;
import com.farmdirect.dto.OrderRequest;
import com.farmdirect.dto.OrderResponse;
import com.farmdirect.dto.PaymentUpdateRequest;
import com.farmdirect.dto.StatusUpdateRequest;
import com.farmdirect.service.AuthService;
import com.farmdirect.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    public OrderController(OrderService orderService, AuthService authService) {
        this.orderService = orderService;
        this.authService = authService;
    }

    /** Place an order from the cart. Returns one order per farmer. */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponse>> checkout(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.checkout(authService.currentUserId(), request));
    }

    /** Orders placed by the current customer. */
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponse>> mine() {
        return ResponseEntity.ok(orderService.listMine(authService.currentUserId()));
    }

    /** Orders received by the current farmer. */
    @GetMapping("/farmer")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<List<OrderResponse>> farmerOrders() {
        return ResponseEntity.ok(orderService.listForFarmer(authService.currentUserId()));
    }

    @GetMapping("/farmer/{id}")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<OrderResponse> farmerOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getForFarmer(authService.currentUserId(), id));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getMine(authService.currentUserId(), id));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancel(authService.currentUserId(), id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id,
                                                      @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.farmerUpdateStatus(authService.currentUserId(), id, request.getStatus()));
    }

    @PatchMapping("/{id}/delivery")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<OrderResponse> updateDelivery(@PathVariable Long id,
                                                        @Valid @RequestBody DeliveryUpdateRequest request) {
        return ResponseEntity.ok(orderService.farmerUpdateDelivery(authService.currentUserId(), id, request));
    }

    @PatchMapping("/{id}/payment")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<OrderResponse> updatePayment(@PathVariable Long id,
                                                      @Valid @RequestBody PaymentUpdateRequest request) {
        return ResponseEntity.ok(orderService.farmerUpdatePayment(authService.currentUserId(), id, request));
    }
}
