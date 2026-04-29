package pl.ocado.library.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pl.ocado.library.backend.domain.entities.Book;

import java.util.List;
import java.time.LocalDate;

public interface BookRepository extends JpaRepository<Book, Integer> {

    List<Book> findByTitle(String title);
    List<Book> findByAuthor(String author);
    List<Book> findByCategory(String category);
    List<Book> findByEdition(String edition);
    List<Book> findByStatus(String status);
    List<Book> findByBorrower(String borrower);
    List<Book> findByBorrowingDate(LocalDate borrowingDate);
    
   
}
