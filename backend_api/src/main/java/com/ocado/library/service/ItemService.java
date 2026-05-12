package com.ocado.library.service;

import com.ocado.library.exception.ConflictException;
import com.ocado.library.exception.ForbiddenException;
import com.ocado.library.exception.NotFoundException;
import com.ocado.library.model.Item;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {
    private final ItemRepository itemRepository;
    private final JournalService journalService;
    
    public ItemService(ItemRepository itemRepository, JournalService journalService) {
        this.itemRepository = itemRepository;
        this.journalService = journalService;
    }
    
    public List<Item> getItemsByDescription(Long descriptionId, ItemStatus status) {
        if (status != null) {
            return itemRepository.findByDescriptionIdAndStatus(descriptionId, status);
        }
        return itemRepository.findByDescriptionId(descriptionId);
    }
    
    public void borrowItem(String internalId, String userEmail) {
        // We'll need a custom finder by internalId
        Item item = itemRepository.findAll().stream()
                .filter(i -> i.getInternalId().equals(internalId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Item not found: " + internalId));
                
        if (item.getStatus() != ItemStatus.AVAILABLE) {
            throw new ConflictException("Item is not available for borrowing");
        }
        
        item.setStatus(ItemStatus.BORROWED);
        item.setBorrower(userEmail);
        itemRepository.save(item);
        
        journalService.logAction("Borrow item " + internalId + " by " + userEmail, userEmail);
    }
    
    public void returnItem(String internalId, String userEmail) {
        Item item = itemRepository.findAll().stream()
                .filter(i -> i.getInternalId().equals(internalId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Item not found: " + internalId));
                
        if (item.getStatus() != ItemStatus.BORROWED) {
            throw new ConflictException("Item is not borrowed");
        }
        
        // Authorization skipped per requirements, ideally check if caller == borrower OR Admin
        
        String previousBorrower = item.getBorrower();
        item.setStatus(ItemStatus.AVAILABLE);
        item.setBorrower(null);
        itemRepository.save(item);
        
        journalService.logAction("Return item " + internalId + " by " + previousBorrower, userEmail);
    }
}
