package pl.ocado.library.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pl.ocado.library.backend.domain.entities.PS5Game;
import java.time.LocalDate;
import java.util.List;

public interface PS5GameRepository extends JpaRepository<PS5Game, Integer> {

	List<PS5Game> findByName(String name);

	List<PS5Game> findByStatus(String status);
    List<PS5Game> findByBorrower(String borrower);
    List<PS5Game> findByBorrowingDate(LocalDate borrowingDate);
}
