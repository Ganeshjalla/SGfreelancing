package com.sgnexasoft.service;

import com.sgnexasoft.exception.ResourceNotFoundException;
import com.sgnexasoft.model.User;
import com.sgnexasoft.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void getProfile_shouldReturnUserMap() {
        String email = "jane@example.com";
        User user = User.builder()
                .id(10L)
                .name("Jane")
                .email(email)
                .role(User.Role.CLIENT)
                .walletBalance(20.0)
                .rating(3.5)
                .totalRatings(2)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        Map<String, Object> result = userService.getProfile(email);

        assertThat(result).containsEntry("email", email);
        assertThat(result).containsEntry("name", "Jane");
        assertThat(result).containsEntry("walletBalance", 20.0);
    }

    @Test
    void getProfile_shouldThrowWhenUserMissing() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getProfile("missing@example.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found");
    }

    @Test
    void updateProfile_shouldSaveUpdatedFields() {
        String email = "jane@example.com";
        User user = User.builder()
                .id(10L)
                .name("Jane")
                .email(email)
                .role(User.Role.STUDENT)
                .walletBalance(5.0)
                .active(true)
                .build();
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> request = Map.of(
                "name", "Jane Doe",
                "bio", "Full stack student",
                "skills", "Java, Spring"
        );

        Map<String, Object> result = userService.updateProfile(email, request);

        assertThat(result).containsEntry("name", "Jane Doe");
        assertThat(result).containsEntry("bio", "Full stack student");
        assertThat(result).containsEntry("skills", "Java, Spring");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void addFunds_shouldIncreaseWalletBalance() {
        String email = "jane@example.com";
        User user = User.builder()
                .id(10L)
                .name("Jane")
                .email(email)
                .walletBalance(15.0)
                .role(User.Role.CLIENT)
                .active(true)
                .build();
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> result = userService.addFunds(email, 35.0);

        assertThat(result).containsEntry("walletBalance", 50.0);
    }

    @Test
    void getAdminStats_shouldReturnCountsByRole() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByRole(User.Role.CLIENT)).thenReturn(6L);
        when(userRepository.countByRole(User.Role.STUDENT)).thenReturn(3L);

        Map<String, Object> stats = userService.getAdminStats();

        assertThat(stats).containsEntry("totalUsers", 10L);
        assertThat(stats).containsEntry("totalClients", 6L);
        assertThat(stats).containsEntry("totalStudents", 3L);
    }
}
