package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.CancelBookingRequest;
import com.smartcampus.smart_campus_api.dto.CreateBookingRequest;
import com.smartcampus.smart_campus_api.enums.BookingStatus;
import com.smartcampus.smart_campus_api.model.Booking;
import com.smartcampus.smart_campus_api.repository.BookingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public Booking createBooking(CreateBookingRequest request) {
        validateBookingRequest(request);

        checkConflict(
                request.getResourceId(),
                request.getDate(),
                request.getStartTime().toString(),
                request.getEndTime().toString(),
                null
        );

        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId().trim());
        booking.setUserId(request.getUserId().trim());
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose().trim());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required");
        }
        return bookingRepository.findByUserIdOrderByDateDescStartTimeDesc(userId.trim());
    }

    public List<Booking> getAllBookings(String status, String resourceId, LocalDate date) {
        List<Booking> bookings = bookingRepository.findAll();

        if (status != null && !status.isBlank()) {
            BookingStatus bookingStatus;
            try {
                bookingStatus = BookingStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid booking status");
            }

            bookings = bookings.stream()
                    .filter(b -> b.getStatus() == bookingStatus)
                    .collect(Collectors.toList());
        }

        if (resourceId != null && !resourceId.isBlank()) {
            bookings = bookings.stream()
                    .filter(b -> resourceId.trim().equalsIgnoreCase(b.getResourceId()))
                    .collect(Collectors.toList());
        }

        if (date != null) {
            bookings = bookings.stream()
                    .filter(b -> date.equals(b.getDate()))
                    .collect(Collectors.toList());
        }

        return bookings.stream()
                .sorted(Comparator.comparing(Booking::getDate).reversed()
                        .thenComparing(Booking::getStartTime, Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    public Booking getBookingById(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    public Booking approveBooking(String bookingId) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending bookings can be approved");
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

    public Booking rejectBooking(String bookingId, String reason) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending bookings can be rejected");
        }

        if (reason == null || reason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason.trim());

        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(String bookingId, CancelBookingRequest request) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only approved or pending bookings can be cancelled"
            );
        }

        booking.setStatus(BookingStatus.CANCELLED);

        if (request != null && request.getReason() != null && !request.getReason().isBlank()) {
            booking.setCancelReason(request.getReason().trim());
        }

        return bookingRepository.save(booking);
    }

    public void deleteBooking(String bookingId) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() == BookingStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Approved bookings cannot be deleted. Cancel them instead."
            );
        }

        bookingRepository.delete(booking);
    }

    private void validateBookingRequest(CreateBookingRequest request) {
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time and end time are required");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be before end time");
        }

        LocalDateTime bookingStartDateTime = LocalDateTime.of(request.getDate(), request.getStartTime());
        if (bookingStartDateTime.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking time cannot be in the past");
        }
    }

    public void checkConflict(String resourceId, LocalDate date, String startTime, String endTime, String ignoreBookingId) {
        List<Booking> approvedBookings = bookingRepository.findByResourceIdAndDateAndStatus(
                resourceId.trim(),
                date,
                BookingStatus.APPROVED
        );

        var newStart = java.time.LocalTime.parse(startTime);
        var newEnd = java.time.LocalTime.parse(endTime);

        for (Booking existing : approvedBookings) {
            if (ignoreBookingId != null && ignoreBookingId.equals(existing.getId())) {
                continue;
            }

            boolean overlaps = newStart.isBefore(existing.getEndTime()) && newEnd.isAfter(existing.getStartTime());

            if (overlaps) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Booking conflict: resource is already booked from "
                                + existing.getStartTime() + " to " + existing.getEndTime()
                );
            }
        }
    }
}