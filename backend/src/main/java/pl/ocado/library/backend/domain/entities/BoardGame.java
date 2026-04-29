package pl.ocado.library.backend.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "board_games")
public class BoardGame {

    @Id
    private int id;
    private String name;
    private String description;
    @Column(name = "link_board_game_geek")
    private String linkBoardGameGeek;
    @Column(name = "number_of_players")
    private String numberOfPlayers;
    private String borrower;
    @Column(name = "borrowing_date")
    private LocalDate borrowingDate;

}
