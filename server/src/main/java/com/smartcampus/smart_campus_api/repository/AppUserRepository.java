package com.smartcampus.smart_campus_api.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.smart_campus_api.model.AppUser;

public interface AppUserRepository extends MongoRepository<AppUser, String> {
    Optional<AppUser> findByEmail(String email);
}