package com.sgnexasoft.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.net.http.*;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIChatController {

    private static final Logger log = LoggerFactory.getLogger(AIChatController.class);

    @Value("${anthropic.api.key:}")
    private String apiKey;

    private final ObjectMapper objectMapper;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> body) {
        String firstMessage = extractFirstMessage(body);
        if (apiKey == null || apiKey.isBlank()) {
            return ResponseEntity.ok(Map.of("reply", getFallbackReply(firstMessage)));
        }
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "claude-3-5-sonnet-20241022");
            requestBody.put("max_tokens", 1000);
            if (body.containsKey("system")) requestBody.put("system", body.get("system"));
            requestBody.put("messages", body.get("messages"));

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.anthropic.com/v1/messages"))
                    .header("Content-Type", "application/json")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            var data = objectMapper.readTree(response.body());
            if (data.has("content") && data.get("content").size() > 0) {
                return ResponseEntity.ok(Map.of("reply", data.get("content").get(0).get("text").asText()));
            }
            return ResponseEntity.ok(Map.of("reply", getFallbackReply(firstMessage)));
        } catch (Exception e) {
            log.error("AI chat error: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("reply", getFallbackReply(firstMessage)));
        }
    }

    private String extractFirstMessage(Map<String, Object> body) {
        try {
            var messages = (List<?>) body.get("messages");
            if (messages != null && !messages.isEmpty()) {
                var first = (Map<?, ?>) messages.get(messages.size() - 1);
                Object content = first.get("content");
                return content != null ? content.toString() : "";
            }
        } catch (Exception ignored) {}
        return "";
    }

    private String getFallbackReply(String input) {
        if (input == null) input = "";
        input = input.toLowerCase();
        if (input.contains("bid") || input.contains("proposal"))
            return "To place a bid: Go to Browse Projects, find a project, click it and submit your bid with your price and proposal.";
        if (input.contains("payment") || input.contains("wallet") || input.contains("money"))
            return "Payments work through our escrow system. Clients add funds to wallet, initiate payment, and release after approval.";
        if (input.contains("submit") || input.contains("submission"))
            return "To submit work: Go to My Projects, open the active project, and click Submit Work with your GitHub URL and description.";
        if (input.contains("message") || input.contains("contact"))
            return "Use the Messages section to communicate with clients or students.";
        if (input.contains("project") || input.contains("post"))
            return "Clients can post projects from the Dashboard. Fill in title, description, budget, category, and deadline.";
        if (input.contains("register") || input.contains("signup"))
            return "Register as CLIENT to post projects or STUDENT to bid on projects. Use the Register button on the login page.";
        return "Hi! I'm the SGNexasoft AI Assistant. I can help you with posting projects, placing bids, managing payments, and using all platform features. What would you like to know?";
    }
}
