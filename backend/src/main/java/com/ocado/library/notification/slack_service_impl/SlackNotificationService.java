package com.ocado.library.notification.slack_service_impl;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ocado.library.model.Item;
import com.ocado.library.notification.NotificationProperties;
import com.ocado.library.notification.NotificationService;

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
                "Ocado Library reminder: \"%s\" (copy %s) has been on loan for %d days. Please return it when you can.",
                title,
                item.getInternalId(),
                daysBorrowed);
        return sendDirectMessage(item.getBorrower(), message);
    }

    @Override
    public boolean sendManualMessage(String recipientEmail, String message) {
        return sendDirectMessage(recipientEmail, message);
    }

    @Override
    public boolean sendUserPing(Item item, String pingerEmail) {
        if (item.getBorrower() == null || pingerEmail == null || pingerEmail.isBlank()) {
            return false;
        }
        String title = item.getDescription().getTitle();
        String message = String.format(
                "Ocado Library: %s has asked you to return \"%s\" (copy %s).",
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
