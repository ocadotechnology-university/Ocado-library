package com.ocado.library.service;

import com.ocado.library.dto.request.AdminCreateItemRequest;
import com.ocado.library.dto.request.CreateBoardGameRequest;
import com.ocado.library.dto.request.CreateBookRequest;
import com.ocado.library.dto.request.CreatePSGameRequest;
import com.ocado.library.dto.request.MigrationDescriptionRequest;
import com.ocado.library.dto.request.MigrationInstanceRequest;
import com.ocado.library.dto.response.CatalogImportRowResult;
import com.ocado.library.model.Description;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.model.enums.ItemType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class CatalogImportRowService {

    static final Pattern BOOK_INTERNAL_ID = Pattern.compile("^OC-WRO-B-[A-Z0-9]+$");
    static final Pattern BOARD_GAME_INTERNAL_ID = Pattern.compile("^OC-WRO-G-[A-Z0-9]+$");
    static final Pattern PS_GAME_INTERNAL_ID = Pattern.compile("^OC-WRO-PS-[A-Z0-9]+$");

    private static final Set<ItemStatus> ALLOWED_IMPORT_STATUSES = Set.of(
            ItemStatus.AVAILABLE,
            ItemStatus.BORROWED
    );

    private final AdminService adminService;

    public CatalogImportRowService(AdminService adminService) {
        this.adminService = adminService;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CatalogImportRowResult importRow(int rowIndex, MigrationDescriptionRequest entry, String userEmail) {
        ItemType type = entry.type();
        List<String> rowErrors = validateRow(rowIndex, entry);
        if (!rowErrors.isEmpty()) {
            return new CatalogImportRowResult(rowIndex, type, "FAILED", null, 0, rowErrors);
        }

        try {
            Description description = adminService.createDescription(
                    type,
                    toCreateRequest(entry),
                    userEmail
            );

            int instancesCreated = 0;
            for (MigrationInstanceRequest instance : entry.instances()) {
                ItemStatus status = instance.status() != null ? instance.status() : ItemStatus.AVAILABLE;
                adminService.addPhysicalCopy(
                        new AdminCreateItemRequest(
                                instance.internalId().trim().toUpperCase(),
                                description.getId(),
                                status
                        ),
                        userEmail
                );
                instancesCreated++;
            }

            return new CatalogImportRowResult(
                    rowIndex,
                    type,
                    "IMPORTED",
                    description.getId(),
                    instancesCreated,
                    List.of()
            );
        } catch (RuntimeException ex) {
            return new CatalogImportRowResult(
                    rowIndex,
                    type,
                    "FAILED",
                    null,
                    0,
                    List.of(ex.getMessage() != null ? ex.getMessage() : "Import failed")
            );
        }
    }

    static List<String> validateRow(int rowIndex, MigrationDescriptionRequest entry) {
        List<String> errors = new ArrayList<>();
        String prefix = "Row " + rowIndex;

        if (entry.type() == null) {
            errors.add(prefix + ": type is required (Book, BoardGame, or PSGame)");
            return errors;
        }

        if (entry.title() == null || entry.title().trim().isEmpty()) {
            errors.add(prefix + ": title is required and must be non-empty");
        }

        switch (entry.type()) {
            case Book -> {
                if (entry.author() == null) {
                    errors.add(prefix + ": author is required for Book (use empty string for unknown authors)");
                }
            }
            case BoardGame -> {
                if (entry.numberOfPlayers() != null && entry.numberOfPlayers() < 1) {
                    errors.add(prefix + ": numberOfPlayers must be a positive integer when provided");
                }
            }
            case PSGame -> {
                if (entry.instances() != null && entry.instances().size() > 1) {
                    errors.add(prefix + ": PSGame can have at most one physical instance");
                }
            }
        }

        if (entry.instances() == null) {
            errors.add(prefix + ": instances must be an array");
            return errors;
        }

        Set<String> rowInternalIds = new HashSet<>();
        for (int j = 0; j < entry.instances().size(); j++) {
            MigrationInstanceRequest instance = entry.instances().get(j);
            String instancePrefix = prefix + ", instances[" + j + "]";

            if (instance == null) {
                errors.add(instancePrefix + ": must be an object");
                continue;
            }
            if (instance.internalId() == null || instance.internalId().trim().isEmpty()) {
                errors.add(instancePrefix + ".internalId: required");
                continue;
            }

            String normalizedId = instance.internalId().trim().toUpperCase();
            if (!matchesInternalIdFormat(entry.type(), normalizedId)) {
                errors.add(instancePrefix + ".internalId: " + internalIdHint(entry.type()));
            }
            if (!rowInternalIds.add(normalizedId)) {
                errors.add(instancePrefix + ".internalId: duplicate within the same description");
            }

            if (instance.status() == null) {
                errors.add(instancePrefix + ".status: required (AVAILABLE or BORROWED)");
            } else if (!ALLOWED_IMPORT_STATUSES.contains(instance.status())) {
                errors.add(instancePrefix + ".status: must be AVAILABLE or BORROWED");
            }
        }

        return errors;
    }

    private static Object toCreateRequest(MigrationDescriptionRequest entry) {
        return switch (entry.type()) {
            case Book -> new CreateBookRequest(
                    entry.title().trim(),
                    entry.author() != null ? entry.author() : "",
                    entry.isbn() != null ? entry.isbn() : "",
                    entry.description() != null ? entry.description() : "",
                    entry.image() != null ? entry.image() : "",
                    entry.tags() != null ? entry.tags() : List.of()
            );
            case BoardGame -> new CreateBoardGameRequest(
                    entry.title().trim(),
                    entry.description() != null ? entry.description() : "",
                    entry.numberOfPlayers(),
                    entry.tags() != null ? entry.tags() : List.of()
            );
            case PSGame -> new CreatePSGameRequest(
                    entry.title().trim(),
                    entry.description() != null ? entry.description() : "",
                    entry.tags() != null ? entry.tags() : List.of()
            );
        };
    }

    private static boolean matchesInternalIdFormat(ItemType type, String internalId) {
        return switch (type) {
            case Book -> BOOK_INTERNAL_ID.matcher(internalId).matches();
            case BoardGame -> BOARD_GAME_INTERNAL_ID.matcher(internalId).matches();
            case PSGame -> PS_GAME_INTERNAL_ID.matcher(internalId).matches();
        };
    }

    private static String internalIdHint(ItemType type) {
        return switch (type) {
            case Book -> "must match OC-WRO-B-<ID> (e.g. OC-WRO-B-0109)";
            case BoardGame -> "must match OC-WRO-G-<ID> (e.g. OC-WRO-G-0101)";
            case PSGame -> "must match OC-WRO-PS-<ID> (e.g. OC-WRO-PS-0001)";
        };
    }
}
