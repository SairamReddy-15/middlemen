package com.farmdirect.service;

import com.farmdirect.dto.DeliveryUpdateRequest;
import com.farmdirect.dto.OrderItemRequest;
import com.farmdirect.dto.OrderRequest;
import com.farmdirect.dto.OrderResponse;
import com.farmdirect.dto.PaymentUpdateRequest;
import com.farmdirect.exception.ApiException;
import com.farmdirect.model.DeliveryStatus;
import com.farmdirect.model.Order;
import com.farmdirect.model.OrderItem;
import com.farmdirect.model.OrderStatus;
import com.farmdirect.model.PaymentMethod;
import com.farmdirect.model.PaymentStatus;
import com.farmdirect.model.Product;
import com.farmdirect.model.User;
import com.farmdirect.repository.OrderRepository;
import com.farmdirect.repository.ProductRepository;
import com.farmdirect.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // ---- Customer scope ----

    /**
     * Places an order for the given cart. Items are grouped by farmer so that
     * each farmer receives a separate order to fulfil. Stock is validated and
     * reduced atomically.
     */
    @Transactional
    public List<OrderResponse> checkout(Long customerId, OrderRequest req) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ApiException(404, "User not found"));
        PaymentMethod method = PaymentMethod.parse(req.getPaymentMethod());

        Map<Long, Integer> quantities = new LinkedHashMap<>();
        for (OrderItemRequest item : req.getItems()) {
            if (item.getProductId() == null || item.getQuantity() == null || item.getQuantity() < 1) {
                throw new ApiException(400, "Each cart line needs a product and a quantity of at least 1");
            }
            quantities.merge(item.getProductId(), item.getQuantity(), Integer::sum);
        }
        if (quantities.isEmpty()) {
            throw new ApiException(400, "Your cart is empty");
        }

        Map<Long, Order> ordersByFarmer = new LinkedHashMap<>();
        for (Map.Entry<Long, Integer> entry : quantities.entrySet()) {
            Product product = productRepository.findById(entry.getKey())
                    .orElseThrow(() -> new ApiException(404, "Product not found"));
            if (!product.isActive()) {
                throw new ApiException(400, product.getName() + " is no longer available");
            }
            int qty = entry.getValue();
            if (product.getStockQuantity() == null || product.getStockQuantity() < qty) {
                throw new ApiException(400, "Only " + (product.getStockQuantity() == null ? 0 : product.getStockQuantity())
                        + " " + product.getUnit() + " of " + product.getName() + " left in stock");
            }
            if (product.getFarmer() == null) {
                throw new ApiException(400, product.getName() + " is not linked to a farmer");
            }

            User farmer = product.getFarmer();
            Order order = ordersByFarmer.get(farmer.getUserId());
            if (order == null) {
                order = new Order(customer, farmer, req.getDeliveryAddress(), method);
                order.setContactPhone(req.getContactPhone());
                order.setNotes(req.getNotes());
                if (method == PaymentMethod.ONLINE) {
                    order.setPaymentStatus(PaymentStatus.PAID);
                    order.setPaymentReference("TXN" + System.currentTimeMillis());
                }
                ordersByFarmer.put(farmer.getUserId(), order);
            }
            order.addItem(new OrderItem(product, qty));
            product.setStockQuantity(product.getStockQuantity() - qty);
            productRepository.save(product);
        }

        List<OrderResponse> result = new ArrayList<>();
        for (Order order : ordersByFarmer.values()) {
            orderRepository.save(order);
            result.add(OrderResponse.from(order));
        }
        return result;
    }

    public List<OrderResponse> listMine(Long customerId) {
        return orderRepository.findByCustomer_UserIdOrderByCreatedAtDesc(customerId).stream()
                .map(OrderResponse::from)
                .toList();
    }

    public OrderResponse getMine(Long customerId, Long orderId) {
        Order order = orderRepository.findByOrderIdAndCustomer_UserId(orderId, customerId)
                .orElseThrow(() -> new ApiException(404, "Order not found"));
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse cancel(Long customerId, Long orderId) {
        Order order = orderRepository.findByOrderIdAndCustomer_UserId(orderId, customerId)
                .orElseThrow(() -> new ApiException(404, "Order not found"));
        if (order.getStatus() == OrderStatus.DISPATCHED || order.getStatus() == OrderStatus.DELIVERED
                || order.getStatus() == OrderStatus.COMPLETED) {
            throw new ApiException(400, "This order can no longer be cancelled");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            return OrderResponse.from(order);
        }
        applyStatus(order, OrderStatus.CANCELLED);
        orderRepository.save(order);
        return OrderResponse.from(order);
    }

    // ---- Farmer scope ----

    public List<OrderResponse> listForFarmer(Long farmerId) {
        return orderRepository.findByFarmer_UserIdOrderByCreatedAtDesc(farmerId).stream()
                .map(OrderResponse::from)
                .toList();
    }

    public OrderResponse getForFarmer(Long farmerId, Long orderId) {
        Order order = orderRepository.findByOrderIdAndFarmer_UserId(orderId, farmerId)
                .orElseThrow(() -> new ApiException(404, "Order not found"));
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse farmerUpdateStatus(Long farmerId, Long orderId, String status) {
        Order order = orderRepository.findByOrderIdAndFarmer_UserId(orderId, farmerId)
                .orElseThrow(() -> new ApiException(404, "Order not found"));
        applyStatus(order, parseStatus(status));
        orderRepository.save(order);
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse farmerUpdateDelivery(Long farmerId, Long orderId, DeliveryUpdateRequest req) {
        Order order = orderRepository.findByOrderIdAndFarmer_UserId(orderId, farmerId)
                .orElseThrow(() -> new ApiException(404, "Order not found"));
        applyDelivery(order, req);
        orderRepository.save(order);
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse farmerUpdatePayment(Long farmerId, Long orderId, PaymentUpdateRequest req) {
        Order order = orderRepository.findByOrderIdAndFarmer_UserId(orderId, farmerId)
                .orElseThrow(() -> new ApiException(404, "Order not found"));
        applyPayment(order, req);
        orderRepository.save(order);
        return OrderResponse.from(order);
    }

    // ---- Admin scope ----

    public List<OrderResponse> adminAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional
    public OrderResponse adminUpdateStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(404, "Order not found"));
        applyStatus(order, parseStatus(status));
        orderRepository.save(order);
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse adminUpdateDelivery(Long orderId, DeliveryUpdateRequest req) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(404, "Order not found"));
        applyDelivery(order, req);
        orderRepository.save(order);
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse adminUpdatePayment(Long orderId, PaymentUpdateRequest req) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(404, "Order not found"));
        applyPayment(order, req);
        orderRepository.save(order);
        return OrderResponse.from(order);
    }

    // ---- helpers ----

    private void applyStatus(Order order, OrderStatus status) {
        OrderStatus previous = order.getStatus();
        order.setStatus(status);
        if (status == OrderStatus.DELIVERED || status == OrderStatus.COMPLETED) {
            order.setDeliveryStatus(DeliveryStatus.DELIVERED);
            if (order.getDeliveredAt() == null) {
                order.setDeliveredAt(LocalDateTime.now());
            }
        }
        boolean closing = status == OrderStatus.CANCELLED || status == OrderStatus.REJECTED;
        boolean wasClosing = previous == OrderStatus.CANCELLED || previous == OrderStatus.REJECTED;
        if (closing && !wasClosing) {
            restoreStock(order);
            if (order.getPaymentStatus() == PaymentStatus.PAID) {
                order.setPaymentStatus(PaymentStatus.REFUNDED);
            }
        }
    }

    private void applyDelivery(Order order, DeliveryUpdateRequest req) {
        DeliveryStatus deliveryStatus;
        try {
            deliveryStatus = DeliveryStatus.parse(req.getDeliveryStatus());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(400, ex.getMessage());
        }
        order.setDeliveryStatus(deliveryStatus);
        if (req.getDeliveryAgent() != null) {
            order.setDeliveryAgent(req.getDeliveryAgent());
        }
        if (deliveryStatus == DeliveryStatus.DELIVERED) {
            if (order.getStatus() != OrderStatus.COMPLETED) {
                order.setStatus(OrderStatus.DELIVERED);
            }
            if (order.getDeliveredAt() == null) {
                order.setDeliveredAt(LocalDateTime.now());
            }
        }
    }

    private void applyPayment(Order order, PaymentUpdateRequest req) {
        PaymentStatus paymentStatus;
        try {
            paymentStatus = PaymentStatus.parse(req.getPaymentStatus());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(400, ex.getMessage());
        }
        order.setPaymentStatus(paymentStatus);
        if (req.getPaymentReference() != null) {
            order.setPaymentReference(req.getPaymentReference());
        }
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                int current = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
                product.setStockQuantity(current + item.getQuantity());
                productRepository.save(product);
            }
        }
    }

    private OrderStatus parseStatus(String status) {
        try {
            return OrderStatus.parse(status);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(400, ex.getMessage());
        }
    }
}
