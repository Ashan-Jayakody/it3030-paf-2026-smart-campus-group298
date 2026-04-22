package com.smartcampus.smart_campus_api.dto;

import com.smartcampus.smart_campus_api.model.AppUser;

public record AuthResponse(
        String token,
        String tokenType,
        CurrentUserResponse user
) {
    public static AuthResponse of(String token, AppUser user) {
        return new AuthResponse(token, "Bearer", CurrentUserResponse.from(user));
    }
}