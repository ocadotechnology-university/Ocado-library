package pl.ocado.library.backend.Service;

import pl.ocado.library.backend.Security.HardcodedApiUser;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Fasada API magazynu — deleguje do wyspecjalizowanych serwisów (katalog, egzemplarze, admin).
 */
public interface InventoryApplicationService {

    List<Map<String, Object>> listDescriptionsAll(
            String typePath,
            String search,
            String category,
            Boolean showArchived,
            HardcodedApiUser principal);

    Map<String, Object> getDescription(String typePath, int descriptionId, HardcodedApiUser principal);

    List<Map<String, Object>> listItems(int descriptionId, String typeQuery, String statusFilter);

    void borrow(String internalId, HardcodedApiUser principal);

    void returnItem(String internalId, HardcodedApiUser principal);

    Map<String, Object> adminCreateItem(Map<String, Object> body, HardcodedApiUser principal);

    Map<String, Object> adminGetItem(String internalId, HardcodedApiUser principal);

    Map<String, Object> adminPatchItemStatus(String internalId, Map<String, Object> body, HardcodedApiUser principal);

    Map<String, Object> createDescription(String typePath, Map<String, Object> body, HardcodedApiUser principal);

    void updateDescription(String typePath, int descriptionId, Map<String, Object> body, HardcodedApiUser principal);

    void archiveDescription(String typePath, int descriptionId, HardcodedApiUser principal);

    List<Map<String, Object>> adminJournal(
            LocalDate from,
            LocalDate to,
            String user,
            String type,
            Integer descriptionId,
            String internalId,
            HardcodedApiUser principal);

    Map<String, Object> reminderStub(String internalId, HardcodedApiUser principal);
}
