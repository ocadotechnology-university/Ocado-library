package com.ocado.library.notification;

import com.ocado.library.model.NotificationLog;
import com.ocado.library.model.enums.NotificationType;
import com.ocado.library.repository.NotificationLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationLogService {

    private final NotificationLogRepository notificationLogRepository;
    private final NotificationProperties properties;

    public NotificationLogService(
            NotificationLogRepository notificationLogRepository,
            NotificationProperties properties) {
        this.notificationLogRepository = notificationLogRepository;
        this.properties = properties;
    }

    public boolean wasRecentlySent(String itemInternalId, NotificationType type) {
        LocalDateTime since = LocalDateTime.now().minusDays(properties.getReminderCooldownDays());
        return notificationLogRepository.existsByItemInternalIdAndNotificationTypeAndSentAtAfter(
                itemInternalId, type, since);
    }

    public void record(String itemInternalId, NotificationType type, String recipientEmail) {
        record(itemInternalId, type, recipientEmail, null);
    }

    public void record(
            String itemInternalId,
            NotificationType type,
            String recipientEmail,
            String senderEmail) {
        NotificationLog log = new NotificationLog();
        log.setItemInternalId(itemInternalId);
        log.setNotificationType(type);
        log.setRecipientEmail(recipientEmail);
        log.setSenderEmail(senderEmail);
        log.setSentAt(LocalDateTime.now());
        notificationLogRepository.save(log);
    }

    public boolean wasUserPingRecentlySent(String itemInternalId, String senderEmail) {
        LocalDateTime since =
                LocalDateTime.now().minusHours(properties.getPingCooldownHours());
        return notificationLogRepository.existsByItemInternalIdAndNotificationTypeAndSenderEmailAndSentAtAfter(
                itemInternalId, NotificationType.USER_PING, senderEmail, since);
    }
}
