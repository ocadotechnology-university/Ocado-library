package com.ocado.library.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "item_internal_id_sequence")
public class ItemInternalIdSequence {

    public static final long SINGLETON_ID = 1L;
    public static final int INITIAL_NEXT_NUMBER = 300;

    @Id
    private Long id = SINGLETON_ID;

    @Column(nullable = false)
    private int nextNumber = INITIAL_NEXT_NUMBER;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getNextNumber() { return nextNumber; }
    public void setNextNumber(int nextNumber) { this.nextNumber = nextNumber; }
}
