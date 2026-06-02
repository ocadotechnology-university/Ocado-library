package com.ocado.library.notification;

import com.ocado.library.model.Item;
import com.ocado.library.model.Journal;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.model.enums.OperationType;
import com.ocado.library.repository.ItemRepository;
import com.ocado.library.repository.JournalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Component
public class BorrowedAtBackfill {

    private static final Logger log = LoggerFactory.getLogger(BorrowedAtBackfill.class);

    private final ItemRepository itemRepository;
    private final JournalRepository journalRepository;

    public BorrowedAtBackfill(ItemRepository itemRepository, JournalRepository journalRepository) {
        this.itemRepository = itemRepository;
        this.journalRepository = journalRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void backfillMissingBorrowedAt() {
        List<Item> borrowed = itemRepository.findByStatus(ItemStatus.BORROWED);
        int updated = 0;
        for (Item item : borrowed) {
            if (item.getBorrowedAt() != null) {
                continue;
            }
            journalRepository.findByItemId(item.getInternalId()).stream()
                    .filter(j -> j.getOperationType() == OperationType.BORROW)
                    .max(Comparator.comparing(Journal::getDatetime))
                    .ifPresent(j -> item.setBorrowedAt(j.getDatetime()));
            if (item.getBorrowedAt() == null) {
                log.warn("Borrowed item {} has no borrowedAt and no BORROW journal entry", item.getInternalId());
                continue;
            }
            itemRepository.save(item);
            updated++;
        }
        if (updated > 0) {
            log.info("Backfilled borrowedAt for {} item(s)", updated);
        }
    }
}
