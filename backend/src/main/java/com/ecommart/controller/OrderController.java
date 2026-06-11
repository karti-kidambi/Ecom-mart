package com.ecommart.controller;

import com.ecommart.model.Order;
import com.ecommart.model.OrderItem;
import com.ecommart.model.Product;
import com.ecommart.model.User;
import com.ecommart.repository.OrderRepository;
import com.ecommart.repository.ProductRepository;
import com.ecommart.repository.UserRepository;
import lombok.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderController(OrderRepository orderRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null || "anonymousUser".equals(principal)) {
            return null;
        }
        String email = (String) principal;
        return userRepository.findByEmail(email).orElse(null);
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest request) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cart is empty");
        }

        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .totalAmount(request.getTotalAmount())
                .shippingAddress(request.getShippingAddress())
                .phone(request.getPhone())
                .paymentStatus("PAID") // Mark paid since they go through the dummy razorpay checkout
                .orderStatus("PLACED")
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItemRequest itemReq : request.getItems()) {
            Optional<Product> productOpt = productRepository.findById(itemReq.getProductId());
            if (productOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Product with id " + itemReq.getProductId() + " not found");
            }
            Product product = productOpt.get();
            if (product.getStock() < itemReq.getQuantity()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Product " + product.getName() + " is out of stock or insufficient quantity");
            }

            // Deduct stock
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .price(product.getPrice())
                    .build();
            orderItems.add(orderItem);
        }

        order.setOrderItems(orderItems);
        Order savedOrder = orderRepository.save(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        List<Order> orders = orderRepository.findByUserOrderByOrderDateDesc(user);
        return ResponseEntity.ok(orders);
    }

    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can perform this action");
        }
        List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can perform this action");
        }
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
        }

        Order order = orderOpt.get();
        order.setOrderStatus(request.getOrderStatus());
        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderRequest {
        private List<CartItemRequest> items;
        private Double totalAmount;
        private String shippingAddress;
        private String phone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemRequest {
        private Long productId;
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        private String orderStatus;
    }
}
