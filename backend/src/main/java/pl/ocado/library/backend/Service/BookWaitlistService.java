package pl.ocado.library.backend.Service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.ocado.library.backend.Repository.BookWaitlistRepository;
import pl.ocado.library.backend.domain.entities.BookWaitlistEntry;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class BookWaitlistService implements BookWaitlistInterface {

    private final BookWaitlistRepository bookWaitlistRepository;

    public BookWaitlistService(BookWaitlistRepository bookWaitlistRepository) {
        this.bookWaitlistRepository = bookWaitlistRepository;
    }
    @Override
    public List<BookWaitlistEntry> getAllEntries() {
        return bookWaitlistRepository.findAll();
    }

    @Override
    public BookWaitlistEntry getEntryById(int id) {
        return bookWaitlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Waitlist entry not found by id: " + id));
    }

    @Override
    public List<BookWaitlistEntry> getEntriesByBookDescriptionId(int bookDescriptionId) {
        return bookWaitlistRepository.findByBookDescriptionIdOrderByJoinedQueueAtAsc(bookDescriptionId);
    }

    @Override
    public List<BookWaitlistEntry> getEntriesByWaiterName(String waiterName) {
        return bookWaitlistRepository.findByWaiterName(waiterName);
    }

    @Override
    public void saveEntry(BookWaitlistEntry entry) {
        if (entry.getJoinedQueueAt() == null) {
            entry.setJoinedQueueAt(LocalDateTime.now());
        }
        bookWaitlistRepository.save(entry);
    }

    @Override
    public void updateEntry(BookWaitlistEntry entry) {
        BookWaitlistEntry existingEntry = getEntryById(entry.getId());
        existingEntry.setBookDescriptionId(entry.getBookDescriptionId());
        existingEntry.setWaiterName(entry.getWaiterName());
        existingEntry.setJoinedQueueAt(entry.getJoinedQueueAt() != null ? entry.getJoinedQueueAt() : existingEntry.getJoinedQueueAt());
        bookWaitlistRepository.save(existingEntry);
    }

    @Override
    public void deleteEntryById(int id) {
        bookWaitlistRepository.deleteById(id);
    }
}
