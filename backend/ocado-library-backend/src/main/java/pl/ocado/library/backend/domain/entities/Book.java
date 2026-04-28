package pl.ocado.library.backend.domain.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Book {

    private int id;
    private String inventoryCode;
    private int bookDescriptionId;
    private String isbn;
    private String description;
    private String title;
    private String author;
    private String status;
    private String borrower;
    private String category;
    private LocalDate borrowingDate;
    private byte[] image;
}
