package com.ocado.library.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class LibraryOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {

    private final OidcUserService delegate = new OidcUserService();
    private final Set<String> adminEmails;

    public LibraryOidcUserService(
            @Value("${app.security.admin-emails:}") String adminEmailsCsv) {
        this.adminEmails = List.of(adminEmailsCsv.split(",")).stream()
                .map(String::trim)
                .map(s -> s.toLowerCase(Locale.ROOT))
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = delegate.loadUser(userRequest);

        Boolean verified = oidcUser.getEmailVerified();
        if (verified != null && !verified) {
            throw new OAuth2AuthenticationException(new OAuth2Error(
                    "access_denied",
                    "E-mail must be verified in Google.",
                    null));
        }

        String email = oidcUser.getEmail();
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error(
                    "access_denied",
                    "No e-mail address in Google account.",
                    null));
        }

        if (adminEmails.contains(email.toLowerCase(Locale.ROOT))) {
            Set<GrantedAuthority> authorities = new LinkedHashSet<>(oidcUser.getAuthorities());
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            return new DefaultOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo());
        }

        return oidcUser;
    }
}
