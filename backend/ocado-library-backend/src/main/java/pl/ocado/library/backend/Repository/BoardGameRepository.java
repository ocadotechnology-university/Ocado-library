package pl.ocado.library.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import pl.ocado.library.backend.domain.entities.BoardGame;
import java.util.List;
public interface BoardGameRepository extends JpaRepository<BoardGame, Integer> {
    List<BoardGame> findByName(String name);
    List<BoardGame> findByNumberOfPlayers(String numberOfPlayers);
    List<BoardGame> findByBorrower(String borrower);
    List<BoardGame> findByLinkBoardGameGeek(String linkBoardGameGeek);
    List<BoardGame> findByBorrowingDate(LocalDate borrowingDate);

}
