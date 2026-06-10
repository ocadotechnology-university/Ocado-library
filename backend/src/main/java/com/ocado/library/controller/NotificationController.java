package com.ocado.library.controller;

import com.ocado.library.dto.response.NotificationLogEntry;
import com.ocado.library.dto.response.UnreadNotificationCount;
import com.ocado.library.notification.NotificationLogService;
import com.ocado.library.security.CurrentUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationLogService notificationLogService;

    public NotificationController(NotificationLogService notificationLogService) {
        this.notificationLogService = notificationLogService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationLogEntry>> getNotifications() {
        List<NotificationLogEntry> entries =
                notificationLogService.getEntriesForRecipient(CurrentUser.email());
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadNotificationCount> getUnreadCount() {
        long unreadCount = notificationLogService.countUnreadForRecipient(CurrentUser.email());
        return ResponseEntity.ok(new UnreadNotificationCount(unreadCount));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable("id") Long id) {
        notificationLogService.markAsRead(id, CurrentUser.email());
        return ResponseEntity.noContent().build();
    }
}
