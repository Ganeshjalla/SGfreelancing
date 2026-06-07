package com.sgnexasoft.controller;

import com.sgnexasoft.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<?> getOpenProjects(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(projectService.getOpenProjects(category, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Map<String, Object> req, Authentication auth) {
        return ResponseEntity.ok(projectService.createProject(auth.getName(), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody Map<String, Object> req, Authentication auth) {
        return ResponseEntity.ok(projectService.updateProject(id, auth.getName(), req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, Authentication auth) {
        projectService.deleteProject(id, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyProjects(Authentication auth) {
        return ResponseEntity.ok(projectService.getMyProjects(auth.getName()));
    }
    // Alias for clients to fetch their posted projects explicitly
    @GetMapping("/posted")
    public ResponseEntity<?> getPostedProjects(Authentication auth) {
        // Students and clients can view all open projects
        return ResponseEntity.ok(projectService.getOpenProjects(null, null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> req, Authentication auth) {
        return ResponseEntity.ok(projectService.updateProjectStatus(id, req.get("status"), auth.getName()));
    }
}
