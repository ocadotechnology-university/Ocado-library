package pl.ocado.library.backend.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "books")
public class BookInventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "inventory_code", nullable = false, unique = true)
    private String inventoryCode;

    @Column(name = "status")
    private String status;

    @ManyToOne(optional = false)
    @JoinColumn(name = "book_description_id", nullable = false)
    private BookDescription bookDescription;

    @Column(name = "book_description_id", insertable = false, updatable = false)
    private int bookDescriptionId;

    @Column(name = "borrower")
    private String borrower;

    @Column(name = "borrowing_date")
    private LocalDate borrowingDate;
}
