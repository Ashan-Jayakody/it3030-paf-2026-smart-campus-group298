package com.smartcampus.smart_campus_api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.smart_campus_api.model.Comment;
import com.smartcampus.smart_campus_api.model.Ticket;
import com.smartcampus.smart_campus_api.model.TicketPriority;
import com.smartcampus.smart_campus_api.model.TicketStatus;
import com.smartcampus.smart_campus_api.service.CommentService;
import com.smartcampus.smart_campus_api.service.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody Ticket ticket) {
        ticket.setCreatorId(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(ticket));
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getTickets(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) String resourceId) { // resourceId was mentioned in filters requirement

        List<String> roles = jwt.getClaimAsStringList("roles");
        boolean isAdmin = roles != null && roles.contains("ADMIN");

        if (isAdmin) {
            return ResponseEntity.ok(ticketService.getAllTickets(status, priority, null, resourceId));
        } else {
            return ResponseEntity.ok(ticketService.getTicketsByCreator(jwt.getSubject()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        Ticket ticket = ticketService.getTicketById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        List<String> roles = jwt.getClaimAsStringList("roles");
        boolean isAdmin = roles != null && roles.contains("ADMIN");

        if (!isAdmin && !ticket.getCreatorId().equals(jwt.getSubject())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> updateStatus(
            @PathVariable String id,
            @RequestParam TicketStatus status,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ticketService.updateStatus(id, status, reason));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> assignTechnician(
            @PathVariable String id,
            @RequestParam String technicianId) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId));
    }

    // Comment Endpoints
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable String id) {
        return ResponseEntity.ok(commentService.getCommentsByTicket(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String id,
            @RequestBody Comment comment) {
        comment.setTicketId(id);
        comment.setAuthorId(jwt.getSubject());
        comment.setAuthorName(jwt.getClaimAsString("name"));
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.addComment(comment));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Comment> updateComment(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String commentId,
            @RequestBody Comment commentUpdate) {
        
        List<String> roles = jwt.getClaimAsStringList("roles");
        boolean isAdmin = roles != null && roles.contains("ADMIN");

        return ResponseEntity.ok(commentService.updateComment(
                commentId, 
                commentUpdate.getContent(), 
                jwt.getSubject(), 
                isAdmin));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String commentId) {
        
        List<String> roles = jwt.getClaimAsStringList("roles");
        boolean isAdmin = roles != null && roles.contains("ADMIN");

        commentService.deleteComment(commentId, jwt.getSubject(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
