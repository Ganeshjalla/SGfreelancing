package com.sgnexasoft.repository;

import com.sgnexasoft.model.Submission;
import com.sgnexasoft.model.Project;
import com.sgnexasoft.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByProjectOrderByCreatedAtDesc(Project project);
    List<Submission> findByStudentOrderByCreatedAtDesc(User student);
    Optional<Submission> findByProjectAndStudent(Project project, User student);
}
