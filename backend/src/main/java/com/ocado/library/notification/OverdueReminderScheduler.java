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

    private final OverdueDetectionService overdueDetectionService;
    private final NotificationService notificationService;
    private final NotificationLogService notificationLogService;

    public OverdueReminderScheduler(
            OverdueDetectionService overdueDetectionService,
            NotificationService notificationService,
            NotificationLogService notificationLogService) {
        this.overdueDetectionService = overdueDetectionService;
        this.notificationService = notificationService;
        this.notificationLogService = notificationLogService;
    }

    @Scheduled(cron = "${app.notifications.cron}")
    public void sendOverdueReminders() {
        boolean slackEnabled = notificationService.isEnabled();

        for (Item item : overdueDetectionService.findOverdueItems()) {
            if (notificationLogService.wasRecentlySent(
                    item.getInternalId(), NotificationType.OVERDUE_REMINDER)) {
                continue;
            }

            boolean slackSent = slackEnabled && notificationService.sendOverdueReminder(item);
            if (!slackEnabled || slackSent) {
                notificationLogService.record(
                        item.getInternalId(),
                        NotificationType.OVERDUE_REMINDER,
                        item.getBorrower());
                if (slackSent) {
                    log.info("Sent overdue reminder for \"{}\" (copy {}) to {}",
                            item.getDescription().getTitle(), item.getInternalId(), item.getBorrower());
                } else {
                    log.info("Recorded overdue reminder for in-app panel for \"{}\" (copy {}) to {} (Slack disabled)",
                            item.getDescription().getTitle(), item.getInternalId(), item.getBorrower());
                }
            }
        }
    }
}
