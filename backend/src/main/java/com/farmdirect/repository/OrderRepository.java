package com.farmdirect.repository;

import com.farmdirect.model.Order;
import com.farmdirect.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomer_UserIdOrderByCreatedAtDesc(Long customerId);

    List<Order> findByFarmer_UserIdOrderByCreatedAtDesc(Long farmerId);

    Optional<Order> findByOrderIdAndCustomer_UserId(Long orderId, Long customerId);

    Optional<Order> findByOrderIdAndFarmer_UserId(Long orderId, Long farmerId);

    List<Order> findAllByOrderByCreatedAtDesc();

    long countByStatus(OrderStatus status);

    long countByFarmer_UserId(Long farmerId);

    long countByCustomer_UserId(Long customerId);
}
