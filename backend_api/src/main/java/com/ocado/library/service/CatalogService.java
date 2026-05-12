package com.ocado.library.service;

import com.ocado.library.dto.response.BoardGameDescriptionDTO;
import com.ocado.library.dto.response.BookDescriptionDTO;
import com.ocado.library.dto.response.PSGameDescriptionDTO;
import com.ocado.library.model.*;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.model.enums.ItemType;
import com.ocado.library.repository.DescriptionRepository;
import com.ocado.library.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CatalogService {
    private final DescriptionRepository descriptionRepository;
    private final ItemRepository itemRepository;
    
    public CatalogService(DescriptionRepository descriptionRepository, ItemRepository itemRepository) {
        this.descriptionRepository = descriptionRepository;
        this.itemRepository = itemRepository;
    }
    
    public List<Object> getAllDescriptions(ItemType type, String search, List<String> tags, String userEmail) {
        List<Description> descriptions = descriptionRepository.findByType(type);
        
        // Basic filtering for tags and search
        if (tags != null && !tags.isEmpty()) {
            descriptions = descriptions.stream()
                .filter(d -> d.getTags() != null && d.getTags().stream().anyMatch(tags::contains))
                .collect(Collectors.toList());
        }
        
        if (search != null && !search.isBlank()) {
            descriptions = descriptions.stream()
                .filter(d -> d.getTitle().toLowerCase().contains(search.toLowerCase()) ||
                             (d instanceof BookDescription && ((BookDescription)d).getAuthor().toLowerCase().contains(search.toLowerCase())))
                .collect(Collectors.toList());
        }

        return descriptions.stream().map(d -> mapToDTO(d, userEmail)).collect(Collectors.toList());
    }
    
    private Object mapToDTO(Description d, String userEmail) {
        List<Item> items = itemRepository.findByDescriptionId(d.getId());
        String status = resolveStatus(items, userEmail, d.getType());
        
        if (d instanceof BookDescription bd) {
            return new BookDescriptionDTO(
                bd.getId(), null, bd.getType(), bd.getTitle(), bd.getAuthor(),
                bd.getDescription(), bd.getCategory(), bd.getTags(), status
            );
        } else if (d instanceof BoardGameDescription bgd) {
            return new BoardGameDescriptionDTO(
                bgd.getId(), null, bgd.getType(), bgd.getTitle(), bgd.getDescription(),
                bgd.getNumberOfPlayers(), bgd.getBggLink(), bgd.getTags(), status
            );
        } else if (d instanceof PSGameDescription ps) {
            return new PSGameDescriptionDTO(
                ps.getId(), null, ps.getType(), ps.getTitle(), ps.getDescription(), ps.getTags()
            );
        }
        return null;
    }

    private String resolveStatus(List<Item> items, String callerEmail, ItemType type) {
        if (type == ItemType.PSGame) return null; // PS5 games do not expose status
        if (items.isEmpty()) return "UNAVAILABLE";
        
        boolean borrowedByMe = items.stream().anyMatch(i -> callerEmail.equals(i.getBorrower()));
        if (borrowedByMe) return "BORROWED_BY_ME";
        
        boolean available = items.stream().anyMatch(i -> i.getStatus() == ItemStatus.IN_OFFICE);
        if (available) return "AVAILABLE";
        
        return "BORROWED";
    }
}
