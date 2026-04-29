package pl.ocado.library.backend.Service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pl.ocado.library.backend.Repository.BoardGameRepository;
import pl.ocado.library.backend.domain.entities.BoardGame;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BoardGameService implements BoardGameInterface {

	private final BoardGameRepository boardGameRepository;

	public BoardGameService(BoardGameRepository boardGameRepository) {
		this.boardGameRepository = boardGameRepository;
	}

	@Override
	public List<BoardGame> getAllBoardGames() {
		return boardGameRepository.findAll();
	}

	@Override
	public List<BoardGame> getBoardGamesByName(String name) {
		return boardGameRepository.findByName(name);
	}

	@Override
	public List<BoardGame> getBoardGamesByNumberOfPlayers(String numberOfPlayers) {
		return boardGameRepository.findByNumberOfPlayers(numberOfPlayers);
	}

	@Override
	public List<BoardGame> getBoardGamesByBorrower(String borrower) {
		return boardGameRepository.findByBorrower(borrower);
	}

	@Override
	public List<BoardGame> getBoardGamesByLinkBoardGameGeek(String linkBoardGameGeek) {
		return boardGameRepository.findByLinkBoardGameGeek(linkBoardGameGeek);
	}

	@Override
	public List<BoardGame> getBoardGamesByBorrowingDate(LocalDate borrowingDate) {
		return boardGameRepository.findByBorrowingDate(borrowingDate);
	}

	@Override
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

	@Override
	public void updateBoardGame(BoardGame boardGame) {
		BoardGame existingBoardGame = boardGameRepository
				.findById(boardGame.getId())
				.orElseThrow(() -> new RuntimeException("Board game not found by id: " + boardGame.getId()));
		existingBoardGame.setName(boardGame.getName());
		existingBoardGame.setLinkBoardGameGeek(boardGame.getLinkBoardGameGeek());
		existingBoardGame.setNumberOfPlayers(boardGame.getNumberOfPlayers());
		existingBoardGame.setBarcode(boardGame.getBarcode());
		existingBoardGame.setStatus(boardGame.getStatus());
		existingBoardGame.setBorrower(boardGame.getBorrower());
		existingBoardGame.setBorrowingDate(boardGame.getBorrowingDate());
		boardGameRepository.save(existingBoardGame);
	}

	@Override
	public void deleteBoardGameById(int id) {
		boardGameRepository.deleteById(id);
	}

	@Override
	public void saveBoardGame(BoardGame boardGame) {
		boardGameRepository.save(boardGame);
	}
}
