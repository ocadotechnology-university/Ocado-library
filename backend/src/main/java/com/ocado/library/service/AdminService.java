package com.ocado.library.service;

import com.ocado.library.dto.request.AdminCreateItemRequest;
import com.ocado.library.dto.request.CreateBoardGameRequest;
import com.ocado.library.dto.request.CreateBookRequest;
import com.ocado.library.dto.request.CreatePSGameRequest;
import com.ocado.library.exception.NotFoundException;
import com.ocado.library.model.*;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.model.enums.ItemType;
import com.ocado.library.model.enums.OperationType;
import com.ocado.library.repository.DescriptionRepository;
import com.ocado.library.repository.ItemRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminService {
    private final DescriptionRepository descriptionRepository;
    private final ItemRepository itemRepository;
    private final JournalService journalService;
    
    public AdminService(DescriptionRepository descriptionRepository, ItemRepository itemRepository, JournalService journalService) {
        this.descriptionRepository = descriptionRepository;
        this.itemRepository = itemRepository;
        this.journalService = journalService;
    }
    
    public Description createDescription(ItemType type, Object requestBody, String userEmail) {
        Description description;
        if (type == ItemType.Book && requestBody instanceof CreateBookRequest req) {
            BookDescription bd = new BookDescription();
            bd.setTitle(req.title());
            bd.setAuthor(req.author());
            bd.setDescription(req.description());
            bd.setTags(req.tags());
            bd.setImage(req.image());
            bd.setType(ItemType.Book);
            description = bd;
        } else if (type == ItemType.BoardGame && requestBody instanceof CreateBoardGameRequest req) {
            BoardGameDescription bd = new BoardGameDescription();
            bd.setTitle(req.title());
            bd.setDescription(req.description());
            bd.setNumberOfPlayers(req.numberOfPlayers());
            bd.setTags(req.tags());
            bd.setType(ItemType.BoardGame);
            description = bd;
        } else if (type == ItemType.PSGame && requestBody instanceof CreatePSGameRequest req) {
            PSGameDescription ps = new PSGameDescription();
            ps.setTitle(req.title());
            ps.setDescription(req.description());
            ps.setTags(req.tags());
            ps.setType(ItemType.PSGame);
            description = ps;
        } else {
            throw new IllegalArgumentException("Invalid request for type");
        }
        
        descriptionRepository.save(description);
        journalService.logAction(OperationType.ADD, userEmail, null, description.getId());
        return description;
    }

    public Item addPhysicalCopy(AdminCreateItemRequest request, String userEmail) {
        Description description = descriptionRepository.findById(request.descriptionId())
                .orElseThrow(() -> new NotFoundException("Description not found"));
                
        Item item = new Item();
        item.setInternalId(request.internalId());
        item.setDescription(description);
        item.setStatus(request.status() != null ? request.status() : ItemStatus.AVAILABLE);
        
        itemRepository.save(item);
        journalService.logAction(OperationType.ADD, userEmail, item.getInternalId(), description.getId());
        
        return item;
    }
}
