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
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public Map<String, Object> initiatePayment(String email, Long projectId, Double amount) {
        User client = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!project.getClient().getId().equals(client.getId()))
            throw new BadRequestException("Not authorized");
        if (project.getAssignedStudent() == null)
            throw new BadRequestException("No student assigned to this project");
        if (client.getWalletBalance() < amount)
            throw new BadRequestException("Insufficient wallet balance");

        client.setWalletBalance(client.getWalletBalance() - amount);
        userRepository.save(client);

        Payment payment = paymentRepository.save(Payment.builder()
                .project(project).client(client)
                .student(project.getAssignedStudent())
                .amount(amount).status(Payment.Status.ESCROW)
                .transactionId("TXN" + System.currentTimeMillis())
                .build());

        notificationService.create(project.getAssignedStudent(), "Payment in Escrow",
                "Client has deposited ₹" + amount + " in escrow for project: " + project.getTitle(),
                "payment", "/transactions");

        return toMap(payment);
    }

    @Transactional
    public Map<String, Object> releasePayment(String email, Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        User client = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!payment.getClient().getId().equals(client.getId()))
            throw new BadRequestException("Not authorized");
        if (payment.getStatus() != Payment.Status.ESCROW)
            throw new BadRequestException("Payment is not in escrow");

        payment.setStatus(Payment.Status.RELEASED);
        User student = payment.getStudent();
        student.setWalletBalance(student.getWalletBalance() + payment.getAmount());
        userRepository.save(student);
        payment.getProject().setStatus(Project.Status.COMPLETED);
        projectRepository.save(payment.getProject());

        notificationService.create(student, "Payment Released! 💰",
                "₹" + payment.getAmount() + " has been released to your wallet for project: " + payment.getProject().getTitle(),
                "payment", "/transactions");

        return toMap(paymentRepository.save(payment));
    }

    public List<Map<String, Object>> getMyTransactions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Payment> payments;
        if (user.getRole() == User.Role.CLIENT)
            payments = paymentRepository.findByClientOrderByCreatedAtDesc(user);
        else
            payments = paymentRepository.findByStudentOrderByCreatedAtDesc(user);
        return payments.stream().map(this::toMap).toList();
    }

    public Map<String, Object> toMap(Payment p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("amount", p.getAmount());
        map.put("status", p.getStatus());
        map.put("transactionId", p.getTransactionId());
        map.put("createdAt", p.getCreatedAt());
        map.put("projectId", p.getProject().getId());
        map.put("projectTitle", p.getProject().getTitle());
        map.put("clientId", p.getClient().getId());
        map.put("clientName", p.getClient().getName());
        map.put("studentId", p.getStudent().getId());
        map.put("studentName", p.getStudent().getName());
        return map;
    }
}
