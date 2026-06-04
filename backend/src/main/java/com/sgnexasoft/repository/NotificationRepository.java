package com.sgnexasoft.repository;

import com.sgnexasoft.model.Notification;
import com.sgnexasoft.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    long countByUserAndIsRead(User user, Boolean isRead);
    List<Notification> findByUserAndIsRead(User user, Boolean isRead);
}
