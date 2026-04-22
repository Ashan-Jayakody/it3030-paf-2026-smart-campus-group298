package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.BookingActionDTO;
import com.smartcampus.smart_campus_api.dto.BookingRequestDTO;
import com.smartcampus.smart_campus_api.enums.BookingStatus;
import com.smartcampus.smart_campus_api.exception.ConflictException;
import com.smartcampus.smart_campus_api.exception.ResourceNotFoundException;
import com.smartcampus.smart_campus_api.model.Booking;
import com.smartcampus.smart_campus_api.model.Resource;
import com.smartcampus.smart_campus_api.model.ResourceStatus;
import com.smartcampus.smart_campus_api.repository.BookingRepository;
import com.smartcampus.smart_campus_api.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public BookingServiceImpl(BookingRepository bookingRepository, ResourceRepository resourceRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
    }

    @Override
    public Booking createBooking(BookingRequestDTO requestDTO) {
        validateBookingRequest(requestDTO);

        Resource resource = resourceRepository.findById(requestDTO.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + requestDTO.getResourceId()));

        if (resource.getStatus() == ResourceStatus.UNAVAILABLE) {
            throw new IllegalArgumentException("Selected resource is unavailable");
        }

        if (requestDTO.getExpectedAttendees() > resource.getCapacity()) {
            throw new IllegalArgumentException("Expected attendees exceed resource capacity");
        }

        List<Booking> approvedBookings = bookingRepository.findByResourceIdAndBookingDateAndStatus(
                requestDTO.getResourceId(),
                requestDTO.getBookingDate(),
                BookingStatus.APPROVED
        );

        boolean hasConflict = approvedBookings.stream().anyMatch(existing ->
                existing.getStartTime().isBefore(requestDTO.getEndTime()) &&
                existing.getEndTime().isAfter(requestDTO.getStartTime())
        );

        if (hasConflict) {
            throw new ConflictException("This resource is already booked for the selected time range");
        }

        Booking booking = new Booking();
        booking.setResourceId(requestDTO.getResourceId());
        booking.setUserId(requestDTO.getUserId());
        booking.setBookingDate(requestDTO.getBookingDate());
        booking.setStartTime(requestDTO.getStartTime());
        booking.setEndTime(requestDTO.getEndTime());
        booking.setPurpose(requestDTO.getPurpose());
        booking.setExpectedAttendees(requestDTO.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    @Override
    public List<Booking> getMyBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    @Override
    public Booking approveBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be approved");
        }

        List<Booking> approvedBookings = bookingRepository.findByResourceIdAndBookingDateAndStatus(
                booking.getResourceId(),
                booking.getBookingDate(),
                BookingStatus.APPROVED
        );

        boolean hasConflict = approvedBookings.stream()
                .filter(existing -> !existing.getId().equals(booking.getId()))
                .anyMatch(existing ->
                        existing.getStartTime().isBefore(booking.getEndTime()) &&
                        existing.getEndTime().isAfter(booking.getStartTime())
                );

        if (hasConflict) {
            throw new ConflictException("Cannot approve booking because of a scheduling conflict");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectionReason(null);
        return bookingRepository.save(booking);
    }

    @Override
    public Booking rejectBooking(Long bookingId, BookingActionDTO actionDTO) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be rejected");
        }

        if (actionDTO == null || actionDTO.getReason() == null || actionDTO.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(actionDTO.getReason());
        return bookingRepository.save(booking);
    }

    @Override
    public Booking cancelBooking(Long bookingId, BookingActionDTO actionDTO) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalArgumentException("Only approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(actionDTO != null ? actionDTO.getReason() : null);
        return bookingRepository.save(booking);
    }

    private void validateBookingRequest(BookingRequestDTO requestDTO) {
        if (!requestDTO.getEndTime().isAfter(requestDTO.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        if (requestDTO.getBookingDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Booking date cannot be in the past");
        }
    }
}
