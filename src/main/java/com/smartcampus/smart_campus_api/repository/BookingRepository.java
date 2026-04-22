package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.enums.BookingStatus;
import com.smartcampus.smart_campus_api.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByResourceIdAndBookingDate(Long resourceId, LocalDate bookingDate);

    List<Booking> findByResourceIdAndBookingDateAndStatus(Long resourceId, LocalDate bookingDate, BookingStatus status);
}
