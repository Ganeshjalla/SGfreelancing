package com.sgnexasoft.controller;

import com.sgnexasoft.repository.*;
import com.sgnexasoft.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final ProjectRepository projectRepository;
    private final PaymentRepository paymentRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.putAll(userService.getAdminStats());
        stats.put("totalProjects", projectRepository.count());
        stats.put("openProjects", projectRepository.countByStatus(com.sgnexasoft.model.Project.Status.OPEN));
        stats.put("completedProjects", projectRepository.countByStatus(com.sgnexasoft.model.Project.Status.COMPLETED));
        Double total = paymentRepository.getTotalReleasedAmount(com.sgnexasoft.model.Payment.Status.RELEASED);
        stats.put("totalPaymentsReleased", total != null ? total : 0.0);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/projects")
    public ResponseEntity<?> getAllProjects() {
        return ResponseEntity.ok(projectRepository.findAll().stream().map(p -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", p.getId());
            map.put("title", p.getTitle());
            map.put("status", p.getStatus());
            map.put("budget", p.getBudget());
            map.put("createdAt", p.getCreatedAt());
            if (p.getClient() != null) map.put("clientName", p.getClient().getName());
            return map;
        }).toList());
    }
}
