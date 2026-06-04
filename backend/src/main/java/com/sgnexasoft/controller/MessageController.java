package com.sgnexasoft.controller;

import com.sgnexasoft.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody Map<String, Object> req, Authentication auth) {
        Long receiverId = Long.parseLong(req.get("receiverId").toString());
        String content = (String) req.get("content");
        Long projectId = req.get("projectId") != null ? Long.parseLong(req.get("projectId").toString()) : null;
        return ResponseEntity.ok(messageService.send(auth.getName(), receiverId, content, projectId));
    }

    @GetMapping("/conversation/{userId}")
    public ResponseEntity<?> getConversation(@PathVariable Long userId, Authentication auth) {
        return ResponseEntity.ok(messageService.getConversation(auth.getName(), userId));
    }

    @GetMapping("/partners")
    public ResponseEntity<?> getPartners(Authentication auth) {
        return ResponseEntity.ok(messageService.getConversationPartners(auth.getName()));
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadCount(Authentication auth) {
        return ResponseEntity.ok(Map.of("count", messageService.getUnreadCount(auth.getName())));
    }
}
