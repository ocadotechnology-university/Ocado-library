package com.ocado.library.dto.request;

import com.ocado.library.model.enums.ItemStatus;

public record AdminUpdateItemStatusRequest(
        ItemStatus status,
        String reason
) {}
