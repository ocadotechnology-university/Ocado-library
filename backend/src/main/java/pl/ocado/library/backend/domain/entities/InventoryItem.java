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

/**
 * Fizyczny egzemplarz — tabela {@code items}; {@code type} + {@code description_id} wskazują na właściwą tabelę opisu.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "items")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "internal_id", nullable = false, unique = true, length = 64)
    private String internalId;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(name = "description_id", nullable = false)
    private int descriptionId;

    @Column(nullable = false, length = 50)
    private String status;

    private String borrower;
}
