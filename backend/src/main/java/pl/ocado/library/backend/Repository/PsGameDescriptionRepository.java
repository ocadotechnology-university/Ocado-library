package pl.ocado.library.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.ocado.library.backend.domain.entities.PsGameDescription;

public interface PsGameDescriptionRepository extends JpaRepository<PsGameDescription, Integer> {}
