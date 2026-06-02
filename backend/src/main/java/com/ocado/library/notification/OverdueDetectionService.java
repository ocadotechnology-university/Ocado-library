package com.ocado.library.notification;

import com.ocado.library.model.BoardGameDescription;
import com.ocado.library.model.BookDescription;
import com.ocado.library.model.Description;
import com.ocado.library.model.Item;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OverdueDetectionService {

    private final ItemRepository itemRepository;
    private final NotificationProperties properties;

    public OverdueDetectionService(ItemRepository itemRepository, NotificationProperties properties) {
        this.itemRepository = itemRepository;
        this.properties = properties;
    }

    public List<Item> findOverdueItems() {
        LocalDateTime now = LocalDateTime.now();
        return itemRepository.findByStatus(ItemStatus.BORROWED).stream()
                .filter(item -> item.getBorrowedAt() != null)
                .filter(item -> isOverdue(item, now))
                .toList();
    }

    public int loanLimitDaysFor(Description description) {
        if (description instanceof BookDescription) {
            return properties.getLoanLimitsDays().getBook();
        }
        if (description instanceof BoardGameDescription) {
            return properties.getLoanLimitsDays().getBoardGame();
        }
        return -1;
    }

    private boolean isOverdue(Item item, LocalDateTime now) {
        int limitDays = loanLimitDaysFor(item.getDescription());
        if (limitDays < 0) {
            return false;
        }
        LocalDateTime dueAt = item.getBorrowedAt().plusDays(limitDays);
        return dueAt.isBefore(now);
    }
}
