package com.sgnexasoft.service;

import com.sgnexasoft.exception.BadRequestException;
import com.sgnexasoft.model.User;
import com.sgnexasoft.repository.UserRepository;
import com.sgnexasoft.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_shouldReturnResponseWhenEmailIsNew() {
        String name = "Alice";
        String email = "alice@example.com";
        String password = "password123";

        when(userRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(password)).thenReturn("encoded-password");
        User savedUser = User.builder()
                .id(1L)
                .name(name)
                .email(email)
                .password("encoded-password")
                .role(User.Role.CLIENT)
                .walletBalance(0.0)
                .rating(0.0)
                .totalRatings(0)
                .active(true)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken(email)).thenReturn("jwt-token");

        Map<String, Object> response = authService.register(name, email, password, "client");

        assertThat(response).containsEntry("token", "jwt-token");
        assertThat(response).containsKey("user");

        @SuppressWarnings("unchecked")
        Map<String, Object> userMap = (Map<String, Object>) response.get("user");
        assertThat(userMap).containsEntry("id", 1L);
        assertThat(userMap).containsEntry("name", name);
        assertThat(userMap).containsEntry("email", email);
        assertThat(userMap).containsEntry("role", User.Role.CLIENT);
        assertThat(userMap).containsEntry("walletBalance", 0.0);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_shouldThrowWhenEmailAlreadyRegistered() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register("Alice", "alice@example.com", "password", "student"))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Email already registered");
    }

    @Test
    void login_shouldReturnResponseWhenCredentialsAreValid() {
        String email = "bob@example.com";
        String password = "password123";
        User user = User.builder()
                .id(2L)
                .name("Bob")
                .email(email)
                .password("encoded")
                .role(User.Role.STUDENT)
                .walletBalance(10.0)
                .rating(4.2)
                .totalRatings(5)
                .active(true)
                .build();

        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByEmail(email)).thenReturn(java.util.Optional.of(user));
        when(jwtUtil.generateToken(email)).thenReturn("jwt-token-2");

        Map<String, Object> response = authService.login(email, password);

        assertThat(response).containsEntry("token", "jwt-token-2");
        @SuppressWarnings("unchecked")
        Map<String, Object> userMap = (Map<String, Object>) response.get("user");
        assertThat(userMap).containsEntry("email", email);
        assertThat(userMap).containsEntry("role", User.Role.STUDENT);
    }

    @Test
    void login_shouldThrowWhenAuthenticationFails() {
        String email = "bob@example.com";
        String password = "invalid";

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

        assertThatThrownBy(() -> authService.login(email, password))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    void login_shouldThrowWhenUserNotFound() {
        String email = "missing@example.com";

        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByEmail(email)).thenReturn(java.util.Optional.empty());

        assertThatThrownBy(() -> authService.login(email, "password"))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("User not found");
    }
}
