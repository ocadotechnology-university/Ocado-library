package com.ocado.library.service;

import com.ocado.library.exception.ConflictException;
import com.ocado.library.exception.NotFoundException;
import com.ocado.library.model.Item;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.model.enums.OperationType;
import com.ocado.library.repository.ItemRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class ItemService {
    private final ItemRepository itemRepository;
    private final JournalService journalService;
    
    public ItemService(ItemRepository itemRepository, JournalService journalService) {
        this.itemRepository = itemRepository;
        this.journalService = journalService;
    }
    
    public List<Item> getItemsByDescription(Long descriptionId, ItemStatus status, String userEmail) {
        List<Item> items = status != null
                ? itemRepository.findByDescriptionIdAndStatus(descriptionId, status)
                : itemRepository.findByDescriptionId(descriptionId);

        String title = items.isEmpty() ? null : items.get(0).getDescription().getTitle();
        if (title != null) {
            log.info("Viewed copies of \"{}\" (id={}): {} items by {}{}",
                    title, descriptionId, items.size(), userEmail, status != null ? " [status=" + status + "]" : "");
        } else {
            log.info("Viewed copies for description id={}: 0 items by {}", descriptionId, userEmail);
        }

        return items;
    }
    
    public void borrowItem(String internalId, String userEmail) {
        Item item = itemRepository.findByInternalId(internalId)
                .orElseThrow(() -> new NotFoundException("Item not found: " + internalId));
                
        if (item.getStatus() != ItemStatus.AVAILABLE) {
            throw new ConflictException("Item is not available for borrowing");
        }
        
        item.setStatus(ItemStatus.BORROWED);
        item.setBorrower(userEmail);
        item.setBorrowedAt(LocalDateTime.now());
        itemRepository.save(item);
        
        journalService.logAction(OperationType.BORROW, userEmail, internalId, item.getDescription().getId());
        log.info("Borrowed \"{}\" (copy {}) by {}", item.getDescription().getTitle(), internalId, userEmail);
    }
    
    public void returnItem(String internalId, String userEmail) {
        Item item = itemRepository.findByInternalId(internalId)
                .orElseThrow(() -> new NotFoundException("Item not found: " + internalId));
                
        if (item.getStatus() != ItemStatus.BORROWED) {
            throw new ConflictException("Item is not borrowed");
        }
        
        // Authorization skipped per requirements, ideally check if caller == borrower OR Admin
        
        String previousBorrower = item.getBorrower();
        item.setStatus(ItemStatus.AVAILABLE);
        item.setBorrower(null);
        item.setBorrowedAt(null);
        itemRepository.save(item);
        
        journalService.logAction(OperationType.RETURN, userEmail, internalId, item.getDescription().getId());
        log.info("Returned \"{}\" (copy {}) by {} (was borrowed by {})",
                item.getDescription().getTitle(), internalId, userEmail, previousBorrower);
    }
}
