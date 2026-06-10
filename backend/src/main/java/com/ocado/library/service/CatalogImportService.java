package com.ocado.library.service;

import com.ocado.library.dto.request.MigrationDescriptionRequest;
import com.ocado.library.dto.request.MigrationInstanceRequest;
import com.ocado.library.dto.response.CatalogImportResponse;
import com.ocado.library.dto.response.CatalogImportRowResult;
import com.ocado.library.exception.BadRequestException;
import com.ocado.library.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class CatalogImportService {

    private final CatalogImportRowService catalogImportRowService;
    private final ItemRepository itemRepository;

    public CatalogImportService(
            CatalogImportRowService catalogImportRowService,
            ItemRepository itemRepository) {
        this.catalogImportRowService = catalogImportRowService;
        this.itemRepository = itemRepository;
    }

    public CatalogImportResponse importDescriptions(
            List<MigrationDescriptionRequest> entries,
            String userEmail) {
        if (entries == null || entries.isEmpty()) {
            throw new BadRequestException("Import payload must be a non-empty JSON array of descriptions");
        }

        List<String> fileErrors = validateFile(entries);
        if (!fileErrors.isEmpty()) {
            throw new BadRequestException(String.join("; ", fileErrors));
        }

        List<CatalogImportRowResult> results = new ArrayList<>();
        int imported = 0;
        int failed = 0;

        for (int i = 0; i < entries.size(); i++) {
            CatalogImportRowResult rowResult = catalogImportRowService.importRow(i, entries.get(i), userEmail);
            results.add(rowResult);
            if ("IMPORTED".equals(rowResult.status())) {
                imported++;
            } else {
                failed++;
            }
        }

        return new CatalogImportResponse(entries.size(), imported, failed, results);
    }

    private List<String> validateFile(List<MigrationDescriptionRequest> entries) {
        List<String> errors = new ArrayList<>();
        Set<String> seenInternalIds = new HashSet<>();

        for (int i = 0; i < entries.size(); i++) {
            MigrationDescriptionRequest entry = entries.get(i);
            if (entry == null) {
                errors.add("Row " + i + ": entry must be an object");
                continue;
            }

            errors.addAll(CatalogImportRowService.validateRow(i, entry));

            if (entry.instances() != null) {
                for (MigrationInstanceRequest instance : entry.instances()) {
                    if (instance == null || instance.internalId() == null) {
                        continue;
                    }
                    String normalizedId = instance.internalId().trim().toUpperCase();
                    if (!seenInternalIds.add(normalizedId)) {
                        errors.add("Duplicate internalId in file: " + normalizedId);
                    }
                    if (itemRepository.findByInternalId(normalizedId).isPresent()) {
                        errors.add("internalId already exists in database: " + normalizedId);
                    }
                }
            }
        }

        return errors;
    }
}
