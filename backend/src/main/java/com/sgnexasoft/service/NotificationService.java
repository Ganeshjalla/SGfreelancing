package com.sgnexasoft.service;

import com.sgnexasoft.model.*;
import com.sgnexasoft.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public void create(User user, String title, String message, String type, String link) {
        notificationRepository.save(Notification.builder()
                .user(user).title(title).message(message).type(type).link(link).isRead(false).build());
    }

    public List<Map<String, Object>> getMyNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream().map(this::toMap).toList();
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsRead(user, false);
    }

    public void markAllRead(User user) {
        var unread = notificationRepository.findByUserAndIsRead(user, false);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    public void markRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    public Map<String, Object> toMap(Notification n) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", n.getId());
        map.put("title", n.getTitle());
        map.put("message", n.getMessage());
        map.put("type", n.getType());
        map.put("link", n.getLink());
        map.put("isRead", n.getIsRead());
        map.put("createdAt", n.getCreatedAt());
        return map;
    }
}
