package com.ocado.library.controller;

import com.ocado.library.model.enums.ItemType;
import com.ocado.library.security.CurrentUser;
import com.ocado.library.service.CatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/descriptions")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/{type}/all")
    public ResponseEntity<List<Object>> getAllDescriptions(
            @PathVariable ItemType type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> tags) {

        List<Object> result = catalogService.getAllDescriptions(type, search, tags, CurrentUser.email());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{type}/tags")
    public ResponseEntity<Map<String, Object>> getTags(@PathVariable ItemType type) {
        // TODO: distinct tags not fully implemented in service, returning empty for now
        return ResponseEntity.ok(Map.of("type", type, "tags", List.of()));
    }

    @GetMapping("/{type}/{description_id}")
    public ResponseEntity<Object> getDescriptionById(
            @PathVariable ItemType type,
            @PathVariable("description_id") Long descriptionId) {
        // Ignored for brevity
        return ResponseEntity.ok().build();
    }
}
