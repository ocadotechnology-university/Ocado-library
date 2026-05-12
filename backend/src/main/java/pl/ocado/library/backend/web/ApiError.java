package pl.ocado.library.backend.web;

import org.springframework.http.HttpStatus;

public class ApiError extends RuntimeException {

    private final HttpStatus status;

    public ApiError(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
