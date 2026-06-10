package com.ocado.library.repository;

import com.ocado.library.model.NotificationLog;
import com.ocado.library.model.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    @Query("""
            SELECT n FROM NotificationLog n
            WHERE LOWER(n.recipientEmail) = LOWER(:recipientEmail)
            ORDER BY n.sentAt DESC
            """)
    List<NotificationLog> findForRecipientOrderBySentAtDesc(@Param("recipientEmail") String recipientEmail);

    @Query("""
            SELECT COUNT(n) FROM NotificationLog n
            WHERE LOWER(n.recipientEmail) = LOWER(:recipientEmail)
              AND n.readByRecipient = false
            """)
    long countUnreadForRecipient(@Param("recipientEmail") String recipientEmail);

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
