package com.smartcampus.smart_campus_api.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.smart_campus_api.model.Ticket;
import com.smartcampus.smart_campus_api.model.TicketPriority;
import com.smartcampus.smart_campus_api.model.TicketStatus;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByCreatorId(String creatorId);
    
    // For Admin filtering - using dynamic queries or custom methods can be done later if needed, 
    // but standard MongoRepository methods are good for start.
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByPriority(TicketPriority priority);
    List<Ticket> findByTechnicianId(String technicianId);
    List<Ticket> findByResourceId(String resourceId);
}
