package com.ocado.library.dto.response;

import java.util.List;

public record CatalogImportResponse(
        int totalRows,
        int imported,
        int failed,
        List<CatalogImportRowResult> results
) {}
