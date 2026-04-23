package com.smartcampus.smart_campus_api.service;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

import com.smartcampus.smart_campus_api.dto.AuthResponse;
import com.smartcampus.smart_campus_api.model.AppRole;
import com.smartcampus.smart_campus_api.model.AppUser;
import com.smartcampus.smart_campus_api.repository.AppUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.firebase.project-id}")
    private String firebaseProjectId;

    private volatile JwtDecoder firebaseJwtDecoder;

    public AuthResponse signupWithEmail(String name, String email, String password, String role) {
        String normalizedEmail = normalizeEmail(email);
        AppRole requestedRole = parseRequestedRole(role);

        AppUser user = appUserRepository.findByEmail(normalizedEmail).orElseGet(AppUser::new);
        if (user.getPasswordHash() != null && !user.getPasswordHash().isBlank()) {
            throw new IllegalArgumentException("Account already exists. Please sign in instead.");
        }

        user.setRoles(initialRolesForSignup(requestedRole));

        user.setEmail(normalizedEmail);
        user.setName((name == null || name.isBlank()) ? normalizedEmail : name.trim());
        user.setPicture(user.getPicture() == null ? "" : user.getPicture());
        user.setPasswordHash(passwordEncoder.encode(password));

        appUserRepository.save(user);
        return AuthResponse.of(jwtService.generateToken(user), user);
    }

    public AuthResponse loginWithEmail(String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        AppUser user = appUserRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Account not found. Please sign up first."));

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new IllegalArgumentException("This account uses Google sign-in. Please continue with Google.");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        user.setRoles(mergeRoles(user.getRoles()));
        appUserRepository.save(user);
        return AuthResponse.of(jwtService.generateToken(user), user);
    }

    public AuthResponse loginWithFirebase(String idToken) {
        Jwt token = verifyFirebaseToken(idToken);

        String email = normalizeEmail(token.getClaimAsString("email"));
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Firebase token does not contain a valid email.");
        }

        Object emailVerified = token.getClaims().get("email_verified");
        if (emailVerified instanceof Boolean verified && !verified) {
            throw new IllegalArgumentException("Google email is not verified.");
        }

        String name = token.getClaimAsString("name");
        if (name == null || name.isBlank()) {
            name = email;
        }

        String picture = token.getClaimAsString("picture");
        if (picture == null) {
            picture = "";
        }

        String sub = token.getSubject();

        AppUser user = appUserRepository.findByEmail(email).orElseGet(AppUser::new);
        user.setGoogleId(sub);
        user.setEmail(email);
        user.setName(name);
        user.setPicture(picture);

        user.setRoles(mergeRoles(user.getRoles()));
        appUserRepository.save(user);

        String jwt = jwtService.generateToken(user);
        return AuthResponse.of(jwt, user);
    }

    private Jwt verifyFirebaseToken(String idToken) {
        try {
            return getFirebaseJwtDecoder().decode(idToken);
        } catch (JwtException ex) {
            throw new IllegalArgumentException("Invalid Firebase ID token.");
        }
    }

    private JwtDecoder getFirebaseJwtDecoder() {
        if (firebaseJwtDecoder != null) {
            return firebaseJwtDecoder;
        }

        synchronized (this) {
            if (firebaseJwtDecoder != null) {
                return firebaseJwtDecoder;
            }

            String issuer = "https://securetoken.google.com/" + firebaseProjectId;
            NimbusJwtDecoder decoder = NimbusJwtDecoder
                    .withJwkSetUri("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
                    .build();

            OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);
            OAuth2TokenValidator<Jwt> withAudience = token -> {
                if (token.getAudience().contains(firebaseProjectId)) {
                    return OAuth2TokenValidatorResult.success();
                }

                return OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("invalid_token", "Invalid Firebase audience.", null)
                );
            };

            decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(withIssuer, withAudience));
            firebaseJwtDecoder = decoder;
            return firebaseJwtDecoder;
        }
    }

    private Set<AppRole> initialRolesForSignup(AppRole requestedRole) {
        Set<AppRole> roles = new HashSet<>();
        roles.add(AppRole.USER);
        if (requestedRole != AppRole.USER) {
            roles.add(AppRole.ADMIN);
            roles.add(requestedRole);
        }
        return roles;
    }

    private Set<AppRole> mergeRoles(Set<AppRole> existingRoles) {
        Set<AppRole> roles = new HashSet<>();
        if (existingRoles != null) {
            roles.addAll(existingRoles);
        }
        roles.add(AppRole.USER);
        return roles;
    }

    private AppRole parseRequestedRole(String role) {
        if (role == null || role.isBlank()) {
            return AppRole.USER;
        }

        try {
            return AppRole.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Role must be USER, ADMIN, MANAGER, or TECHNICIAN.");
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

}