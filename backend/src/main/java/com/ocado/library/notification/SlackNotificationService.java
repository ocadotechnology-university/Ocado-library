package com.ocado.library.notification;

import com.ocado.library.model.Item;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class SlackNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(SlackNotificationService.class);

    private final SlackClient slackClient;
    private final NotificationProperties properties;

    public SlackNotificationService(SlackClient slackClient, NotificationProperties properties) {
        this.slackClient = slackClient;
        this.properties = properties;
    }

    @Override
    public boolean isEnabled() {
        return slackClient.isConfigured();
    }

    @Override
    public boolean sendOverdueReminder(Item item) {
        if (item.getBorrower() == null || item.getBorrowedAt() == null) {
            return false;
        }
        long daysBorrowed = ChronoUnit.DAYS.between(item.getBorrowedAt(), LocalDateTime.now());
        String title = item.getDescription().getTitle();
        String message = String.format(
                "Przypomnienie z Ocado Library: „%s” (egzemplarz %s) jest wypożyczony od %d dni — prosimy o zwrot.",
                title,
                item.getInternalId(),
                daysBorrowed);
        return sendDirectMessage(item.getBorrower(), message);
    }

    @Override
    public boolean sendManualReminder(Item item, String pingerEmail) {
        return sendUserPing(item, pingerEmail);
    }

    @Override
    public boolean sendUserPing(Item item, String pingerEmail) {
        if (item.getBorrower() == null || pingerEmail == null || pingerEmail.isBlank()) {
            return false;
        }
        String title = item.getDescription().getTitle();
        String message = String.format(
                "Ocado Library: %s prosi o zwrot „%s” (egzemplarz %s).",
                pingerEmail.trim(),
                title,
                item.getInternalId());
        return sendDirectMessage(item.getBorrower(), message);
    }

    private boolean sendDirectMessage(String recipientEmail, String message) {
        if (!slackClient.isConfigured()) {
            log.debug("Slack notifications disabled; skipping message to {}", recipientEmail);
            return false;
        }
        return slackClient.lookupUserIdByEmail(recipientEmail)
                .map(userId -> slackClient.postDirectMessage(userId, message))
                .orElseGet(() -> {
                    log.warn("Could not resolve Slack user for email {}", recipientEmail);
                    return false;
                });
    }
}
