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
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional
    public Map<String, Object> send(String email, Long receiverId, String content, Long projectId) {
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(content)
                .isRead(false)
                .build();
        return toMap(messageRepository.save(message));
    }

    public List<Map<String, Object>> getConversation(String email, Long otherUserId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User other = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Message> messages = messageRepository.findConversation(user, other);
        // Mark as read
        messages.forEach(m -> {
            if (m.getReceiver().getId().equals(user.getId()) && !m.getIsRead()) {
                m.setIsRead(true);
                messageRepository.save(m);
            }
        });
        return messages.stream().map(this::toMap).toList();
    }

    public List<Map<String, Object>> getConversationPartners(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<User> partners = messageRepository.findConversationPartners(user);
        return partners.stream().map(p -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", p.getId());
            map.put("name", p.getName());
            map.put("role", p.getRole());
            map.put("unreadCount", messageRepository.countUnreadMessages(user));
            return map;
        }).toList();
    }

    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return messageRepository.countUnreadMessages(user);
    }

    public Map<String, Object> toMap(Message m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getId());
        map.put("content", m.getContent());
        map.put("isRead", m.getIsRead());
        map.put("createdAt", m.getCreatedAt());
        map.put("senderId", m.getSender().getId());
        map.put("senderName", m.getSender().getName());
        map.put("receiverId", m.getReceiver().getId());
        map.put("receiverName", m.getReceiver().getName());
        return map;
    }
}
