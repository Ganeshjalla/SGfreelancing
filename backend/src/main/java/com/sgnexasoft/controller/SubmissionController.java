package com.sgnexasoft.controller;

import com.sgnexasoft.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {
    private final SubmissionService submissionService;

    @PostMapping("/project/{projectId}")
    public ResponseEntity<?> submit(@PathVariable Long projectId, @RequestBody Map<String, Object> req, Authentication auth) {
        return ResponseEntity.ok(submissionService.submit(auth.getName(), projectId, req));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getSubmissions(@PathVariable Long projectId) {
        return ResponseEntity.ok(submissionService.getProjectSubmissions(projectId));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<?> reviewSubmission(@PathVariable Long id, @RequestBody Map<String, String> req, Authentication auth) {
        return ResponseEntity.ok(submissionService.reviewSubmission(id, req.get("status"), req.get("feedback"), auth.getName()));
    }
}
