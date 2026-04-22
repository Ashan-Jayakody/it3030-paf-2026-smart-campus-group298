package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.enums.BookingStatus;
import com.smartcampus.smart_campus_api.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserIdOrderByDateDescStartTimeDesc(String userId);

    List<Booking> findByStatusOrderByDateDescStartTimeDesc(BookingStatus status);

    List<Booking> findByResourceIdAndDate(String resourceId, LocalDate date);

    List<Booking> findByResourceIdAndDateAndStatus(String resourceId, LocalDate date, BookingStatus status);

    List<Booking> findByDate(LocalDate date);

    List<Booking> findByResourceId(String resourceId);
}