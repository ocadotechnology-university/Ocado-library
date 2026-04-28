package pl.ocado.library.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.ocado.library.backend.domain.entities.BookTag;
import pl.ocado.library.backend.domain.entities.BookTagId;

import java.util.List;

public interface BookTagRepository extends JpaRepository<BookTag, BookTagId> {

    List<BookTag> findByIdTagId(int tagId);

    List<BookTag> findByIdBookDescriptionId(int bookDescriptionId);
}
