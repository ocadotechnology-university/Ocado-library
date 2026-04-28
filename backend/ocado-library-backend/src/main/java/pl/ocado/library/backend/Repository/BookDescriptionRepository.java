package pl.ocado.library.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.ocado.library.backend.domain.entities.BookDescription;

import java.util.List;

public interface BookDescriptionRepository extends JpaRepository<BookDescription, Integer> {

    List<BookDescription> findByTitle(String title);

    List<BookDescription> findByAuthor(String author);
}
