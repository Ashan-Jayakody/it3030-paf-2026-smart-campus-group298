package com.smartcampus.smart_campus_api.model;

import java.util.HashSet;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "users")
public class AppUser {

    @Id
    private String id;

    private String googleId;
    private String name;
    private String email;
    private String picture;
    private String passwordHash;

    private Set<AppRole> roles = new HashSet<>();
}