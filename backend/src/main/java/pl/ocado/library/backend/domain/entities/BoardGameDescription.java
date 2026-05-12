package pl.ocado.library.backend.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Zgodnie z {@code database/init.sql}: tabela {@code board_game_description}. */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "board_game_description")
public class BoardGameDescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false)
    private String name;

    @Column(name = "number_of_players", length = 50)
    private String numberOfPlayers;

    @Column(columnDefinition = "TEXT")
    private String description;
}
