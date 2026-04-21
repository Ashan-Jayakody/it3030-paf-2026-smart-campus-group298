package com.smartcampus.smart_campus_api.controller;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.smart_campus_api.dto.AuthResponse;
import com.smartcampus.smart_campus_api.dto.CurrentUserResponse;
import com.smartcampus.smart_campus_api.model.AppRole;
import com.smartcampus.smart_campus_api.service.AuthService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    public record GoogleLoginRequest(@NotBlank String credential) {
    }

    public record EmailSignupRequest(
            @NotBlank String name,
            @NotBlank @jakarta.validation.constraints.Email String email,
            @NotBlank @jakarta.validation.constraints.Size(min = 8) String password,
            @NotBlank String role) {
    }

    public record EmailLoginRequest(
            @NotBlank @jakarta.validation.constraints.Email String email,
            @NotBlank String password) {
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request.credential()));
    }

    @PostMapping("/local/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody EmailSignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
            authService.signupWithEmail(
                request.name(),
                request.email(),
                request.password(),
                request.role())
        );
    }

    @PostMapping("/local/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody EmailLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithEmail(request.email(), request.password()));
    }

    @GetMapping("/me")
    public ResponseEntity<CurrentUserResponse> me(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<String> roleNames = jwt.getClaimAsStringList("roles");
        Set<AppRole> roles = new LinkedHashSet<>();
        if (roleNames != null) {
            roles = roleNames.stream()
                    .map(AppRole::valueOf)
                    .collect(Collectors.toCollection(LinkedHashSet::new));
        }

        return ResponseEntity.ok(new CurrentUserResponse(
                jwt.getSubject(),
                jwt.getClaimAsString("name"),
                jwt.getClaimAsString("email"),
                jwt.getClaimAsString("picture"),
                roles
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(exception.getMessage());
    }
}