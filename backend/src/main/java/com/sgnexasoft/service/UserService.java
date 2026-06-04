package com.sgnexasoft.service;

import com.sgnexasoft.exception.*;
import com.sgnexasoft.model.User;
import com.sgnexasoft.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public Map<String, Object> getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toMap(user);
    }

    public Map<String, Object> getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toMap(user);
    }

    @Transactional
    public Map<String, Object> updateProfile(String email, Map<String, Object> req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (req.containsKey("name")) user.setName((String) req.get("name"));
        if (req.containsKey("bio")) user.setBio((String) req.get("bio"));
        if (req.containsKey("skills")) user.setSkills((String) req.get("skills"));
        return toMap(userRepository.save(user));
    }

    @Transactional
    public Map<String, Object> addFunds(String email, Double amount) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setWalletBalance(user.getWalletBalance() + amount);
        return toMap(userRepository.save(user));
    }

    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream().map(this::toMap).toList();
    }

    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalClients", userRepository.countByRole(User.Role.CLIENT));
        stats.put("totalStudents", userRepository.countByRole(User.Role.STUDENT));
        return stats;
    }

    public Map<String, Object> toMap(User u) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", u.getId());
        map.put("name", u.getName());
        map.put("email", u.getEmail());
        map.put("role", u.getRole());
        map.put("bio", u.getBio());
        map.put("skills", u.getSkills());
        map.put("walletBalance", u.getWalletBalance());
        map.put("rating", u.getRating());
        map.put("totalRatings", u.getTotalRatings());
        map.put("active", u.getActive());
        map.put("createdAt", u.getCreatedAt());
        return map;
    }
}
