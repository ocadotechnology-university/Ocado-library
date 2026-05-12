package pl.ocado.library.backend.Service;

import pl.ocado.library.backend.Security.HardcodedApiUser;

import java.util.List;
import java.util.Map;

public interface InventoryCatalogService {

    List<Map<String, Object>> listDescriptionsAll(
            String typePath,
            String search,
            String category,
            Boolean showArchived,
            HardcodedApiUser principal);

    Map<String, Object> getDescription(String typePath, int descriptionId, HardcodedApiUser principal);
}
