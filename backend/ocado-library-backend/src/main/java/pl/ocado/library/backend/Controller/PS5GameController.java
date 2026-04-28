package pl.ocado.library.backend.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pl.ocado.library.backend.Service.PS5GameService;
import pl.ocado.library.backend.domain.entities.PS5Game;

import java.util.List;

@RestController
@RequestMapping("/api/ps5-games")
public class PS5GameController {

    private final PS5GameService ps5GameService;

    public PS5GameController(PS5GameService ps5GameService) {
        this.ps5GameService = ps5GameService;
    }

    @GetMapping
    public ResponseEntity<List<PS5Game>> getAllPS5Games() {
        return ResponseEntity.ok(ps5GameService.getAllPS5Games());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PS5Game> getPS5GameById(@PathVariable int id) {
        return ResponseEntity.ok(ps5GameService.getPS5GameById(id));
    }

    @GetMapping("/search/name")
    public ResponseEntity<List<PS5Game>> getPS5GamesByName(@RequestParam String name) {
        return ResponseEntity.ok(ps5GameService.getPS5GamesByName(name));
    }

    @GetMapping("/search/status")
    public ResponseEntity<List<PS5Game>> getPS5GamesByStatus(@RequestParam String status) {
        return ResponseEntity.ok(ps5GameService.getPS5GamesByStatus(status));
    }

    @PostMapping
    public ResponseEntity<Void> savePS5Game(@RequestBody PS5Game ps5Game) {
        ps5GameService.savePS5Game(ps5Game);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePS5Game(@PathVariable int id, @RequestBody PS5Game ps5Game) {
        ps5Game.setId(id);
        ps5GameService.updatePS5Game(ps5Game);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePS5GameById(@PathVariable int id) {
        ps5GameService.deletePS5GameById(id);
        return ResponseEntity.noContent().build();
    }
}
