package com.ocado.library.controller;

import com.ocado.library.dto.request.AdminCreateItemRequest;
import com.ocado.library.dto.request.AdminUpdateItemStatusRequest;
import com.ocado.library.dto.response.ItemDetail;
import com.ocado.library.security.CurrentUser;
import com.ocado.library.model.Item;
import com.ocado.library.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/items")
public class AdminItemController {

    private final AdminService adminService;

    public AdminItemController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/add")
    public ResponseEntity<ItemDetail> addPhysicalCopy(@RequestBody AdminCreateItemRequest request) {
        Item item = adminService.addPhysicalCopy(request, CurrentUser.email());
        ItemDetail detail = new ItemDetail(
            item.getInternalId(), item.getStatus(), item.getBorrower(),
            item.getDescription().getId(), item.getDescription().getType()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(detail);
    }

    @GetMapping("/{internal_id}")
    public ResponseEntity<Object> getPhysicalCopy(@PathVariable("internal_id") String internalId) {
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{internal_id}/status")
    public ResponseEntity<ItemDetail> changeItemStatus(
            @PathVariable("internal_id") String internalId,
            @RequestBody AdminUpdateItemStatusRequest updateStatusRequest) {
        Item item = adminService.updatePhysicalCopyStatus(internalId, updateStatusRequest.status(), CurrentUser.email());
        ItemDetail detail = new ItemDetail(
            item.getInternalId(), item.getStatus(), item.getBorrower(),
            item.getDescription().getId(), item.getDescription().getType()
        );
        return ResponseEntity.ok(detail);
    }
}
