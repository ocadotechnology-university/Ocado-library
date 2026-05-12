package com.ocado.library.controller;

import com.ocado.library.dto.response.ItemSummary;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping("/{description_id}")
    public ResponseEntity<List<ItemSummary>> getItemsByDescription(
            @PathVariable("description_id") Long descriptionId,
            @RequestParam(required = false) ItemStatus status) {
            
        List<ItemSummary> summaries = itemService.getItemsByDescription(descriptionId, status).stream()
                .map(item -> new ItemSummary(item.getInternalId(), item.getStatus(), item.getBorrower()))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(summaries);
    }

    @PostMapping("/{internal_id}/borrow")
    public ResponseEntity<Void> borrowItem(
            @PathVariable("internal_id") String internalId,
            @RequestHeader(value = "X-User-Email", defaultValue = "testuser@ocado.com") String userEmail) {
            
        itemService.borrowItem(internalId, userEmail);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{internal_id}/return")
    public ResponseEntity<Void> returnItem(
            @PathVariable("internal_id") String internalId,
            @RequestHeader(value = "X-User-Email", defaultValue = "testuser@ocado.com") String userEmail) {
            
        itemService.returnItem(internalId, userEmail);
        return ResponseEntity.ok().build();
    }
}
