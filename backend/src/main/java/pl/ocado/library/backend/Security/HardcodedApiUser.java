package pl.ocado.library.backend.Security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Stały „użytkownik” API bez logowania — tylko do zapisów w dzienniku i reguł admina.
 * Wartości z {@code application.properties} (domyślnie zahardkodowane sensownie pod dev).
 */
@Component
public class HardcodedApiUser {

    private final String email;
    private final boolean admin;

    public HardcodedApiUser(
            @Value("${app.api.user-email:dev@ocado.local}") String email,
            @Value("${app.api.user-admin:true}") boolean admin) {
        this.email = email;
        this.admin = admin;
    }

    public String email() {
        return email;
    }

    /** {@code true} = wszystkie endpointy admin i edycja katalogu dozwolone. */
    public boolean admin() {
        return admin;
    }
}
