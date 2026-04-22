package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.BookingActionDTO;
import com.smartcampus.smart_campus_api.dto.BookingRequestDTO;
import com.smartcampus.smart_campus_api.model.Booking;

import java.util.List;

public interface BookingService {
    Booking createBooking(BookingRequestDTO requestDTO);
    List<Booking> getMyBookings(Long userId);
    List<Booking> getAllBookings();
    Booking getBookingById(Long bookingId);
    Booking approveBooking(Long bookingId);
    Booking rejectBooking(Long bookingId, BookingActionDTO actionDTO);
    Booking cancelBooking(Long bookingId, BookingActionDTO actionDTO);
}
