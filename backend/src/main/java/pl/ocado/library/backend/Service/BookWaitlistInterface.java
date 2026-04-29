package pl.ocado.library.backend.Service;

import pl.ocado.library.backend.domain.entities.BookWaitlistEntry;

import java.util.List;

public interface BookWaitlistInterface {

    List<BookWaitlistEntry> getAllEntries();

    BookWaitlistEntry getEntryById(int id);

    List<BookWaitlistEntry> getEntriesByBookDescriptionId(int bookDescriptionId);

    List<BookWaitlistEntry> getEntriesByWaiterName(String waiterName);

    void saveEntry(BookWaitlistEntry entry);

    void updateEntry(BookWaitlistEntry entry);

    void deleteEntryById(int id);
}
