package pl.ocado.library.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pl.ocado.library.backend.Repository.PS5GameRepository;
import pl.ocado.library.backend.domain.entities.PS5Game;

import jakarta.transaction.Transactional;
import java.util.List;
import java.time.LocalDate;
import java.util.Optional;

@Service
@Transactional
public class PS5GameService implements PS5GameInterface {

    @Autowired
    private PS5GameRepository ps5GameRepository;

    public List<PS5Game> getAllPS5Games() {
        return ps5GameRepository.findAll();
    }
    
    public List<PS5Game> getPS5GamesByName(String name) {
        return ps5GameRepository.findByName(name);
    }

    public List<PS5Game> getPS5GamesByStatus(String status) {
        return ps5GameRepository.findByStatus(status);
    }

    public PS5Game getPS5GameById(int id) {
        Optional<PS5Game> result = ps5GameRepository.findById(id);
        PS5Game ps5Game = null;
        if (result.isPresent()) {
            ps5Game = result.get();
        }
        else {
            throw new RuntimeException("PS5 game not found by id: " + id);
        }
        return ps5Game;

    }

    public void savePS5Game(PS5Game ps5Game) {
        ps5GameRepository.save(ps5Game);
    }

    public void updatePS5Game(PS5Game ps5Game) {
        PS5Game existingPS5Game = getPS5GameById(ps5Game.getId());
        if (existingPS5Game == null) {
            throw new RuntimeException("PS5 game not found by id: " + ps5Game.getId());
        }
        existingPS5Game.setName(ps5Game.getName());
        existingPS5Game.setStatus(ps5Game.getStatus());
        ps5GameRepository.save(existingPS5Game);
    }

    public void deletePS5GameById(int id) {
        ps5GameRepository.deleteById(id);
    }

}