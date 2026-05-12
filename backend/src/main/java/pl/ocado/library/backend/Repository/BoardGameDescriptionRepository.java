package pl.ocado.library.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.ocado.library.backend.domain.entities.BoardGameDescription;

public interface BoardGameDescriptionRepository extends JpaRepository<BoardGameDescription, Integer> {}
