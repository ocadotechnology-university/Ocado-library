package pl.ocado.library.backend.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface JournalAuditService {

    void append(String actor, String message);

    List<Map<String, Object>> listAdminJournal(
            LocalDate from,
            LocalDate to,
            String user,
            String type,
            Integer descriptionId,
            String internalId);
}
