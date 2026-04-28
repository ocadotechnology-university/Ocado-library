package pl.ocado.library.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.ocado.library.backend.domain.entities.BookWaitlistEntry;

import java.util.List;

public interface BookWaitlistRepository extends JpaRepository<BookWaitlistEntry, Integer> {

    List<BookWaitlistEntry> findByBookDescriptionIdOrderByJoinedQueueAtAsc(int bookDescriptionId);

    List<BookWaitlistEntry> findByWaiterName(String waiterName);
}
