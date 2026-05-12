package com.ocado.library.dto.request;

import com.ocado.library.model.enums.ItemStatus;

public record AdminCreateItemRequest(
        String internalId,
        Long descriptionId,
        ItemStatus status
) {}
