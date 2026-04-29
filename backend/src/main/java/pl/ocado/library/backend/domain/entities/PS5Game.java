package pl.ocado.library.backend.domain.entities;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "ps5_games")
public class PS5Game {

    @Id
    private int id;
    private String name;
    private String description;
    private String status;
    private String borrower;
    @Column(name = "borrowing_date")
    private LocalDate borrowingDate;
}
