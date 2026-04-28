package pl.ocado.library.backend.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ocado.library.backend.Service.JournalService;
import pl.ocado.library.backend.domain.entities.JournalEntry;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/journal")
public class JournalController {

    private final JournalService journalService;

    public JournalController(JournalService journalService) {
        this.journalService = journalService;
    }

    @GetMapping
    public ResponseEntity<List<JournalEntry>> getAllEntries() {
        return ResponseEntity.ok(journalService.getAllEntries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JournalEntry> getEntryById(@PathVariable int id) {
        return ResponseEntity.ok(journalService.getEntryById(id));
    }

    @GetMapping("/search/who")
    public ResponseEntity<List<JournalEntry>> getEntriesByWhoDid(@RequestParam String whoDid) {
        return ResponseEntity.ok(journalService.getEntriesByWhoDid(whoDid));
    }

    @GetMapping("/search/date-range")
    public ResponseEntity<List<JournalEntry>> getEntriesByDateRange(
            @RequestParam LocalDateTime from,
            @RequestParam LocalDateTime to) {
        return ResponseEntity.ok(journalService.getEntriesByDateRange(from, to));
    }

    @PostMapping
    public ResponseEntity<Void> saveEntry(@RequestBody JournalEntry entry) {
        journalService.saveEntry(entry);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateEntry(@PathVariable int id, @RequestBody JournalEntry entry) {
        entry.setId(id);
        journalService.updateEntry(entry);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntryById(@PathVariable int id) {
        journalService.deleteEntryById(id);
        return ResponseEntity.noContent().build();
    }
}
