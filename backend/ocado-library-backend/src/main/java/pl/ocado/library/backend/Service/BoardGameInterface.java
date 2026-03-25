package pl.ocado.library.backend.Service;

import java.util.List;
import java.time.LocalDate;
import pl.ocado.library.backend.domain.entities.BoardGame;

public interface BoardGameInterface {
    List<BoardGame> getAllBoardGames();
    List<BoardGame> getBoardGamesByName(String name);
    List<BoardGame> getBoardGamesByNumberOfPlayers(String numberOfPlayers);
    List<BoardGame> getBoardGamesByBorrower(String borrower);
    List<BoardGame> getBoardGamesByLinkBoardGameGeek(String linkBoardGameGeek);
    List<BoardGame> getBoardGamesByBorrowingDate(LocalDate borrowingDate);
    public BoardGame getBoardGameById(int id);
    public void saveBoardGame(BoardGame boardGame);
    public void updateBoardGame(BoardGame boardGame);
    public void deleteBoardGameById(int id);
}
