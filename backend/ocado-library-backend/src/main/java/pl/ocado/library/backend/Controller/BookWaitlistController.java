package pl.ocado.library.backend.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ocado.library.backend.Service.BookWaitlistService;
import pl.ocado.library.backend.domain.entities.BookWaitlistEntry;

import java.util.List;

@RestController
@RequestMapping("/api/book-waitlist")
public class BookWaitlistController {

    private final BookWaitlistService bookWaitlistService;

    public BookWaitlistController(BookWaitlistService bookWaitlistService) {
        this.bookWaitlistService = bookWaitlistService;
    }

    @GetMapping
    public ResponseEntity<List<BookWaitlistEntry>> getAllEntries() {
        return ResponseEntity.ok(bookWaitlistService.getAllEntries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookWaitlistEntry> getEntryById(@PathVariable int id) {
        return ResponseEntity.ok(bookWaitlistService.getEntryById(id));
    }

    @GetMapping("/search/book-description")
    public ResponseEntity<List<BookWaitlistEntry>> getEntriesByBookDescriptionId(@RequestParam int bookDescriptionId) {
        return ResponseEntity.ok(bookWaitlistService.getEntriesByBookDescriptionId(bookDescriptionId));
    }

    @GetMapping("/search/waiter")
    public ResponseEntity<List<BookWaitlistEntry>> getEntriesByWaiterName(@RequestParam String waiterName) {
        return ResponseEntity.ok(bookWaitlistService.getEntriesByWaiterName(waiterName));
    }

    @PostMapping
    public ResponseEntity<Void> saveEntry(@RequestBody BookWaitlistEntry entry) {
        bookWaitlistService.saveEntry(entry);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateEntry(@PathVariable int id, @RequestBody BookWaitlistEntry entry) {
        entry.setId(id);
        bookWaitlistService.updateEntry(entry);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntryById(@PathVariable int id) {
        bookWaitlistService.deleteEntryById(id);
        return ResponseEntity.noContent().build();
    }
}
