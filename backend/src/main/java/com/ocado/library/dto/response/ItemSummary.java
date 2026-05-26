package com.ocado.library.dto.response;

import com.ocado.library.model.enums.ItemStatus;

public record ItemSummary(
        String internalId,
        ItemStatus status,
        String borrower
) {}
