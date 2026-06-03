package com.ocado.library.controller;

import com.ocado.library.dto.request.UpdateTagsRequest;
import com.ocado.library.model.enums.ItemType;
import com.ocado.library.security.CurrentUser;
import com.ocado.library.service.AdminService;
import com.ocado.library.service.CatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/descriptions")
public class CatalogController {

    private final CatalogService catalogService;
    private final AdminService adminService;

    public CatalogController(CatalogService catalogService, AdminService adminService) {
        this.catalogService = catalogService;
        this.adminService = adminService;
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
        List<String> tags = catalogService.getDistinctTags(type);
        return ResponseEntity.ok(Map.of("type", type, "tags", tags));
    }

    @PostMapping("/{type}/{description_id}/tags")
    public ResponseEntity<Map<String, Object>> updateTagsPost(
            @PathVariable ItemType type,
            @PathVariable("description_id") Long descriptionId,
            @RequestBody(required = false) UpdateTagsRequest body) {
        return updateTags(type, descriptionId, body);
    }

    @PatchMapping("/{type}/{description_id}/tags")
    public ResponseEntity<Map<String, Object>> updateTagsPatch(
            @PathVariable ItemType type,
            @PathVariable("description_id") Long descriptionId,
            @RequestBody(required = false) UpdateTagsRequest body) {
        return updateTags(type, descriptionId, body);
    }

    private ResponseEntity<Map<String, Object>> updateTags(
            ItemType type,
            Long descriptionId,
            UpdateTagsRequest body) {
        var description = adminService.updateTags(
                type,
                descriptionId,
                body != null ? body.tags() : List.of(),
                CurrentUser.email());
        List<String> savedTags =
                description.getTags() != null ? description.getTags() : List.of();
        return ResponseEntity.ok(Map.of("id", description.getId(), "tags", savedTags));
    }

    @GetMapping("/{type}/{description_id}")
    public ResponseEntity<Object> getDescriptionById(
            @PathVariable ItemType type,
            @PathVariable("description_id") Long descriptionId) {
        // Ignored for brevity
        return ResponseEntity.ok().build();
    }
}
