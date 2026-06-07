package com.sgnexasoft.repository;

import com.sgnexasoft.model.Project;
import com.sgnexasoft.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStatus(Project.Status status);
    List<Project> findByClientOrderByCreatedAtDesc(User client);
    List<Project> findByAssignedStudentOrderByCreatedAtDesc(User student);
    boolean existsByClientAndTitle(User client, String title);

    // Fetches client eagerly to avoid N+1 in admin list
    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.client ORDER BY p.createdAt DESC")
    List<Project> findAllWithClient();

    @Query("SELECT p FROM Project p WHERE p.status = :status AND " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%',:search,'%'))) " +
           "ORDER BY p.createdAt DESC")
    List<Project> findOpenProjects(@Param("status") Project.Status status, @Param("category") String category, @Param("search") String search);
    
    long countByStatus(Project.Status status);
}
