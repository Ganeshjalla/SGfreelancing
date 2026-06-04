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
public class BidService {
    private final BidRepository bidRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public Map<String, Object> placeBid(String email, Long projectId, Map<String, Object> req) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (student.getRole() != User.Role.STUDENT)
            throw new BadRequestException("Only students can place bids");

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (project.getStatus() != Project.Status.OPEN)
            throw new BadRequestException("Project is not open for bids");
        if (bidRepository.existsByProjectAndStudent(project, student))
            throw new BadRequestException("You have already bid on this project");

        Bid bid = Bid.builder()
                .project(project)
                .student(student)
                .amount(Double.parseDouble(req.get("amount").toString()))
                .proposal((String) req.get("proposal"))
                .deliveryDays(req.get("deliveryDays") != null ? Integer.parseInt(req.get("deliveryDays").toString()) : null)
                .status(Bid.Status.PENDING)
                .build();
        bid = bidRepository.save(bid);

        notificationService.create(project.getClient(), "New Bid Received",
                student.getName() + " placed a bid of ₹" + bid.getAmount() + " on your project: " + project.getTitle(),
                "bid", "/projects/" + project.getId());

        return toMap(bid);
    }

    public List<Map<String, Object>> getProjectBids(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        return bidRepository.findByProjectOrderByCreatedAtDesc(project).stream().map(this::toMap).toList();
    }

    public List<Map<String, Object>> getMyBids(String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bidRepository.findByStudentOrderByCreatedAtDesc(student).stream().map(this::toMap).toList();
    }

    @Transactional
    public Map<String, Object> acceptBid(Long bidId, String email) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new ResourceNotFoundException("Bid not found"));
        User client = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!bid.getProject().getClient().getId().equals(client.getId()))
            throw new BadRequestException("Not authorized");

        bid.setStatus(Bid.Status.ACCEPTED);
        bid.getProject().setStatus(Project.Status.IN_PROGRESS);
        bid.getProject().setAssignedStudent(bid.getStudent());
        projectRepository.save(bid.getProject());

        // Reject other bids
        bidRepository.findByProjectOrderByCreatedAtDesc(bid.getProject()).forEach(b -> {
            if (!b.getId().equals(bidId) && b.getStatus() == Bid.Status.PENDING) {
                b.setStatus(Bid.Status.REJECTED);
                bidRepository.save(b);
            }
        });

        notificationService.create(bid.getStudent(), "Bid Accepted! 🎉",
                "Your bid on '" + bid.getProject().getTitle() + "' was accepted! Start working now.",
                "bid", "/projects/" + bid.getProject().getId());

        return toMap(bidRepository.save(bid));
    }

    @Transactional
    public Map<String, Object> rejectBid(Long bidId, String email) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new ResourceNotFoundException("Bid not found"));
        User client = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!bid.getProject().getClient().getId().equals(client.getId()))
            throw new BadRequestException("Not authorized");
        bid.setStatus(Bid.Status.REJECTED);
        return toMap(bidRepository.save(bid));
    }

    public Map<String, Object> toMap(Bid b) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", b.getId());
        map.put("amount", b.getAmount());
        map.put("proposal", b.getProposal());
        map.put("deliveryDays", b.getDeliveryDays());
        map.put("status", b.getStatus());
        map.put("createdAt", b.getCreatedAt());
        map.put("projectId", b.getProject().getId());
        map.put("projectTitle", b.getProject().getTitle());
        map.put("studentId", b.getStudent().getId());
        map.put("studentName", b.getStudent().getName());
        map.put("studentRating", b.getStudent().getRating());
        return map;
    }
}
