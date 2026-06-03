package com.ocado.library.repository;

import com.ocado.library.model.NotificationLog;
import com.ocado.library.model.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    boolean existsByItemInternalIdAndNotificationTypeAndSentAtAfter(
            String itemInternalId,
            NotificationType notificationType,
            LocalDateTime sentAt);

    boolean existsByItemInternalIdAndNotificationTypeAndSenderEmailAndSentAtAfter(
            String itemInternalId,
            NotificationType notificationType,
            String senderEmail,
            LocalDateTime sentAt);
}
