package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.dto.CancelBookingRequest;
import com.smartcampus.smart_campus_api.dto.CreateBookingRequest;
import com.smartcampus.smart_campus_api.dto.RejectBookingRequest;
import com.smartcampus.smart_campus_api.model.Booking;
import com.smartcampus.smart_campus_api.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
    @ResponseStatus(HttpStatus.CREATED)
    public Booking createBooking(@Valid @RequestBody CreateBookingRequest request) {
        return bookingService.createBooking(request);
    }

    @GetMapping("/my")
    public List<Booking> getMyBookings(@RequestParam String userId) {
        return bookingService.getMyBookings(userId);
    }

    @GetMapping
    public List<Booking> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return bookingService.getAllBookings(status, resourceId, date);
    }

    @GetMapping("/{id}")
    public Booking getBookingById(@PathVariable String id) {
        return bookingService.getBookingById(id);
    }

    @PatchMapping("/{id}/approve")
    public Booking approveBooking(@PathVariable String id) {
        return bookingService.approveBooking(id);
    }

    @PatchMapping("/{id}/reject")
    public Booking rejectBooking(@PathVariable String id, @Valid @RequestBody RejectBookingRequest request) {
        return bookingService.rejectBooking(id, request.getReason());
    }

    @PatchMapping("/{id}/cancel")
    public Booking cancelBooking(@PathVariable String id, @RequestBody(required = false) CancelBookingRequest request) {
        return bookingService.cancelBooking(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBooking(@PathVariable String id) {
        bookingService.deleteBooking(id);
    }
}