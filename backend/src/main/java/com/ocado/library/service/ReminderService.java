package com.ocado.library.service;

import com.ocado.library.exception.ConflictException;
import com.ocado.library.exception.NotFoundException;
import com.ocado.library.model.Item;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.model.enums.NotificationType;
import com.ocado.library.notification.NotificationLogService;
import com.ocado.library.notification.NotificationService;
import com.ocado.library.repository.ItemRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
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

        PingOutcome outcome = attemptPing(item, normalizePinger(pingerEmail));
        switch (outcome) {
            case SENT, NOTIFICATIONS_DISABLED -> {
                return;
            }
            case NOT_BORROWED -> throw new ConflictException("Item is not currently borrowed");
            case NO_BORROWER -> throw new ConflictException("Item has no borrower");
            case CANNOT_PING_SELF -> throw new ConflictException("You cannot ping yourself");
            case COOLDOWN -> throw new ConflictException("You already sent a ping for this item recently");
            case SEND_FAILED -> {
                return;
            }
            default -> {
                return;
            }
        }
    }

    public void sendUserPingsForDescription(Long descriptionId, String pingerEmail) {
        String normalizedPinger = normalizePinger(pingerEmail);
        List<Item> borrowed =
                itemRepository.findByDescriptionIdAndStatus(descriptionId, ItemStatus.BORROWED);

        if (borrowed.isEmpty()) {
            throw new ConflictException("No copies are currently borrowed");
        }

        int sent = 0;
        boolean hasOtherBorrower = false;
        boolean allSkippedCooldown = true;

        for (Item item : borrowed) {
            PingOutcome outcome = attemptPing(item, normalizedPinger);
            if (outcome == PingOutcome.CANNOT_PING_SELF) {
                continue;
            }
            hasOtherBorrower = true;
            if (outcome == PingOutcome.SENT || outcome == PingOutcome.NOTIFICATIONS_DISABLED) {
                sent++;
                allSkippedCooldown = false;
            } else if (outcome != PingOutcome.COOLDOWN) {
                allSkippedCooldown = false;
            }
        }

        if (!hasOtherBorrower) {
            throw new ConflictException("You cannot ping yourself");
        }
        if (sent == 0 && allSkippedCooldown) {
            throw new ConflictException("You already sent pings for these copies recently");
        }
    }

    private PingOutcome attemptPing(Item item, String normalizedPinger) {
        if (item.getStatus() != ItemStatus.BORROWED) {
            return PingOutcome.NOT_BORROWED;
        }

        String borrower = item.getBorrower();
        if (borrower == null || borrower.isBlank()) {
            return PingOutcome.NO_BORROWER;
        }

        if (borrower.trim().equalsIgnoreCase(normalizedPinger)) {
            return PingOutcome.CANNOT_PING_SELF;
        }

        if (notificationLogService.wasUserPingRecentlySent(item.getInternalId(), normalizedPinger)) {
            return PingOutcome.COOLDOWN;
        }

        if (!notificationService.isEnabled()) {
            return PingOutcome.NOTIFICATIONS_DISABLED;
        }

        if (notificationService.sendUserPing(item, normalizedPinger)) {
            notificationLogService.record(
                    item.getInternalId(),
                    NotificationType.USER_PING,
                    borrower,
                    normalizedPinger);
            log.info("Ping sent for \"{}\" (copy {}) from {} to {}",
                    item.getDescription().getTitle(), item.getInternalId(), normalizedPinger, borrower);
            return PingOutcome.SENT;
        }

        return PingOutcome.SEND_FAILED;
    }

    private static String normalizePinger(String pingerEmail) {
        return pingerEmail.trim().toLowerCase();
    }

    private enum PingOutcome {
        SENT,
        NOTIFICATIONS_DISABLED,
        SEND_FAILED,
        NOT_BORROWED,
        NO_BORROWER,
        CANNOT_PING_SELF,
        COOLDOWN
    }
}
