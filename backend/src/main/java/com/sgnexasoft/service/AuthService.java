package com.sgnexasoft.service;

import com.sgnexasoft.exception.BadRequestException;
import com.sgnexasoft.model.User;
import com.sgnexasoft.repository.UserRepository;
import com.sgnexasoft.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    public Map<String, Object> register(String name, String email, String password, String role) {
        if (name == null || name.isBlank()) throw new BadRequestException("Name is required");
        if (email == null || email.isBlank()) throw new BadRequestException("Email is required");
        if (password == null || password.length() < 6) throw new BadRequestException("Password must be at least 6 characters");
        if (role == null || role.isBlank()) throw new BadRequestException("Role is required");

        if (userRepository.existsByEmail(email.trim().toLowerCase()))
            throw new BadRequestException("Email already registered");

        User.Role userRole;
        try {
            userRole = User.Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role. Must be CLIENT or STUDENT");
        }
        if (userRole == User.Role.ADMIN)
            throw new BadRequestException("Cannot register as ADMIN");

        User user = User.builder()
                .name(name.trim())
                .email(email.trim().toLowerCase())
                .password(passwordEncoder.encode(password))
                .role(userRole)
                .walletBalance(0.0)
                .rating(0.0)
                .totalRatings(0)
                .active(true)
                .build();
        user = userRepository.save(user);
        return buildResponse(user, jwtUtil.generateToken(user.getEmail()));
    }

    public Map<String, Object> login(String email, String password) {
        if (email == null || email.isBlank()) throw new BadRequestException("Email is required");
        if (password == null || password.isBlank()) throw new BadRequestException("Password is required");
        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(email.trim().toLowerCase(), password));
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Invalid email or password");
        }
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("User not found"));
        return buildResponse(user, jwtUtil.generateToken(user.getEmail()));
    }

    private Map<String, Object> buildResponse(User user, String token) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("token", token);
        Map<String, Object> u = new HashMap<>();
        u.put("id", user.getId());
        u.put("name", user.getName());
        u.put("email", user.getEmail());
        u.put("role", user.getRole());
        u.put("walletBalance", user.getWalletBalance());
        u.put("rating", user.getRating());
        resp.put("user", u);
        return resp;
    }
}
