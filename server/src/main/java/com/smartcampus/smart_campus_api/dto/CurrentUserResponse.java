package com.smartcampus.smart_campus_api.dto;

import java.util.Set;

import com.smartcampus.smart_campus_api.model.AppRole;
import com.smartcampus.smart_campus_api.model.AppUser;

public record CurrentUserResponse(
        String id,
        String name,
        String email,
        String picture,
        Set<AppRole> roles
) {
    public static CurrentUserResponse from(AppUser user) {
        return new CurrentUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPicture(),
                Set.copyOf(user.getRoles())
        );
    }
}