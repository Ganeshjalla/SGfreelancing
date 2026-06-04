package com.sgnexasoft.controller;

import com.sgnexasoft.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@RequestBody Map<String, Object> req, Authentication auth) {
        Long projectId = Long.parseLong(req.get("projectId").toString());
        Double amount = Double.parseDouble(req.get("amount").toString());
        return ResponseEntity.ok(paymentService.initiatePayment(auth.getName(), projectId, amount));
    }

    @PostMapping("/{id}/release")
    public ResponseEntity<?> releasePayment(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(paymentService.releasePayment(auth.getName(), id));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyTransactions(Authentication auth) {
        return ResponseEntity.ok(paymentService.getMyTransactions(auth.getName()));
    }
}
