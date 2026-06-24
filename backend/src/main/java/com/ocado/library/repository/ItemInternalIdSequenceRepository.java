package com.ocado.library.repository;

import com.ocado.library.model.ItemInternalIdSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ItemInternalIdSequenceRepository extends JpaRepository<ItemInternalIdSequence, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ItemInternalIdSequence s WHERE s.id = :id")
    Optional<ItemInternalIdSequence> findByIdForUpdate(long id);
}
