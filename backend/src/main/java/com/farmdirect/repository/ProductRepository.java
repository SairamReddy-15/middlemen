package com.farmdirect.repository;

import com.farmdirect.model.Product;
import com.farmdirect.model.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrueOrderByCreatedAtDesc();

    List<Product> findByFarmer_UserIdOrderByCreatedAtDesc(Long farmerId);

    List<Product> findByFarmer_UserId(Long farmerId);

    Optional<Product> findByProductIdAndFarmer_UserId(Long productId, Long farmerId);

    List<Product> findAllByOrderByCreatedAtDesc();

    long countByActiveTrue();

    long countByCategory(ProductCategory category);

    long countByFarmer_UserId(Long farmerId);
}
