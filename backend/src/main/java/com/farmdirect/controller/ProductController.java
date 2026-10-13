package com.farmdirect.controller;

import com.farmdirect.dto.ProductRequest;
import com.farmdirect.dto.ProductResponse;
import com.farmdirect.service.AuthService;
import com.farmdirect.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final AuthService authService;

    public ProductController(ProductService productService, AuthService authService) {
        this.productService = productService;
        this.authService = authService;
    }

    /** Public marketplace listing with optional filters. */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> browse(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean inStock) {
        return ResponseEntity.ok(productService.browse(category, keyword, location, maxPrice, minPrice, inStock));
    }

    /** A farmer's own listings, including inactive ones. */
    @GetMapping("/mine")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<List<ProductResponse>> mine() {
        return ResponseEntity.ok(productService.listMine(authService.currentUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(productService.get(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.create(authService.currentUserId(), request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.update(authService.currentUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        productService.delete(authService.currentUserId(), id);
        return ResponseEntity.ok(Map.of("message", "Product deleted"));
    }
}
