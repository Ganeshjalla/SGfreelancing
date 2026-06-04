package com.sgnexasoft.service;

import com.sgnexasoft.exception.*;
import com.sgnexasoft.model.*;
import com.sgnexasoft.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public Map<String, Object> submit(String email, Long projectId, Map<String, Object> req) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!student.getId().equals(project.getAssignedStudent() != null ? project.getAssignedStudent().getId() : null))
            throw new BadRequestException("You are not assigned to this project");

        Submission submission = Submission.builder()
                .project(project).student(student)
                .description((String) req.get("description"))
                .githubUrl((String) req.get("githubUrl"))
                .liveUrl((String) req.get("liveUrl"))
                .status(Submission.Status.PENDING)
                .build();
        submission = submissionRepository.save(submission);

        notificationService.create(project.getClient(), "New Submission",
                student.getName() + " submitted work for: " + project.getTitle(),
                "submission", "/projects/" + project.getId());

        return toMap(submission);
    }

    public List<Map<String, Object>> getProjectSubmissions(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        return submissionRepository.findByProjectOrderByCreatedAtDesc(project).stream().map(this::toMap).toList();
    }

    @Transactional
    public Map<String, Object> reviewSubmission(Long id, String status, String feedback, String email) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        User client = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!submission.getProject().getClient().getId().equals(client.getId()))
            throw new BadRequestException("Not authorized");

        submission.setStatus(Submission.Status.valueOf(status));
        submission.setFeedback(feedback);
        submissionRepository.save(submission);

        String msg = status.equals("APPROVED") ? "Your submission was approved! 🎉" : "Client requested revisions on your submission";
        notificationService.create(submission.getStudent(), "Submission " + status,
                msg + " - Project: " + submission.getProject().getTitle(), "submission", "/projects/" + submission.getProject().getId());

        return toMap(submission);
    }

    public Map<String, Object> toMap(Submission s) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", s.getId());
        map.put("description", s.getDescription());
        map.put("githubUrl", s.getGithubUrl());
        map.put("liveUrl", s.getLiveUrl());
        map.put("fileUrl", s.getFileUrl());
        map.put("status", s.getStatus());
        map.put("feedback", s.getFeedback());
        map.put("createdAt", s.getCreatedAt());
        map.put("projectId", s.getProject().getId());
        map.put("projectTitle", s.getProject().getTitle());
        map.put("studentId", s.getStudent().getId());
        map.put("studentName", s.getStudent().getName());
        return map;
    }
}
