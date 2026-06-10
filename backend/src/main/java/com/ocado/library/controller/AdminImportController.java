package com.ocado.library.controller;

import com.ocado.library.dto.request.MigrationDescriptionRequest;
import com.ocado.library.dto.response.CatalogImportResponse;
import com.ocado.library.security.CurrentUser;
import com.ocado.library.service.CatalogImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/import")
public class AdminImportController {

    private final CatalogImportService catalogImportService;

    public AdminImportController(CatalogImportService catalogImportService) {
        this.catalogImportService = catalogImportService;
    }

    @PostMapping
    public ResponseEntity<CatalogImportResponse> importDescriptions(
            @RequestBody List<MigrationDescriptionRequest> entries) {
        CatalogImportResponse response = catalogImportService.importDescriptions(
                entries,
                CurrentUser.email()
        );
        return ResponseEntity.ok(response);
    }
}
