package com.ocado.library.notification;

import com.ocado.library.model.Item;
import com.ocado.library.model.enums.NotificationType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class OverdueReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(OverdueReminderScheduler.class);

    private final SlackClient slackClient;
    private final OverdueDetectionService overdueDetectionService;
    private final SlackNotificationService slackNotificationService;
    private final NotificationLogService notificationLogService;

    public OverdueReminderScheduler(
            SlackClient slackClient,
            OverdueDetectionService overdueDetectionService,
            SlackNotificationService slackNotificationService,
            NotificationLogService notificationLogService) {
        this.slackClient = slackClient;
        this.overdueDetectionService = overdueDetectionService;
        this.slackNotificationService = slackNotificationService;
        this.notificationLogService = notificationLogService;
    }

    @Scheduled(cron = "${app.notifications.cron}")
    public void sendOverdueReminders() {
        if (!slackClient.isConfigured()) {
            log.debug("Skipping overdue reminder cron: Slack not configured");
            return;
        }

        for (Item item : overdueDetectionService.findOverdueItems()) {
            if (notificationLogService.wasRecentlySent(
                    item.getInternalId(), NotificationType.OVERDUE_REMINDER)) {
                continue;
            }
            if (slackNotificationService.sendOverdueReminder(item)) {
                notificationLogService.record(
                        item.getInternalId(),
                        NotificationType.OVERDUE_REMINDER,
                        item.getBorrower());
                log.info("Sent overdue Slack reminder for item {}", item.getInternalId());
            }
        }
    }
}
