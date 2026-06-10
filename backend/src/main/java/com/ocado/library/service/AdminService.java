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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

@Slf4j
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
            bd.setIsbn(req.isbn());
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
        log.info("Created {} \"{}\" (id={}) by {}", type, description.getTitle(), description.getId(), userEmail);
        return description;
    }

    public Description updateDescription(ItemType type, Long descriptionId, Object requestBody, String userEmail) {
        Description description = descriptionRepository.findById(descriptionId)
                .orElseThrow(() -> new NotFoundException("Description not found"));

        if (type != description.getType()) {
            throw new IllegalArgumentException("Description type mismatch");
        }

        if (description instanceof BookDescription bd && requestBody instanceof CreateBookRequest req) {
            bd.setTitle(req.title());
            bd.setAuthor(req.author());
            bd.setIsbn(req.isbn());
            bd.setDescription(req.description());
            bd.setTags(req.tags());
            bd.setImage(req.image());
        } else if (description instanceof BoardGameDescription bgd && requestBody instanceof CreateBoardGameRequest req) {
            bgd.setTitle(req.title());
            bgd.setDescription(req.description());
            bgd.setNumberOfPlayers(req.numberOfPlayers());
            bgd.setTags(req.tags());
        } else if (description instanceof PSGameDescription ps && requestBody instanceof CreatePSGameRequest req) {
            ps.setTitle(req.title());
            ps.setDescription(req.description());
            ps.setTags(req.tags());
        } else {
            throw new IllegalArgumentException("Invalid request for type");
        }

        Description saved = descriptionRepository.save(description);
        journalService.logAction(OperationType.UPDATE, userEmail, null, saved.getId());
        log.info("Updated {} \"{}\" (id={}) by {}", type, saved.getTitle(), saved.getId(), userEmail);
        return saved;
    }

    public Description updateTags(ItemType type, Long descriptionId, List<String> tags, String userEmail) {
        Description description = descriptionRepository.findById(descriptionId)
                .orElseThrow(() -> new NotFoundException("Description not found"));

        if (type != description.getType()) {
            throw new IllegalArgumentException("Description type mismatch");
        }

        LinkedHashSet<String> unique = new LinkedHashSet<>();
        if (tags != null) {
            for (String raw : tags) {
                if (raw == null) continue;
                String tag = raw.trim();
                if (!tag.isEmpty()) {
                    unique.add(tag);
                }
            }
        }
        description.setTags(new ArrayList<>(unique));

        Description saved = descriptionRepository.save(description);
        journalService.logAction(OperationType.UPDATE, userEmail, null, saved.getId());
        log.info("Updated tags for {} \"{}\" (id={}) by {}", type, saved.getTitle(), saved.getId(), userEmail);
        return saved;
    }

    public Item addPhysicalCopy(AdminCreateItemRequest request, String userEmail) {
        Description description = descriptionRepository.findById(request.descriptionId())
                .orElseThrow(() -> new NotFoundException("Description not found"));

        if (description.getType() == ItemType.PSGame) {
            boolean hasAny = !itemRepository.findByDescriptionId(description.getId()).isEmpty();
            if (hasAny) {
                throw new IllegalArgumentException("PS games can only have one physical instance");
            }
        }
                
        Item item = new Item();
        item.setInternalId(request.internalId());
        item.setDescription(description);
        item.setStatus(request.status() != null ? request.status() : ItemStatus.AVAILABLE);
        
        itemRepository.save(item);
        journalService.logAction(OperationType.ADD, userEmail, item.getInternalId(), description.getId());
        log.info("Added copy {} for \"{}\" (id={}) by {}",
                item.getInternalId(), description.getTitle(), description.getId(), userEmail);

        return item;
    }

    public Item updatePhysicalCopyStatus(String internalId, ItemStatus status, String userEmail) {
        Item item = itemRepository.findByInternalId(internalId)
                .orElseThrow(() -> new NotFoundException("Item not found: " + internalId));
        item.setStatus(status);
        if (status == ItemStatus.AVAILABLE) {
            item.setBorrower(null);
            item.setBorrowedAt(null);
        }
        Item saved = itemRepository.save(item);
        journalService.logAction(OperationType.UPDATE, userEmail, internalId, saved.getDescription().getId());
        log.info("Changed copy {} status to {} for \"{}\" by {}",
                internalId, status, saved.getDescription().getTitle(), userEmail);
        return saved;
    }

    @Transactional
    public void deleteDescription(ItemType type, Long descriptionId, String userEmail) {
        Description description = descriptionRepository.findById(descriptionId)
                .orElseThrow(() -> new NotFoundException("Description not found"));

        if (type != description.getType()) {
            throw new IllegalArgumentException("Description type mismatch");
        }

        String title = description.getTitle();
        itemRepository.deleteByDescriptionId(descriptionId);
        descriptionRepository.delete(description);
        journalService.logAction(OperationType.DELETE, userEmail, null, descriptionId);
        log.info("Deleted {} \"{}\" (id={}) by {}", type, title, descriptionId, userEmail);
    }
}
