package com.ecommart.controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments/razorpay")
public class PaymentController {

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody PaymentOrderRequest request) {
        String razorpayOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        double amountInPaise = request.getAmount() * 100;

        return ResponseEntity.ok(new PaymentOrderResponse(
                razorpayOrderId,
                amountInPaise,
                "INR",
                "receipt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8)
        ));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        return ResponseEntity.ok(new MessageResponse("Payment verified successfully (Mock Razorpay Gateway)"));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentOrderRequest {
        private Double amount;
    }

    @Data
    @AllArgsConstructor
    public static class PaymentOrderResponse {
        private String id;
        private Double amount;
        private String currency;
        private String receipt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentVerificationRequest {
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
    }

    @Data
    @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }
}
