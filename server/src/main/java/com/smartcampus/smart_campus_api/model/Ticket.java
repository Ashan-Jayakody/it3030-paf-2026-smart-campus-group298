package com.smartcampus.smart_campus_api.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    private String category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private String contactDetails;
    private String resourceId; // Added for filtering by resource

    private String creatorId; // ID of the AppUser who created the ticket
    private String technicianId; // ID of the AppUser (TECHNICIAN) assigned to the ticket

    @Builder.Default
    private List<String> attachments = new ArrayList<>(); // List of image URLs or Base64 (max 3)

    private String rejectionReason;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
