package pl.ocado.library.backend.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "books")
public class Book {

    @Id
    private int id;
    private String description;

    private String title;
    private String author;
    private String edition;
    private String status;
    private String borrower;
    private String category;

    @Column(name = "borrowing_date")
    private LocalDate borrowingDate;
}
