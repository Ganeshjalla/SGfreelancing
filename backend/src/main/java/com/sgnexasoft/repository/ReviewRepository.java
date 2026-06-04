package com.sgnexasoft.repository;

import com.sgnexasoft.model.Review;
import com.sgnexasoft.model.User;
import com.sgnexasoft.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRevieweeOrderByCreatedAtDesc(User reviewee);
    boolean existsByProjectAndReviewer(Project project, User reviewer);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee = :user")
    Double getAverageRating(@Param("user") User user);
}
