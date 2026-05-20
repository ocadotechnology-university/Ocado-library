package com.ocado.library.security;

import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@org.springframework.context.annotation.Profile("!test")
public class JwtAuth {

    private final SecretKey secretKey;
    private final long expirationSeconds;

    public JwtAuth(
            SecretKey jwtSecretKey,
            @Value("${app.jwt.expiration-hours:24}") long expirationHours) {
        this.secretKey = jwtSecretKey;
        this.expirationSeconds = expirationHours * 3600;
    }

    public Map<String, Object> tokenResponse(Authentication authentication) {
        Map<String, Object> body = new HashMap<>();
        body.put("accessToken", createToken(authentication));
        body.put("tokenType", "Bearer");
        body.put("expiresIn", expirationSeconds);
        return body;
    }

    public String createToken(Authentication authentication) {
        String email = emailFrom(authentication);
        List<String> roles = rolesOrDefault(authentication);
        Instant now = Instant.now();

        return Jwts.builder()
                .issuer("library-api")
                .subject(email)
                .claim("email", email)
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expirationSeconds)))
                .signWith(secretKey)
                .compact();
    }

    private static List<String> rolesOrDefault(Authentication authentication) {
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring("ROLE_".length()))
                .distinct()
                .toList();
        return roles.isEmpty() ? List.of("USER") : roles;
    }

    private static String emailFrom(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof OidcUser oidcUser && oidcUser.getEmail() != null) {
            return oidcUser.getEmail().toLowerCase();
        }
        if (principal instanceof Jwt jwt) {
            String email = jwt.getClaimAsString("email");
            if (email != null && !email.isBlank()) {
                return email.toLowerCase();
            }
        }
        return authentication.getName().toLowerCase();
    }
}
