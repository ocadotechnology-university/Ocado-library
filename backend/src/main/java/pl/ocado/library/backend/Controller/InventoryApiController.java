package pl.ocado.library.backend.Controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pl.ocado.library.backend.Security.HardcodedApiUser;
import pl.ocado.library.backend.Service.InventoryApplicationService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class InventoryApiController {

    private final InventoryApplicationService inventoryApplicationService;
    private final HardcodedApiUser hardcodedApiUser;

    public InventoryApiController(
            InventoryApplicationService inventoryApplicationService, HardcodedApiUser hardcodedApiUser) {
        this.inventoryApplicationService = inventoryApplicationService;
        this.hardcodedApiUser = hardcodedApiUser;
    }

    @GetMapping("/descriptions/{type}/all")
    public List<Map<String, Object>> listDescriptions(
            @PathVariable String type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean show_archived) {
        return inventoryApplicationService.listDescriptionsAll(
                type, search, category, show_archived, hardcodedApiUser);
    }

    @GetMapping("/descriptions/{type}/{description_id}")
    public Map<String, Object> getDescription(
            @PathVariable String type, @PathVariable("description_id") int descriptionId) {
        return inventoryApplicationService.getDescription(type, descriptionId, hardcodedApiUser);
    }

    @PostMapping("/descriptions/{type}/add")
    public ResponseEntity<Map<String, Object>> addDescription(
            @PathVariable String type, @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inventoryApplicationService.createDescription(type, body, hardcodedApiUser));
    }

    @PutMapping("/descriptions/{type}/{description_id}/edit")
    public ResponseEntity<Void> editDescription(
            @PathVariable String type,
            @PathVariable("description_id") int descriptionId,
            @RequestBody Map<String, Object> body) {
        inventoryApplicationService.updateDescription(type, descriptionId, body, hardcodedApiUser);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/descriptions/{type}/{description_id}/archive")
    public ResponseEntity<Void> archive(
            @PathVariable String type, @PathVariable("description_id") int descriptionId) {
        inventoryApplicationService.archiveDescription(type, descriptionId, hardcodedApiUser);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/items/{description_id:\\d+}")
    public List<Map<String, Object>> listItems(
            @PathVariable("description_id") int descriptionId,
            @RequestParam(required = false, defaultValue = "Book") String type,
            @RequestParam(required = false) String status) {
        return inventoryApplicationService.listItems(descriptionId, type, status);
    }

    @PostMapping("/items/{internal_id}/borrow")
    public ResponseEntity<Void> borrow(@PathVariable("internal_id") String internalId) {
        inventoryApplicationService.borrow(internalId, hardcodedApiUser);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/items/{internal_id}/return")
    public ResponseEntity<Void> returnItem(@PathVariable("internal_id") String internalId) {
        inventoryApplicationService.returnItem(internalId, hardcodedApiUser);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/items/add")
    public ResponseEntity<Map<String, Object>> adminAddItem(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inventoryApplicationService.adminCreateItem(body, hardcodedApiUser));
    }

    @GetMapping("/admin/items/{internal_id}")
    public Map<String, Object> adminGetItem(@PathVariable("internal_id") String internalId) {
        return inventoryApplicationService.adminGetItem(internalId, hardcodedApiUser);
    }

    @PatchMapping("/admin/items/{internal_id}/status")
    public Map<String, Object> adminPatchStatus(
            @PathVariable("internal_id") String internalId, @RequestBody Map<String, Object> body) {
        return inventoryApplicationService.adminPatchItemStatus(internalId, body, hardcodedApiUser);
    }

    @GetMapping("/admin/journal")
    public List<Map<String, Object>> adminJournal(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer description_id,
            @RequestParam(required = false) String internal_id) {
        return inventoryApplicationService.adminJournal(
                from, to, user, type, description_id, internal_id, hardcodedApiUser);
    }

    @PostMapping("/admin/reminders/{internal_id}")
    public Map<String, Object> reminder(@PathVariable("internal_id") String internalId) {
        return inventoryApplicationService.reminderStub(internalId, hardcodedApiUser);
    }
}
