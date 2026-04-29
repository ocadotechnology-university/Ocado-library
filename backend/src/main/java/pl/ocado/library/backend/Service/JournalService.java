package pl.ocado.library.backend.Service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.ocado.library.backend.Repository.JournalRepository;
import pl.ocado.library.backend.domain.entities.JournalEntry;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class JournalService implements JournalInterface {

    private final JournalRepository journalRepository;

    public JournalService(JournalRepository journalRepository) {
        this.journalRepository = journalRepository;
    }

    @Override
    public List<JournalEntry> getAllEntries() {
        return journalRepository.findAll();
    }

    @Override
    public JournalEntry getEntryById(int id) {
        return journalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Journal entry not found by id: " + id));
    }

    @Override
    public List<JournalEntry> getEntriesByWhoDid(String whoDid) {
        return journalRepository.findByWhoDid(whoDid);
    }

    @Override
    public List<JournalEntry> getEntriesByDateRange(LocalDateTime from, LocalDateTime to) {
        return journalRepository.findByDateBetween(from, to);
    }

    @Override
    public void saveEntry(JournalEntry entry) {
        if (entry.getDate() == null) {
            entry.setDate(LocalDateTime.now());
        }
        journalRepository.save(entry);
    }

    @Override
    public void updateEntry(JournalEntry entry) {
        JournalEntry existingEntry = getEntryById(entry.getId());
        existingEntry.setWhoDid(entry.getWhoDid());
        existingEntry.setChangeDescription(entry.getChangeDescription());
        existingEntry.setDate(entry.getDate() != null ? entry.getDate() : existingEntry.getDate());
        journalRepository.save(existingEntry);
    }

    @Override
    public void deleteEntryById(int id) {
        journalRepository.deleteById(id);
    }
}
