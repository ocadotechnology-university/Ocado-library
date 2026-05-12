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

import java.time.LocalDateTime;

/**
 * Tabela {@code journal}; kolumna {@code user} w PostgreSQL jest zarezerwowana — mapowanie przez cytowanie.
 * W JSON API pole nadal jako {@code user} (mapowanie w serwisie).
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "journal")
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "\"user\"")
    private String actor;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "date")
    private LocalDateTime date;
}
