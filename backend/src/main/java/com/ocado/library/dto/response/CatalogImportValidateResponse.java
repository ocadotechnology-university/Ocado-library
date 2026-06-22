package com.ocado.library.dto.response;

import java.util.List;

public record CatalogImportValidateResponse(
        boolean valid,
        List<String> errors
) {}
