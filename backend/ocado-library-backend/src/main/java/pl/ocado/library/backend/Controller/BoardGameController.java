package pl.ocado.library.backend.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pl.ocado.library.backend.Service.BoardGameService;
import pl.ocado.library.backend.domain.entities.BoardGame;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/board-games")
public class BoardGameController {

    private final BoardGameService boardGameService;

    public BoardGameController(BoardGameService boardGameService) {
        this.boardGameService = boardGameService;
    }

    @GetMapping
    public ResponseEntity<List<BoardGame>> getAllBoardGames() {
        return ResponseEntity.ok(boardGameService.getAllBoardGames());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardGame> getBoardGameById(@PathVariable int id) {
        return ResponseEntity.ok(boardGameService.getBoardGameById(id));
    }

    @GetMapping("/search/name")
    public ResponseEntity<List<BoardGame>> getBoardGamesByName(@RequestParam String name) {
        return ResponseEntity.ok(boardGameService.getBoardGamesByName(name));
    }

    @GetMapping("/search/number-of-players")
    public ResponseEntity<List<BoardGame>> getBoardGamesByNumberOfPlayers(@RequestParam String numberOfPlayers) {
        return ResponseEntity.ok(boardGameService.getBoardGamesByNumberOfPlayers(numberOfPlayers));
    }

    @GetMapping("/search/borrower")
    public ResponseEntity<List<BoardGame>> getBoardGamesByBorrower(@RequestParam String borrower) {
        return ResponseEntity.ok(boardGameService.getBoardGamesByBorrower(borrower));
    }

    @GetMapping("/search/borrowing-date")
    public ResponseEntity<List<BoardGame>> getBoardGamesByBorrowingDate(@RequestParam LocalDate borrowingDate) {
        return ResponseEntity.ok(boardGameService.getBoardGamesByBorrowingDate(borrowingDate));
    }

    @PostMapping
    public ResponseEntity<Void> saveBoardGame(@RequestBody BoardGame boardGame) {
        boardGameService.saveBoardGame(boardGame);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateBoardGame(@PathVariable int id, @RequestBody BoardGame boardGame) {
        boardGame.setId(id);
        boardGameService.updateBoardGame(boardGame);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoardGameById(@PathVariable int id) {
        boardGameService.deleteBoardGameById(id);
        return ResponseEntity.noContent().build();
    }
}
