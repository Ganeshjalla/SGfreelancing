package com.sgnexasoft.controller;

import com.sgnexasoft.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final ReviewService reviewService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> req, Authentication auth) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), req));
    }

    @PostMapping("/wallet/add")
    public ResponseEntity<?> addFunds(@RequestBody Map<String, Object> req, Authentication auth) {
        Double amount = Double.parseDouble(req.get("amount").toString());
        return ResponseEntity.ok(userService.addFunds(auth.getName(), amount));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<?> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getUserReviews(id));
    }

    @PostMapping("/reviews")
    public ResponseEntity<?> submitReview(@RequestBody Map<String, Object> req, Authentication auth) {
        Long projectId = Long.parseLong(req.get("projectId").toString());
        Long revieweeId = Long.parseLong(req.get("revieweeId").toString());
        int rating = Integer.parseInt(req.get("rating").toString());
        String comment = (String) req.get("comment");
        return ResponseEntity.ok(reviewService.createReview(auth.getName(), projectId, revieweeId, rating, comment));
    }
}
