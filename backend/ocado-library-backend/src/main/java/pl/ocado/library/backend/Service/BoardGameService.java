package pl.ocado.library.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pl.ocado.library.backend.Repository.BoardGameRepository;
import pl.ocado.library.backend.domain.entities.BoardGame;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BoardGameService {

	@Autowired
	private BoardGameRepository boardGameRepository;

	public List<BoardGame> getAllBoardGames() {
		return boardGameRepository.findAll();
	}

	public List<BoardGame> getBoardGamesByName(String name) {
		return boardGameRepository.findByName(name);
	}

	public List<BoardGame> getBoardGamesByNumberOfPlayers(String numberOfPlayers) {
		return boardGameRepository.findByNumberOfPlayers(numberOfPlayers);
	}

	public List<BoardGame> getBoardGamesByBorrower(String borrower) {
		return boardGameRepository.findByBorrower(borrower);
	}

	public List<BoardGame> getBoardGamesByLinkBoardGameGeek(String linkBoardGameGeek) {
		return boardGameRepository.findByLinkBoardGameGeek(linkBoardGameGeek);
	}

	public List<BoardGame> getBoardGamesByBorrowingDate(LocalDate borrowingDate) {
		return boardGameRepository.findByBorrowingDate(borrowingDate);
	}

	public BoardGame getBoardGameById(int id) {
		Optional<BoardGame> result = boardGameRepository.findById(id);
        BoardGame boardgame = null;
        if (result.isPresent()) {
            boardgame = result.get();
        }
        else {
            throw new RuntimeException("Board game not found by id: " + id);
        }
        return boardgame;
	}

	public void updateBoardGame(BoardGame boardGame) {
		BoardGame existingBoardGame = boardGameRepository
				.findById(boardGame.getId())
				.orElseThrow(() -> new RuntimeException("Board game not found by id: " + boardGame.getId()));
		existingBoardGame.setName(boardGame.getName());
		existingBoardGame.setDescription(boardGame.getDescription());
		existingBoardGame.setLinkBoardGameGeek(boardGame.getLinkBoardGameGeek());
		existingBoardGame.setNumberOfPlayers(boardGame.getNumberOfPlayers());
		existingBoardGame.setBorrower(boardGame.getBorrower());
		existingBoardGame.setBorrowingDate(boardGame.getBorrowingDate());
		boardGameRepository.save(existingBoardGame);
	}

	public void deleteBoardGameById(int id) {
		boardGameRepository.deleteById(id);
	}

	public void saveBoardGame(BoardGame boardGame) {
		boardGameRepository.save(boardGame);
	}
}
