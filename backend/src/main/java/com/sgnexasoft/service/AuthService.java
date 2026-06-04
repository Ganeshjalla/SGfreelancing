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
        if (userRepository.existsByEmail(email))
            throw new BadRequestException("Email already registered");
        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(User.Role.valueOf(role.toUpperCase()))
                .walletBalance(0.0)
                .rating(0.0)
                .totalRatings(0)
                .active(true)
                .build();
        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return buildResponse(user, token);
    }

    public Map<String, Object> login(String email, String password) {
        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Invalid email or password");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        String token = jwtUtil.generateToken(user.getEmail());
        return buildResponse(user, token);
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
