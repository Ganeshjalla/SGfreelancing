package com.sgnexasoft.repository;

import com.sgnexasoft.model.Payment;
import com.sgnexasoft.model.Project;
import com.sgnexasoft.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByClientOrderByCreatedAtDesc(User client);
    List<Payment> findByStudentOrderByCreatedAtDesc(User student);
    Optional<Payment> findByProject(Project project);
    
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'RELEASED'")
    Double getTotalReleasedAmount();
}
