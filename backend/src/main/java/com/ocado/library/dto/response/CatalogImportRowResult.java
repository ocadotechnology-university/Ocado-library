package com.ocado.library.dto.response;

import com.ocado.library.model.enums.ItemType;

import java.util.List;

public record CatalogImportRowResult(
        int rowIndex,
        ItemType type,
        String status,
        Long descriptionId,
        int instancesCreated,
        List<String> errors
) {}
