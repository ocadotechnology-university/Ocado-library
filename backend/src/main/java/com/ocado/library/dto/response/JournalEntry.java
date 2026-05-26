package com.ocado.library.dto.response;

import java.time.LocalDateTime;

import com.ocado.library.model.enums.OperationType;

public record JournalEntry(
        Long id,
        LocalDateTime datetime,
        OperationType operationType,
        String user,
        String itemId,
        Long descriptionId
) {}
