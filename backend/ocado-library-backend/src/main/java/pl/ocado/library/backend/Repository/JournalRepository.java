package pl.ocado.library.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.ocado.library.backend.domain.entities.JournalEntry;

import java.time.LocalDateTime;
import java.util.List;

public interface JournalRepository extends JpaRepository<JournalEntry, Integer> {

    List<JournalEntry> findByWhoDid(String whoDid);

    List<JournalEntry> findByDateBetween(LocalDateTime from, LocalDateTime to);
}
