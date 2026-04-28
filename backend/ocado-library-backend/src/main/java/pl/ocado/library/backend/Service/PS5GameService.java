package pl.ocado.library.backend.Service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pl.ocado.library.backend.Repository.PS5GameRepository;
import pl.ocado.library.backend.domain.entities.PS5Game;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PS5GameService implements PS5GameInterface {

    private final PS5GameRepository ps5GameRepository;

    public PS5GameService(PS5GameRepository ps5GameRepository) {
        this.ps5GameRepository = ps5GameRepository;
    }

    @Override
    public List<PS5Game> getAllPS5Games() {
        return ps5GameRepository.findAll();
    }
    
    @Override
    public List<PS5Game> getPS5GamesByName(String name) {
        return ps5GameRepository.findByName(name);
    }

    @Override
    public List<PS5Game> getPS5GamesByStatus(String status) {
        return ps5GameRepository.findByStatus(status);
    }

    @Override
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

    @Override
    public void savePS5Game(PS5Game ps5Game) {
        ps5GameRepository.save(ps5Game);
    }

    @Override
    public void updatePS5Game(PS5Game ps5Game) {
        PS5Game existingPS5Game = getPS5GameById(ps5Game.getId());
        if (existingPS5Game == null) {
            throw new RuntimeException("PS5 game not found by id: " + ps5Game.getId());
        }
        existingPS5Game.setName(ps5Game.getName());
        existingPS5Game.setStatus(ps5Game.getStatus());
        ps5GameRepository.save(existingPS5Game);
    }

    @Override
    public void deletePS5GameById(int id) {
        ps5GameRepository.deleteById(id);
    }
}
