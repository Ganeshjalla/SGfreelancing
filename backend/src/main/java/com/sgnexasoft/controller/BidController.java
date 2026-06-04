package com.sgnexasoft.controller;

import com.sgnexasoft.service.BidService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
public class BidController {
    private final BidService bidService;

    @PostMapping("/project/{projectId}")
    public ResponseEntity<?> placeBid(@PathVariable Long projectId, @RequestBody Map<String, Object> req, Authentication auth) {
        return ResponseEntity.ok(bidService.placeBid(auth.getName(), projectId, req));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getProjectBids(@PathVariable Long projectId) {
        return ResponseEntity.ok(bidService.getProjectBids(projectId));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyBids(Authentication auth) {
        return ResponseEntity.ok(bidService.getMyBids(auth.getName()));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptBid(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(bidService.acceptBid(id, auth.getName()));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectBid(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(bidService.rejectBid(id, auth.getName()));
    }
}
