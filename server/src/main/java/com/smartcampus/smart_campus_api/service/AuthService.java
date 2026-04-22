package com.smartcampus.smart_campus_api.service;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

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
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.google.client-id}")
    private String googleClientId;

    @Value("${app.admin-emails:}")
    private String adminEmailsRaw;

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

    public AuthResponse loginWithGoogle(String credential) {
        Map<String, Object> tokenInfo = verifyGoogleToken(credential);

        String email = normalizeEmail(String.valueOf(tokenInfo.get("email")));
        String name = String.valueOf(tokenInfo.getOrDefault("name", email));
        String picture = String.valueOf(tokenInfo.getOrDefault("picture", ""));
        String sub = String.valueOf(tokenInfo.get("sub"));

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

    private Map<String, Object> verifyGoogleToken(String credential) {
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token="
                + UriUtils.encodeQueryParam(credential, StandardCharsets.UTF_8);

        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        Map<String, Object> body = response.getBody();

        if (body == null) {
            throw new IllegalArgumentException("Invalid Google token.");
        }

        String audience = String.valueOf(body.get("aud"));
        if (!googleClientId.equals(audience)) {
            throw new IllegalArgumentException("Google token audience does not match your client id.");
        }

        String emailVerified = String.valueOf(body.get("email_verified"));
        if (!"true".equalsIgnoreCase(emailVerified)) {
            throw new IllegalArgumentException("Google email is not verified.");
        }

        return body;
    }

    private boolean isAdminEmail(String email) {
        if (adminEmailsRaw == null || adminEmailsRaw.isBlank()) {
            return false;
        }

        Set<String> adminEmails = Arrays.stream(adminEmailsRaw.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toSet());

        return adminEmails.contains(email);
    }
}