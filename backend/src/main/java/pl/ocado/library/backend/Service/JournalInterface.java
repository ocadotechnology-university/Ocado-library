package pl.ocado.library.backend.Service;

import pl.ocado.library.backend.domain.entities.JournalEntry;

import java.time.LocalDateTime;
import java.util.List;

public interface JournalInterface {

    List<JournalEntry> getAllEntries();

    JournalEntry getEntryById(int id);

    List<JournalEntry> getEntriesByWhoDid(String whoDid);

    List<JournalEntry> getEntriesByDateRange(LocalDateTime from, LocalDateTime to);

    void saveEntry(JournalEntry entry);

    void updateEntry(JournalEntry entry);

    void deleteEntryById(int id);
}
