package com.farmdirect.service;

import com.farmdirect.dto.AdminStatsResponse;
import com.farmdirect.dto.AdminUserResponse;
import com.farmdirect.exception.ApiException;
import com.farmdirect.model.Order;
import com.farmdirect.model.OrderStatus;
import com.farmdirect.model.ProductCategory;
import com.farmdirect.model.Role;
import com.farmdirect.model.User;
import com.farmdirect.repository.OrderRepository;
import com.farmdirect.repository.ProductRepository;
import com.farmdirect.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public AdminService(UserRepository userRepository,
                        ProductRepository productRepository,
                        OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    public AdminStatsResponse stats() {
        AdminStatsResponse stats = new AdminStatsResponse();
        stats.setTotalUsers(userRepository.count());
        stats.setTotalFarmers(userRepository.countByRole(Role.FARMER));
        stats.setTotalCustomers(userRepository.countByRole(Role.CUSTOMER));
        stats.setTotalProducts(productRepository.count());
        stats.setActiveProducts(productRepository.countByActiveTrue());
        stats.setTotalOrders(orderRepository.count());

        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status.name(), orderRepository.countByStatus(status));
        }
        stats.setOrdersByStatus(ordersByStatus);
        stats.setPendingOrders(ordersByStatus.getOrDefault(OrderStatus.PENDING.name(), 0L));
        stats.setDeliveredOrders(ordersByStatus.getOrDefault(OrderStatus.DELIVERED.name(), 0L));
        stats.setCompletedOrders(ordersByStatus.getOrDefault(OrderStatus.COMPLETED.name(), 0L));

        Map<String, Long> productsByCategory = new LinkedHashMap<>();
        for (ProductCategory category : ProductCategory.values()) {
            productsByCategory.put(category.name(), productRepository.countByCategory(category));
        }
        stats.setProductsByCategory(productsByCategory);

        double revenue = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.REJECTED)
                .mapToDouble(o -> o.getTotalAmount() == null ? 0.0 : o.getTotalAmount())
                .sum();
        stats.setTotalRevenue(revenue);
        return stats;
    }

    public List<AdminUserResponse> users() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(u -> {
                    long orderCount = orderRepository.countByFarmer_UserId(u.getUserId())
                            + orderRepository.countByCustomer_UserId(u.getUserId());
                    return AdminUserResponse.from(u, productRepository.countByFarmer_UserId(u.getUserId()), orderCount);
                })
                .toList();
    }

    public AdminUserResponse setActive(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(404, "User not found"));
        user.setActive(active);
        userRepository.save(user);
        long orderCount = orderRepository.countByFarmer_UserId(userId)
                + orderRepository.countByCustomer_UserId(userId);
        return AdminUserResponse.from(user, productRepository.countByFarmer_UserId(userId), orderCount);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(404, "User not found"));
        if (user.getRole() == Role.ADMIN) {
            throw new ApiException(400, "Administrator accounts cannot be deleted");
        }
        long productCount = productRepository.countByFarmer_UserId(userId);
        long orderCount = orderRepository.countByFarmer_UserId(userId)
                + orderRepository.countByCustomer_UserId(userId);
        if (productCount > 0 || orderCount > 0) {
            throw new ApiException(400, "This user has products or orders linked. Deactivate the account instead.");
        }
        userRepository.delete(user);
    }
}
