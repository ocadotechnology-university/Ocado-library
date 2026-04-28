package pl.ocado.library.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pl.ocado.library.backend.domain.entities.BoardGame;

import java.time.LocalDate;
import java.util.List;

public interface BoardGameRepository extends JpaRepository<BoardGame, Integer> {

	List<BoardGame> findByName(String name);

	List<BoardGame> findByNumberOfPlayers(String numberOfPlayers);

	List<BoardGame> findByBorrower(String borrower);

	List<BoardGame> findByLinkBoardGameGeek(String linkBoardGameGeek);

	List<BoardGame> findByBorrowingDate(LocalDate borrowingDate);

	/**
	 * Gry uznane za wypożyczone: ustawiony wypożyczający i data wypożyczenia.
	 * Zwraca pozycje, których {@code borrowingDate} jest w dniu {@code cutoffDate} lub wcześniej
	 * (np. {@code cutoffDate = LocalDate.now().minusDays(thresholdDays)} dla przypomnień).
	 */
	List<BoardGame> findByBorrowerIsNotNullAndBorrowingDateIsNotNullAndBorrowingDateLessThanEqual(
			LocalDate cutoffDate);
}
