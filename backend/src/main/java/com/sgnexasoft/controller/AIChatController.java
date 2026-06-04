package com.sgnexasoft.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
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

    @Value("${anthropic.api.key:}")
    private String apiKey;

    private final ObjectMapper objectMapper;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> body) {
        if (apiKey == null || apiKey.isBlank()) {
            return ResponseEntity.ok(Map.of("reply", getFallbackReply((String) getFirstMessage(body))));
        }
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "claude-sonnet-4-20250514");
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
                String reply = data.get("content").get(0).get("text").asText();
                return ResponseEntity.ok(Map.of("reply", reply));
            }
            return ResponseEntity.ok(Map.of("reply", "I couldn't process that. Please try again."));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("reply", getFallbackReply("")));
        }
    }

    private Object getFirstMessage(Map<String, Object> body) {
        try {
            var messages = (List<?>) body.get("messages");
            if (messages != null && !messages.isEmpty()) {
                var first = (Map<?, ?>) messages.get(0);
                return first.get("content");
            }
        } catch (Exception ignored) {}
        return "";
    }

    private String getFallbackReply(String input) {
        if (input == null) input = "";
        input = input.toLowerCase();
        if (input.contains("bid") || input.contains("proposal")) 
            return "To place a bid: Go to Browse Projects, find a project, click it and submit your bid with your price and proposal. Make sure your bid is competitive!";
        if (input.contains("payment") || input.contains("wallet") || input.contains("money"))
            return "Payments work through our escrow system. Clients add funds to their wallet, then initiate payment for a project. Funds are held safely until the client releases them after approval.";
        if (input.contains("submit") || input.contains("submission"))
            return "To submit work: Go to My Projects, open the active project, and click 'Submit Work'. Include your GitHub URL, live URL, and a description of what you built.";
        if (input.contains("message") || input.contains("contact") || input.contains("chat"))
            return "Use the Messages section to communicate with clients or students. Click on Messages in the sidebar to start or continue conversations.";
        if (input.contains("project") || input.contains("post"))
            return "Clients can post projects from the Dashboard. Fill in title, description, budget, category, and deadline. Students will then bid on your project.";
        if (input.contains("register") || input.contains("signup") || input.contains("sign up"))
            return "Register as a CLIENT to post projects and hire students, or as a STUDENT to bid on projects and earn money. Use the Register button on the login page.";
        return "Hi! I'm the SGNexasoft AI Assistant. I can help you with posting projects, placing bids, managing payments, submitting work, and using all platform features. What would you like to know?";
    }
}
