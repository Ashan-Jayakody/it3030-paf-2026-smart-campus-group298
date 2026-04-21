package com.smartcampus.smart_campus_api.service;

import java.time.Instant;
import java.util.List;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.smartcampus.smart_campus_api.model.AppRole;
import com.smartcampus.smart_campus_api.model.AppUser;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtEncoder jwtEncoder;

    public String generateToken(AppUser user) {
        Instant now = Instant.now();

        List<String> roles = user.getRoles().stream()
                .map(AppRole::name)
                .toList();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("smart-campus-api")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(60L * 60L * 8L))
                .subject(user.getEmail())
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("picture", user.getPicture())
                .claim("roles", roles)
                .build();

        JwsHeader headers = JwsHeader.with(MacAlgorithm.HS256)
                .type("JWT")
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
    }
}