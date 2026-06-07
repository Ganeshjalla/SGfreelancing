package com.sgnexasoft.service;

import com.sgnexasoft.exception.*;
import com.sgnexasoft.model.*;
import com.sgnexasoft.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final BidRepository bidRepository;
    private final NotificationService notificationService;

    public List<Map<String, Object>> getOpenProjects(String category, String search) {
        return projectRepository.findOpenProjects(
                Project.Status.OPEN,
                (category != null && category.isBlank()) ? null : category,
                (search != null && search.isBlank()) ? null : search
        ).stream().map(this::toMap).toList();
    }

    public Map<String, Object> getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        Map<String, Object> map = toMap(project);
        map.put("bidCount", bidRepository.countByProject(project));
        return map;
    }

    @Transactional
    public Map<String, Object> createProject(String email, Map<String, Object> req) {
        User client = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (client.getRole() != User.Role.CLIENT)
            throw new BadRequestException("Only clients can post projects");

        String title = (String) req.get("title");
        if (title == null || title.isBlank())
            throw new BadRequestException("Project title is required");
        if (projectRepository.existsByClientAndTitle(client, title.trim()))
            throw new BadRequestException("You already have a project with this title");

        Project project = Project.builder()
                .title(title.trim())
                .description((String) req.get("description"))
                .budget(Double.parseDouble(req.get("budget").toString()))
                .category((String) req.get("category"))
                .requiredSkills((String) req.get("requiredSkills"))
                .deadline(parseDeadline(req.get("deadline")))
                .client(client)
                .status(Project.Status.OPEN)
                .build();
        return toMap(projectRepository.save(project));
    }

    @Transactional
    public Map<String, Object> updateProject(Long id, String email, Map<String, Object> req) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!project.getClient().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN)
            throw new BadRequestException("Not authorized");
        if (project.getStatus() != Project.Status.OPEN)
            throw new BadRequestException("Can only edit OPEN projects");

        if (req.containsKey("title")) project.setTitle(req.get("title").toString().trim());
        if (req.containsKey("description")) project.setDescription(req.get("description").toString());
        if (req.containsKey("budget")) project.setBudget(Double.parseDouble(req.get("budget").toString()));
        if (req.containsKey("category")) project.setCategory(req.get("category").toString());
        if (req.containsKey("requiredSkills")) project.setRequiredSkills(req.get("requiredSkills").toString());
        if (req.containsKey("deadline")) project.setDeadline(parseDeadline(req.get("deadline")));
        return toMap(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long id, String email) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!project.getClient().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN)
            throw new BadRequestException("Not authorized");
        if (project.getStatus() == Project.Status.IN_PROGRESS)
            throw new BadRequestException("Cannot delete a project that is in progress");
        projectRepository.delete(project);
    }

    public List<Map<String, Object>> getMyProjects(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() == User.Role.CLIENT)
            return projectRepository.findByClientOrderByCreatedAtDesc(user).stream().map(this::toMap).toList();
        else
            return projectRepository.findByAssignedStudentOrderByCreatedAtDesc(user).stream().map(this::toMap).toList();
    }

    @Transactional
    public Map<String, Object> updateProjectStatus(Long id, String status, String email) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!project.getClient().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN)
            throw new BadRequestException("Not authorized");
        project.setStatus(Project.Status.valueOf(status));
        return toMap(projectRepository.save(project));
    }

    private LocalDateTime parseDeadline(Object raw) {
        if (raw == null) return null;
        String s = raw.toString().trim();
        if (s.isBlank()) return null;
        // Accept ISO without seconds: "2024-12-01T10:00" and with seconds: "2024-12-01T10:00:00"
        try {
            return LocalDateTime.parse(s);
        } catch (DateTimeParseException e) {
            try {
                return LocalDateTime.parse(s, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
            } catch (DateTimeParseException ex) {
                throw new BadRequestException("Invalid deadline format. Use ISO format: yyyy-MM-ddTHH:mm");
            }
        }
    }

    public Map<String, Object> toMap(Project p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("title", p.getTitle());
        map.put("description", p.getDescription());
        map.put("budget", p.getBudget());
        map.put("category", p.getCategory());
        map.put("requiredSkills", p.getRequiredSkills());
        map.put("deadline", p.getDeadline());
        map.put("status", p.getStatus());
        map.put("createdAt", p.getCreatedAt());
        if (p.getClient() != null) {
            map.put("clientId", p.getClient().getId());
            map.put("clientName", p.getClient().getName());
        }
        if (p.getAssignedStudent() != null) {
            map.put("assignedStudentId", p.getAssignedStudent().getId());
            map.put("assignedStudentName", p.getAssignedStudent().getName());
        }
        return map;
    }
}
