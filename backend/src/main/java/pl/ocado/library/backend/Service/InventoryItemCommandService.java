package pl.ocado.library.backend.Service;

import pl.ocado.library.backend.Security.HardcodedApiUser;

import java.util.List;
import java.util.Map;

public interface InventoryItemCommandService {

    List<Map<String, Object>> listItems(int descriptionId, String typeQuery, String statusFilter);

    void borrow(String internalId, HardcodedApiUser principal);

    void returnItem(String internalId, HardcodedApiUser principal);
}
