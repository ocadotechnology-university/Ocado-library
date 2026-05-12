package pl.ocado.library.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.ocado.library.backend.domain.entities.JournalEntry;

import java.time.LocalDateTime;
import java.util.List;

public interface JournalRepository extends JpaRepository<JournalEntry, Integer> {

    @Query(
            "SELECT j FROM JournalEntry j WHERE (:user IS NULL OR j.actor = :user) "
                    + "AND (:from IS NULL OR j.date >= :from) "
                    + "AND (:to IS NULL OR j.date < :to) "
                    + "ORDER BY j.date DESC")
    List<JournalEntry> findFiltered(
            @Param("user") String user,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
