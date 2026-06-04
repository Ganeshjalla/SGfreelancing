package com.sgnexasoft.service;

import com.sgnexasoft.exception.BadRequestException;
import com.sgnexasoft.exception.ResourceNotFoundException;
import com.sgnexasoft.model.Project;
import com.sgnexasoft.model.User;
import com.sgnexasoft.repository.BidRepository;
import com.sgnexasoft.repository.ProjectRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {
    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BidRepository bidRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ProjectService projectService;

    @Test
    void getOpenProjects_shouldHandleBlankFilters() {
        User client = User.builder().id(1L).name("Client").email("client@example.com").role(User.Role.CLIENT).build();
        Project project = Project.builder()
                .id(100L)
                .title("Build website")
                .description("Create a responsive site")
                .budget(1500.0)
                .category("Web")
                .requiredSkills("HTML,CSS,JS")
                .deadline(LocalDateTime.now().plusDays(14))
                .status(Project.Status.OPEN)
                .client(client)
                .createdAt(LocalDateTime.now())
                .build();

        when(projectRepository.findOpenProjects(Project.Status.OPEN, null, null)).thenReturn(List.of(project));

        List<Map<String, Object>> results = projectService.getOpenProjects("", "");

        assertThat(results).hasSize(1);
        assertThat(results.get(0)).containsEntry("title", "Build website");
        assertThat(results.get(0)).containsEntry("category", "Web");
    }

    @Test
    void getProjectById_shouldIncludeBidCount() {
        User client = User.builder().id(1L).name("Client").email("client@example.com").role(User.Role.CLIENT).build();
        Project project = Project.builder()
                .id(100L)
                .title("Build app")
                .description("Mobile app development")
                .budget(1200.0)
                .status(Project.Status.OPEN)
                .client(client)
                .createdAt(LocalDateTime.now())
                .build();

        when(projectRepository.findById(100L)).thenReturn(Optional.of(project));
        when(bidRepository.countByProject(project)).thenReturn(5L);

        Map<String, Object> result = projectService.getProjectById(100L);

        assertThat(result).containsEntry("id", 100L);
        assertThat(result).containsEntry("bidCount", 5L);
        assertThat(result).containsEntry("clientId", 1L);
    }

    @Test
    void getProjectById_shouldThrowWhenMissing() {
        when(projectRepository.findById(200L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getProjectById(200L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Project not found");
    }

    @Test
    void createProject_shouldSaveProjectForClient() {
        String email = "client@example.com";
        User client = User.builder()
                .id(1L)
                .name("Client")
                .email(email)
                .role(User.Role.CLIENT)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(client));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project candidate = invocation.getArgument(0);
            candidate.setId(101L);
            return candidate;
        });

        Map<String, Object> request = Map.of(
                "title", "New Project",
                "description", "Create backend API",
                "budget", 2000.0,
                "category", "API",
                "requiredSkills", "Java, Spring",
                "deadline", LocalDateTime.now().plusDays(7).toString()
        );

        Map<String, Object> result = projectService.createProject(email, request);

        assertThat(result).containsEntry("id", 101L);
        assertThat(result).containsEntry("title", "New Project");
        assertThat(result).containsEntry("category", "API");
        assertThat(result).containsEntry("status", Project.Status.OPEN);
    }

    @Test
    void createProject_shouldThrowWhenUserNotClient() {
        String email = "student@example.com";
        User student = User.builder()
                .id(2L)
                .name("Student")
                .email(email)
                .role(User.Role.STUDENT)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(student));

        Map<String, Object> request = Map.of(
                "title", "Project",
                "description", "Desc",
                "budget", 100.0,
                "category", "Misc",
                "requiredSkills", "Testing"
        );

        assertThatThrownBy(() -> projectService.createProject(email, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Only clients can post projects");
    }

    @Test
    void updateProjectStatus_shouldThrowWhenUnauthorized() {
        User client = User.builder().id(1L).name("Client").email("client@example.com").role(User.Role.CLIENT).build();
        User other = User.builder().id(2L).name("Other").email("other@example.com").role(User.Role.STUDENT).build();
        Project project = Project.builder().id(100L).client(client).status(Project.Status.OPEN).build();

        when(projectRepository.findById(100L)).thenReturn(Optional.of(project));
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> projectService.updateProjectStatus(100L, "COMPLETED", "other@example.com"))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Not authorized");
    }
}
