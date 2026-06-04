package com.sgnexasoft.config;

import com.sgnexasoft.model.User;
import com.sgnexasoft.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createUserIfNotExists("Admin User", "admin@sg.com", "admin123", User.Role.ADMIN);
        createUserIfNotExists("Rahul Sharma", "client@sg.com", "client123", User.Role.CLIENT);
        createUserIfNotExists("Priya Singh", "student@sg.com", "student123", User.Role.STUDENT);
        System.out.println("=== SGNexasoft DataLoader complete ===");
        System.out.println("✅ admin@sg.com / admin123");
        System.out.println("✅ client@sg.com / client123");
        System.out.println("✅ student@sg.com / student123");
    }

    private void createUserIfNotExists(String name, String email, String password, User.Role role) {
        if (!userRepository.existsByEmail(email)) {
            userRepository.save(User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role(role)
                    .walletBalance(role == User.Role.CLIENT ? 5000.0 : 0.0)
                    .rating(0.0)
                    .totalRatings(0)
                    .active(true)
                    .build());
            System.out.println("✅ Created " + email + " (password: " + password + ")");
        }
    }
}
