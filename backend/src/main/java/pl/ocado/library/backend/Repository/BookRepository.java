package pl.ocado.library.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.ocado.library.backend.domain.entities.BookInventoryItem;

import java.time.LocalDate;
import java.util.List;

public interface BookRepository extends JpaRepository<BookInventoryItem, Integer> {

    List<BookInventoryItem> findByBookDescriptionIdIn(List<Integer> bookDescriptionIds);

    List<BookInventoryItem> findByStatus(String status);

    List<BookInventoryItem> findByBorrower(String borrower);

    List<BookInventoryItem> findByBorrowingDate(LocalDate borrowingDate);
}
