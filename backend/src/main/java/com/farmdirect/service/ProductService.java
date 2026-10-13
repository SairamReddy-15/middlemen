package com.farmdirect.service;

import com.farmdirect.dto.ProductRequest;
import com.farmdirect.dto.ProductResponse;
import com.farmdirect.exception.ApiException;
import com.farmdirect.model.Product;
import com.farmdirect.model.ProductCategory;
import com.farmdirect.model.User;
import com.farmdirect.repository.ProductRepository;
import com.farmdirect.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // ---- Browse (public) ----

    public List<ProductResponse> browse(String category, String keyword, String location,
                                        Double maxPrice, Double minPrice, Boolean inStock) {
        ProductCategory categoryFilter = parseCategoryOrNull(category);
        return productRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .filter(p -> categoryFilter == null || p.getCategory() == categoryFilter)
                .filter(p -> !Boolean.TRUE.equals(inStock) || p.isInStock())
                .filter(p -> minPrice == null || (p.getPrice() != null && p.getPrice() >= minPrice))
                .filter(p -> maxPrice == null || (p.getPrice() != null && p.getPrice() <= maxPrice))
                .filter(p -> location == null || location.isBlank()
                        || contains(p.getLocation(), location))
                .filter(p -> keyword == null || keyword.isBlank() || matches(p, keyword.toLowerCase(Locale.ROOT)))
                .map(ProductResponse::from)
                .toList();
    }

    public ProductResponse get(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Product not found"));
        if (!p.isActive()) {
            throw new ApiException(404, "Product not found");
        }
        return ProductResponse.from(p);
    }

    // ---- Farmer scope ----

    public List<ProductResponse> listMine(Long farmerId) {
        return productRepository.findByFarmer_UserIdOrderByCreatedAtDesc(farmerId).stream()
                .map(ProductResponse::from)
                .toList();
    }

    public ProductResponse create(Long farmerId, ProductRequest req) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new ApiException(404, "User not found"));
        Product p = new Product();
        p.setFarmer(farmer);
        apply(p, req);
        productRepository.save(p);
        return ProductResponse.from(p);
    }

    public ProductResponse update(Long farmerId, Long id, ProductRequest req) {
        Product p = ownedProduct(farmerId, id);
        apply(p, req);
        productRepository.save(p);
        return ProductResponse.from(p);
    }

    public void delete(Long farmerId, Long id) {
        Product p = ownedProduct(farmerId, id);
        productRepository.delete(p);
    }

    private Product ownedProduct(Long farmerId, Long id) {
        return productRepository.findByProductIdAndFarmer_UserId(id, farmerId)
                .orElseThrow(() -> new ApiException(404, "Product not found"));
    }

    // ---- Admin scope ----

    public List<ProductResponse> adminAll() {
        return productRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ProductResponse::from)
                .toList();
    }

    public void adminDelete(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Product not found"));
        productRepository.delete(p);
    }

    // ---- helpers ----

    private void apply(Product p, ProductRequest req) {
        p.setName(req.getName().trim());
        try {
            p.setCategory(ProductCategory.parse(req.getCategory()));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(400, ex.getMessage());
        }
        p.setDescription(req.getDescription());
        p.setPrice(req.getPrice());
        p.setUnit(req.getUnit() == null || req.getUnit().isBlank() ? "kg" : req.getUnit().trim());
        p.setStockQuantity(req.getStockQuantity());
        p.setImageUrl(req.getImageUrl());
        p.setLocation(req.getLocation());
        if (req.getActive() != null) {
            p.setActive(req.getActive());
        }
    }

    private ProductCategory parseCategoryOrNull(String category) {
        if (category == null || category.isBlank()) {
            return null;
        }
        try {
            return ProductCategory.parse(category);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(400, ex.getMessage());
        }
    }

    private boolean matches(Product p, String keyword) {
        String haystack = (nz(p.getName()) + " " + nz(p.getCategory() == null ? null : p.getCategory().name()) + " "
                + nz(p.getCategory() == null ? null : p.getCategory().getLabel()) + " "
                + nz(p.getDescription()) + " " + nz(p.getLocation()) + " "
                + (p.getFarmer() == null ? "" : nz(p.getFarmer().getName()) + " " + nz(p.getFarmer().getFarmName())))
                .toLowerCase(Locale.ROOT);
        return haystack.contains(keyword);
    }

    private boolean contains(String value, String needle) {
        return nz(value).toLowerCase(Locale.ROOT).contains(needle.toLowerCase(Locale.ROOT));
    }

    private String nz(String s) {
        return s == null ? "" : s;
    }
}
