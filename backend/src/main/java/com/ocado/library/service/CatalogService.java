package com.ocado.library.service;

import com.ocado.library.dto.response.BoardGameDescriptionDTO;
import com.ocado.library.dto.response.BookDescriptionDTO;
import com.ocado.library.dto.response.PSGameDescriptionDTO;
import com.ocado.library.model.*;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.model.enums.ItemType;
import com.ocado.library.repository.DescriptionRepository;
import com.ocado.library.repository.ItemRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
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
            List<String> wanted = tags.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .toList();
            descriptions = descriptions.stream()
                .filter(d -> {
                    if (d.getTags() == null || d.getTags().isEmpty()) return false;
                    List<String> itemTags = d.getTags().stream()
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(String::toLowerCase)
                        .toList();
                    return wanted.stream().allMatch(itemTags::contains);
                })
                .collect(Collectors.toList());
        }
        
        if (search != null && !search.isBlank()) {
            descriptions = descriptions.stream()
                .filter(d -> d.getTitle().toLowerCase().contains(search.toLowerCase()) ||
                             (d instanceof BookDescription && ((BookDescription)d).getAuthor().toLowerCase().contains(search.toLowerCase())))
                .collect(Collectors.toList());
        }

        log.info("Browsed {} catalog: {} items by {}{}",
                type, descriptions.size(), userEmail, formatFilters(search, tags));

        return descriptions.stream().map(d -> mapToDTO(d, userEmail)).collect(Collectors.toList());
    }

    public List<String> getDistinctTags(ItemType type) {
        return descriptionRepository.findByType(type).stream()
            .flatMap(d -> d.getTags() == null ? Stream.empty() : d.getTags().stream())
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .distinct()
            .sorted(Comparator.naturalOrder())
            .collect(Collectors.toList());
    }
    
    private static String formatFilters(String search, List<String> tags) {
        StringBuilder filters = new StringBuilder();
        if (search != null && !search.isBlank()) {
            filters.append("search='").append(search).append("'");
        }
        if (tags != null && !tags.isEmpty()) {
            if (!filters.isEmpty()) {
                filters.append(", ");
            }
            filters.append("tags=").append(tags);
        }
        return filters.isEmpty() ? "" : " [" + filters + "]";
    }

    private Object mapToDTO(Description d, String userEmail) {
        List<Item> items = itemRepository.findByDescriptionId(d.getId());
        String internalId = items.isEmpty() ? null : items.get(0).getInternalId();
        String status = resolveStatus(items, userEmail, d.getType());
        
        if (d instanceof BookDescription bd) {
            return new BookDescriptionDTO(
                bd.getId(), internalId, bd.getType(), bd.getTitle(), bd.getAuthor(), bd.getIsbn(), bd.getImage(),
                bd.getDescription(), bd.getTags(), status
            );
        } else if (d instanceof BoardGameDescription bgd) {
            return new BoardGameDescriptionDTO(
                bgd.getId(), internalId, bgd.getType(), bgd.getTitle(), bgd.getDescription(),
                bgd.getNumberOfPlayers(), bgd.getTags(), status
            );
        } else if (d instanceof PSGameDescription ps) {
            return new PSGameDescriptionDTO(
                ps.getId(), internalId, ps.getType(), ps.getTitle(), ps.getDescription(), ps.getTags()
            );
        }
        return null;
    }

    private String resolveStatus(List<Item> items, String callerEmail, ItemType type) {
        if (type == ItemType.PSGame) return null; // PS5 games do not expose status
        if (items.isEmpty()) return "UNAVAILABLE";
        
        boolean borrowedByMe = items.stream().anyMatch(i -> callerEmail.equals(i.getBorrower()));
        if (borrowedByMe) return "BORROWED_BY_ME";
        
        boolean available = items.stream().anyMatch(i -> i.getStatus() == ItemStatus.AVAILABLE);
        if (available) return "AVAILABLE";
        
        return "BORROWED";
    }
}
