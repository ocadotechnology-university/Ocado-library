package pl.ocado.library.backend.Security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class OcadoDomainOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {

    private final OidcUserService delegate = new OidcUserService();
    private final String allowedEmailSuffix;

    public OcadoDomainOidcUserService(
            @Value("${app.security.allowed-email-domain:ocado.com}") String allowedEmailDomain) {
        String domain = allowedEmailDomain.trim().toLowerCase(Locale.ROOT);
        if (domain.startsWith("@")) {
            domain = domain.substring(1);
        }
        this.allowedEmailSuffix = "@" + domain;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = delegate.loadUser(userRequest);

        Boolean verified = oidcUser.getEmailVerified();
        if (verified != null && !verified) {
            throw new OAuth2AuthenticationException(new OAuth2Error(
                    "access_denied",
                    "E-mail musi być zweryfikowany w Google.",
                    null));
        }

        String email = oidcUser.getEmail();
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error(
                    "access_denied",
                    "Brak adresu e-mail w koncie Google.",
                    null));
        }

        if (!email.toLowerCase(Locale.ROOT).endsWith(allowedEmailSuffix)) {
            throw new OAuth2AuthenticationException(new OAuth2Error(
                    "access_denied",
                    "Dostęp tylko dla kont w domenie " + allowedEmailSuffix + ".",
                    null));
        }

        return oidcUser;
    }
}
