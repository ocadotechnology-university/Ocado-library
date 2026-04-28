package pl.ocado.library.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.ocado.library.backend.domain.entities.Tag;

import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Integer> {

    Optional<Tag> findByName(String name);
}
