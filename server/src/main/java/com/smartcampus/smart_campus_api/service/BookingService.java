package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.BookingActionRequest;
import com.smartcampus.smart_campus_api.dto.BookingRequestDTO;
import com.smartcampus.smart_campus_api.model.Booking;
import com.smartcampus.smart_campus_api.model.BookingStatus;
import com.smartcampus.smart_campus_api.model.Resource;
import com.smartcampus.smart_campus_api.model.ResourceStatus;
import com.smartcampus.smart_campus_api.repository.BookingRepository;
import com.smartcampus.smart_campus_api.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public BookingService(BookingRepository bookingRepository,
                          ResourceRepository resourceRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
    }

    public Booking createBooking(BookingRequestDTO request) {
        validateBookingRequest(request);

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        if (resource.getStatus() != ResourceStatus.AVAILABLE) {
            throw new IllegalArgumentException("Selected resource is not available");
        }

        if (request.getExpectedAttendees() != null
                && request.getExpectedAttendees() > resource.getCapacity()) {
            throw new IllegalArgumentException(
                    "Expected attendees exceed resource capacity of " + resource.getCapacity()
            );
        }

        if (resource.getAvailabilityWindows() != null && !resource.getAvailabilityWindows().isBlank()) {
            String[] parts = resource.getAvailabilityWindows().split("-");
            if (parts.length == 2) {
                try {
                    String p0 = parts[0].trim();
                    String p1 = parts[1].trim();
                    String fromStr = p0.length() == 5 ? p0 + ":00" : p0;
                    String toStr = p1.length() == 5 ? p1 + ":00" : p1;
                    java.time.LocalTime availableFrom = java.time.LocalTime.parse(fromStr);
                    java.time.LocalTime availableTo = java.time.LocalTime.parse(toStr);
                    
                    if (request.getStartTime().isBefore(availableFrom) || request.getEndTime().isAfter(availableTo)) {
                        throw new IllegalArgumentException("out of available time range (" + p0 + " - " + p1 + ")");
                    }
                } catch (java.time.format.DateTimeParseException e) {
                    // Ignore parse errors from legacy data
                }
            }
        }

        checkConflict(
                request.getResourceId(),
                request.getDate(),
                request.getStartTime().toString(),
                request.getEndTime().toString(),
                null
        );

        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setUserId(request.getUserId());
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);
        booking.setRejectionReason(null);
        booking.setCancelReason(null);

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Booking::getDate).reversed()
                        .thenComparing(Booking::getStartTime).reversed())
                .toList();
    }

    public List<Booking> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .sorted(Comparator.comparing(Booking::getDate).reversed()
                        .thenComparing(Booking::getStartTime).reversed())
                .toList();
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
    }

    public Booking approveBooking(String id) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be approved");
        }

        checkConflict(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime().toString(),
                booking.getEndTime().toString(),
                booking.getId()
        );

        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectionReason(null);

        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(String id, BookingActionRequest request) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(request.getReason());

        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(String id, BookingActionRequest request) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING
                && booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalArgumentException("Only pending or approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelReason(request.getReason());

        return bookingRepository.save(booking);
    }

    public void deleteBooking(String id) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() == BookingStatus.APPROVED) {
            throw new IllegalArgumentException("Approved bookings cannot be deleted directly");
        }

        bookingRepository.delete(booking);
    }

    private void validateBookingRequest(BookingRequestDTO request) {
        if (request.getResourceId() == null || request.getResourceId().isBlank()) {
            throw new IllegalArgumentException("Resource ID is required");
        }

        if (request.getUserId() == null || request.getUserId().isBlank()) {
            throw new IllegalArgumentException("User ID is required");
        }

        if (request.getDate() == null) {
            throw new IllegalArgumentException("Date is required");
        }

        if (request.getStartTime() == null) {
            throw new IllegalArgumentException("Start time is required");
        }

        if (request.getEndTime() == null) {
            throw new IllegalArgumentException("End time is required");
        }

        if (request.getPurpose() == null || request.getPurpose().isBlank()) {
            throw new IllegalArgumentException("Purpose is required");
        }

        if (request.getExpectedAttendees() != null && request.getExpectedAttendees() < 1) {
            throw new IllegalArgumentException("Expected attendees must be at least 1");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("End time must be later than start time");
        }

        LocalDateTime bookingStart = LocalDateTime.of(request.getDate(), request.getStartTime());
        if (bookingStart.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Booking cannot be created for a past date/time");
        }
    }

    private void checkConflict(String resourceId,
                               java.time.LocalDate date,
                               String startTime,
                               String endTime,
                               String currentBookingId) {
        List<Booking> approvedBookings =
                bookingRepository.findByResourceIdAndDateAndStatus(resourceId, date, BookingStatus.APPROVED);

        for (Booking existing : approvedBookings) {
            if (currentBookingId != null && currentBookingId.equals(existing.getId())) {
                continue;
            }

            boolean overlaps =
                    startTime.compareTo(existing.getEndTime().toString()) < 0 &&
                    endTime.compareTo(existing.getStartTime().toString()) > 0;

            if (overlaps) {
                throw new IllegalArgumentException(
                        "Booking conflict: resource is already booked from "
                                + existing.getStartTime() + " to " + existing.getEndTime()
                );
            }
        }
    }
}