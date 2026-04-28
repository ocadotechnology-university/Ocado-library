package pl.ocado.library.backend.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
public class BookTagId implements Serializable {

    @Column(name = "book_description_id")
    private int bookDescriptionId;

    @Column(name = "tag_id")
    private int tagId;
}
