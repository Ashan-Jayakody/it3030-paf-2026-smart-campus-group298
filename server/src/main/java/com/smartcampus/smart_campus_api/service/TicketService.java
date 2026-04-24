package com.smartcampus.smart_campus_api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.smartcampus.smart_campus_api.model.Ticket;
import com.smartcampus.smart_campus_api.model.TicketPriority;
import com.smartcampus.smart_campus_api.model.TicketStatus;
import com.smartcampus.smart_campus_api.repository.TicketRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;

    public Ticket createTicket(Ticket ticket) {
        if (ticket.getAttachments() != null && ticket.getAttachments().size() > 3) {
            throw new IllegalArgumentException("Maximum 3 attachments allowed.");
        }
        ticket.setStatus(TicketStatus.OPEN);
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getTicketsByCreator(String creatorId) {
        return ticketRepository.findByCreatorId(creatorId);
    }

    public List<Ticket> getAllTickets(TicketStatus status, TicketPriority priority, String technicianId, String resourceId) {
        // Simple filtering logic
        if (status != null) {
            return ticketRepository.findByStatus(status);
        } else if (priority != null) {
            return ticketRepository.findByPriority(priority);
        } else if (technicianId != null) {
            return ticketRepository.findByTechnicianId(technicianId);
        } else if (resourceId != null) {
            return ticketRepository.findByResourceId(resourceId);
        }
        return ticketRepository.findAll();
    }

    public Optional<Ticket> getTicketById(String id) {
        return ticketRepository.findById(id);
    }

    public Ticket updateStatus(String ticketId, TicketStatus newStatus, String rejectionReason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        // Validate workflow logic if necessary, here we just follow the status updates
        // OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED
        // REJECTED can be set by Admin at any point (usually from OPEN or IN_PROGRESS)
        
        ticket.setStatus(newStatus);
        if (newStatus == TicketStatus.REJECTED) {
            ticket.setRejectionReason(rejectionReason);
        }
        
        return ticketRepository.save(ticket);
    }

    public Ticket assignTechnician(String ticketId, String technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
        
        ticket.setTechnicianId(technicianId);
        return ticketRepository.save(ticket);
    }

    public Ticket updateTicket(String id, Ticket updatedData, String userId, boolean isAdmin) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (!isAdmin && !ticket.getCreatorId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to update this ticket");
        }

        // Only allow updates if the ticket is still OPEN or IN_PROGRESS (optional business rule)
        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.RESOLVED) {
            throw new IllegalArgumentException("Cannot update a resolved or closed ticket");
        }

        ticket.setCategory(updatedData.getCategory());
        ticket.setDescription(updatedData.getDescription());
        ticket.setPriority(updatedData.getPriority());
        ticket.setContactDetails(updatedData.getContactDetails());
        ticket.setResourceId(updatedData.getResourceId());
        
        if (updatedData.getAttachments() != null) {
            if (updatedData.getAttachments().size() > 3) {
                throw new IllegalArgumentException("Maximum 3 attachments allowed");
            }
            ticket.setAttachments(updatedData.getAttachments());
        }

        return ticketRepository.save(ticket);
    }

    public void deleteTicket(String id, String userId, boolean isAdmin) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (!isAdmin && !ticket.getCreatorId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to delete this ticket");
        }

        ticketRepository.delete(ticket);
    }
}
