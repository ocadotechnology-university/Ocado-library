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

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "board_games")
public class BoardGame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "barcode")
    private String barcode;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "link_board_game_geek")
    private String linkBoardGameGeek;

    @Column(name = "number_of_players")
    private String numberOfPlayers;

    @Column(name = "status")
    private String status;

    @Column(name = "borrower")
    private String borrower;

    @Column(name = "borrowing_date")
    private LocalDate borrowingDate;

}
