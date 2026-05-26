package com.ocado.library.dto.response;

import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.model.enums.ItemType;

public record ItemDetail(
        String internalId,
        ItemStatus status,
        String borrower,
        Long descriptionId,
        ItemType type
) {}
