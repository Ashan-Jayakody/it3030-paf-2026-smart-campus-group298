package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.dto.BookingActionDTO;
import com.smartcampus.smart_campus_api.dto.BookingRequestDTO;
import com.smartcampus.smart_campus_api.model.Booking;
import com.smartcampus.smart_campus_api.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequestDTO requestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(requestDTO));
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long bookingId) {
        return ResponseEntity.ok(bookingService.getBookingById(bookingId));
    }

    @GetMapping("/my/{userId}")
    public ResponseEntity<List<Booking>> getMyBookings(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    @PatchMapping("/{bookingId}/approve")
    public ResponseEntity<Booking> approveBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(bookingService.approveBooking(bookingId));
    }

    @PatchMapping("/{bookingId}/reject")
    public ResponseEntity<Booking> rejectBooking(@PathVariable Long bookingId,
                                                 @RequestBody BookingActionDTO actionDTO) {
        return ResponseEntity.ok(bookingService.rejectBooking(bookingId, actionDTO));
    }

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long bookingId,
                                                 @RequestBody BookingActionDTO actionDTO) {
        return ResponseEntity.ok(bookingService.cancelBooking(bookingId, actionDTO));
    }
}
