package com.ocado.library.dto.request;

import com.ocado.library.model.enums.ItemStatus;

public record MigrationInstanceRequest(
        String internalId,
        ItemStatus status
) {}
