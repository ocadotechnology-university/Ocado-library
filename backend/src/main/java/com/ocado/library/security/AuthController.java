package com.ocado.library.security;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Pomocnicze endpointy API — logowanie Google robi Spring automatycznie ({@code /oauth2/authorization/google}).
 */
@RestController
@Profile("!test")
@RequestMapping("/api")
public class AuthController {

    private final JwtAuth jwtAuth;

    public AuthController(JwtAuth jwtAuth) {
        this.jwtAuth = jwtAuth;
    }

    /** JWT z aktywnej sesji (gdy OAuth zwrócił błąd strony, ale cookie sesji jest). */
    @GetMapping("/auth/token")
    public ResponseEntity<Map<String, Object>> token(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(jwtAuth.tokenResponse(authentication));
    }

    /** Kto jest zalogowany — do testów w Postmanie z nagłówkiem Bearer. */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal Object principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        if (principal instanceof Jwt jwt) {
            return ResponseEntity.ok(Map.of(
                    "email", jwt.getClaimAsString("email") != null ? jwt.getClaimAsString("email") : "",
                    "roles", jwt.getClaimAsStringList("roles") != null ? jwt.getClaimAsStringList("roles") : List.of()));
        }

        if (principal instanceof OidcUser oidcUser) {
            List<String> roles = oidcUser.getAuthorities().stream()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .toList();
            return ResponseEntity.ok(Map.of(
                    "email", oidcUser.getEmail() != null ? oidcUser.getEmail() : "",
                    "name", oidcUser.getFullName() != null ? oidcUser.getFullName() : "",
                    "picture", oidcUser.getPicture() != null ? oidcUser.getPicture() : "",
                    "roles", roles));
        }

        return ResponseEntity.status(401).build();
    }
}
