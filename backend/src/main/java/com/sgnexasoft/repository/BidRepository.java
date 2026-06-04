package com.sgnexasoft.repository;

import com.sgnexasoft.model.Bid;
import com.sgnexasoft.model.Project;
import com.sgnexasoft.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByProjectOrderByCreatedAtDesc(Project project);
    List<Bid> findByStudentOrderByCreatedAtDesc(User student);
    Optional<Bid> findByProjectAndStudent(Project project, User student);
    boolean existsByProjectAndStudent(Project project, User student);
    long countByProject(Project project);
}
