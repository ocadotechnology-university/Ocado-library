package pl.ocado.library.backend.Service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.ocado.library.backend.Security.HardcodedApiUser;
import pl.ocado.library.backend.Service.InventoryAdminService;
import pl.ocado.library.backend.Service.InventoryApplicationService;
import pl.ocado.library.backend.Service.InventoryCatalogService;
import pl.ocado.library.backend.Service.InventoryItemCommandService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class InventoryApplicationServiceImpl implements InventoryApplicationService {

    private final InventoryCatalogService catalogService;
    private final InventoryItemCommandService itemCommandService;
    private final InventoryAdminService adminService;

    public InventoryApplicationServiceImpl(
            InventoryCatalogService catalogService,
            InventoryItemCommandService itemCommandService,
            InventoryAdminService adminService) {
        this.catalogService = catalogService;
        this.itemCommandService = itemCommandService;
        this.adminService = adminService;
    }

    @Override
    public List<Map<String, Object>> listDescriptionsAll(
            String typePath,
            String search,
            String category,
            Boolean showArchived,
            HardcodedApiUser principal) {
        return catalogService.listDescriptionsAll(typePath, search, category, showArchived, principal);
    }

    @Override
    public Map<String, Object> getDescription(String typePath, int descriptionId, HardcodedApiUser principal) {
        return catalogService.getDescription(typePath, descriptionId, principal);
    }

    @Override
    public List<Map<String, Object>> listItems(int descriptionId, String typeQuery, String statusFilter) {
        return itemCommandService.listItems(descriptionId, typeQuery, statusFilter);
    }

    @Override
    public void borrow(String internalId, HardcodedApiUser principal) {
        itemCommandService.borrow(internalId, principal);
    }

    @Override
    public void returnItem(String internalId, HardcodedApiUser principal) {
        itemCommandService.returnItem(internalId, principal);
    }

    @Override
    public Map<String, Object> adminCreateItem(Map<String, Object> body, HardcodedApiUser principal) {
        return adminService.adminCreateItem(body, principal);
    }

    @Override
    public Map<String, Object> adminGetItem(String internalId, HardcodedApiUser principal) {
        return adminService.adminGetItem(internalId, principal);
    }

    @Override
    public Map<String, Object> adminPatchItemStatus(String internalId, Map<String, Object> body, HardcodedApiUser principal) {
        return adminService.adminPatchItemStatus(internalId, body, principal);
    }

    @Override
    public Map<String, Object> createDescription(String typePath, Map<String, Object> body, HardcodedApiUser principal) {
        return adminService.createDescription(typePath, body, principal);
    }

    @Override
    public void updateDescription(String typePath, int descriptionId, Map<String, Object> body, HardcodedApiUser principal) {
        adminService.updateDescription(typePath, descriptionId, body, principal);
    }

    @Override
    public void archiveDescription(String typePath, int descriptionId, HardcodedApiUser principal) {
        adminService.archiveDescription(typePath, descriptionId, principal);
    }

    @Override
    public List<Map<String, Object>> adminJournal(
            LocalDate from,
            LocalDate to,
            String user,
            String type,
            Integer descriptionId,
            String internalId,
            HardcodedApiUser principal) {
        return adminService.adminJournal(from, to, user, type, descriptionId, internalId, principal);
    }

    @Override
    public Map<String, Object> reminderStub(String internalId, HardcodedApiUser principal) {
        return adminService.reminderStub(internalId, principal);
    }
}
