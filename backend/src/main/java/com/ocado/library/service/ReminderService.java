package com.ocado.library.service;

import com.ocado.library.exception.ConflictException;
import com.ocado.library.exception.NotFoundException;
import com.ocado.library.model.Item;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.model.enums.NotificationType;
import com.ocado.library.notification.NotificationLogService;
import com.ocado.library.notification.NotificationService;
import com.ocado.library.repository.ItemRepository;
import org.springframework.stereotype.Service;

@Service
public class ReminderService {

    private final ItemRepository itemRepository;
    private final NotificationService notificationService;
    private final NotificationLogService notificationLogService;

    public ReminderService(
            ItemRepository itemRepository,
            NotificationService notificationService,
            NotificationLogService notificationLogService) {
        this.itemRepository = itemRepository;
        this.notificationService = notificationService;
        this.notificationLogService = notificationLogService;
    }

    public void sendManualReminder(String internalId, String pingerEmail) {
        sendUserPing(internalId, pingerEmail);
    }

    public void sendUserPing(String internalId, String pingerEmail) {
        Item item = itemRepository.findByInternalId(internalId)
                .orElseThrow(() -> new NotFoundException("Item not found: " + internalId));

        if (item.getStatus() != ItemStatus.BORROWED) {
            throw new ConflictException("Item is not currently borrowed");
        }

        String borrower = item.getBorrower();
        if (borrower == null || borrower.isBlank()) {
            throw new ConflictException("Item has no borrower");
        }

        String normalizedPinger = pingerEmail.trim().toLowerCase();
        if (borrower.trim().equalsIgnoreCase(normalizedPinger)) {
            throw new ConflictException("You cannot ping yourself");
        }

        if (notificationLogService.wasUserPingRecentlySent(item.getInternalId(), normalizedPinger)) {
            throw new ConflictException("You already sent a ping for this item recently");
        }

        if (!notificationService.isEnabled()) {
            return;
        }

        if (notificationService.sendUserPing(item, normalizedPinger)) {
            notificationLogService.record(
                    item.getInternalId(),
                    NotificationType.USER_PING,
                    borrower,
                    normalizedPinger);
        }
    }
}
