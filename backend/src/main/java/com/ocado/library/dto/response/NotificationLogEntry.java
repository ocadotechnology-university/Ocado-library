package com.ocado.library.dto.response;

import com.ocado.library.model.enums.NotificationType;

import java.time.LocalDateTime;

public record NotificationLogEntry(
        Long id,
        String itemInternalId,
        NotificationType notificationType,
        String recipientEmail,
        String senderEmail,
        LocalDateTime sentAt,
        String itemTitle,
        boolean read
) {}
