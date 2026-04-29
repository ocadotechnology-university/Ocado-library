package pl.ocado.library.backend.Service;

import java.util.List;
import pl.ocado.library.backend.domain.entities.PS5Game;

public interface PS5GameInterface {
    public List<PS5Game> getAllPS5Games();

    public List<PS5Game> getPS5GamesByName(String name);

    public List<PS5Game> getPS5GamesByStatus(String status);

    public PS5Game getPS5GameById(int id);

    public void savePS5Game(PS5Game ps5Game);

    public void updatePS5Game(PS5Game ps5Game);

    public void deletePS5GameById(int id);

}
