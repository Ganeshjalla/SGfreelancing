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
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public Map<String, Object> createReview(String email, Long projectId, Long revieweeId, int rating, String comment) {
        User reviewer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        User reviewee = userRepository.findById(revieweeId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewee not found"));

        if (reviewRepository.existsByProjectAndReviewer(project, reviewer))
            throw new BadRequestException("You have already reviewed for this project");

        Review review = reviewRepository.save(Review.builder()
                .project(project).reviewer(reviewer).reviewee(reviewee)
                .rating(rating).comment(comment).build());

        // Update average rating
        Double avg = reviewRepository.getAverageRating(reviewee);
        reviewee.setRating(avg != null ? avg : 0.0);
        reviewee.setTotalRatings(reviewee.getTotalRatings() + 1);
        userRepository.save(reviewee);

        return toMap(review);
    }

    public List<Map<String, Object>> getUserReviews(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return reviewRepository.findByRevieweeOrderByCreatedAtDesc(user).stream().map(this::toMap).toList();
    }

    public Map<String, Object> toMap(Review r) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", r.getId());
        map.put("rating", r.getRating());
        map.put("comment", r.getComment());
        map.put("createdAt", r.getCreatedAt());
        map.put("reviewerId", r.getReviewer().getId());
        map.put("reviewerName", r.getReviewer().getName());
        map.put("projectId", r.getProject().getId());
        map.put("projectTitle", r.getProject().getTitle());
        return map;
    }
}
