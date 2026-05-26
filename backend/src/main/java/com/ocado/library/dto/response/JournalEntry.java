package com.ocado.library.dto.response;

import java.time.LocalDateTime;

public record JournalEntry(
        Long id,
        LocalDateTime datetime,
        String description,
        String user
) {}
