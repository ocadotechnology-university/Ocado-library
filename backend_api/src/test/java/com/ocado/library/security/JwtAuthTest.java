package com.ocado.library.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class JwtAuthTest {

  @Test
  void createsTokenReadableBySpringDecoder() {
    var key = new SecretKeySpec(
        "ocado-library-dev-jwt-secret-change-in-production-min-32-chars".getBytes(StandardCharsets.UTF_8),
        "HmacSHA256");
    var jwtAuth = new JwtAuth(key, 24);
    var auth = new UsernamePasswordAuthenticationToken(
        "user@example.com",
        null,
        List.of(new SimpleGrantedAuthority("ROLE_USER"), new SimpleGrantedAuthority("ROLE_ADMIN")));

    String token = jwtAuth.createToken(auth);

    JwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
  var jwt = decoder.decode(token);

    assertThat(jwt.getSubject()).isEqualTo("user@example.com");
    assertThat(jwt.getClaimAsStringList("roles")).contains("USER", "ADMIN");
  }
}
