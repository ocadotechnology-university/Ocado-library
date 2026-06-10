package com.ocado.library.notification;

import com.ocado.library.dto.response.NotificationLogEntry;
import com.ocado.library.exception.ForbiddenException;
import com.ocado.library.exception.NotFoundException;
import com.ocado.library.model.Item;
import com.ocado.library.model.NotificationLog;
import com.ocado.library.model.enums.NotificationType;
import com.ocado.library.repository.ItemRepository;
import com.ocado.library.repository.NotificationLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationLogService {

    private final NotificationLogRepository notificationLogRepository;
    private final ItemRepository itemRepository;
    private final NotificationProperties properties;

    public NotificationLogService(
            NotificationLogRepository notificationLogRepository,
            ItemRepository itemRepository,
            NotificationProperties properties) {
        this.notificationLogRepository = notificationLogRepository;
        this.itemRepository = itemRepository;
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
        log.setRecipientEmail(normalizeEmail(recipientEmail));
        log.setSenderEmail(senderEmail != null ? normalizeEmail(senderEmail) : null);
        log.setSentAt(LocalDateTime.now());
        log.setReadByRecipient(false);
        notificationLogRepository.save(log);
    }

    public boolean wasUserPingRecentlySent(String itemInternalId, String senderEmail) {
        LocalDateTime since =
                LocalDateTime.now().minusHours(properties.getPingCooldownHours());
        return notificationLogRepository.existsByItemInternalIdAndNotificationTypeAndSenderEmailAndSentAtAfter(
                itemInternalId, NotificationType.USER_PING, normalizeEmail(senderEmail), since);
    }

    public List<NotificationLogEntry> getEntriesForRecipient(String recipientEmail) {
        return notificationLogRepository.findForRecipientOrderBySentAtDesc(normalizeEmail(recipientEmail)).stream()
                .map(this::toEntry)
                .toList();
    }

    public long countUnreadForRecipient(String recipientEmail) {
        return notificationLogRepository.countUnreadForRecipient(normalizeEmail(recipientEmail));
    }

    public void markAsRead(Long id, String recipientEmail) {
        NotificationLog log = notificationLogRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notification not found: " + id));

        if (!normalizeEmail(log.getRecipientEmail()).equals(normalizeEmail(recipientEmail))) {
            throw new ForbiddenException("You cannot mark another user's notification as read");
        }

        if (!log.isReadByRecipient()) {
            log.setReadByRecipient(true);
            notificationLogRepository.save(log);
        }
    }

    static String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private NotificationLogEntry toEntry(NotificationLog log) {
        String itemTitle = itemRepository.findByInternalId(log.getItemInternalId())
                .map(Item::getDescription)
                .map(description -> description.getTitle())
                .orElse(null);

        return new NotificationLogEntry(
                log.getId(),
                log.getItemInternalId(),
                log.getNotificationType(),
                log.getRecipientEmail(),
                log.getSenderEmail(),
                log.getSentAt(),
                itemTitle,
                log.isReadByRecipient());
    }
}
