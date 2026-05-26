package com.ocado.library.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ocado.library.model.Journal;
import com.ocado.library.model.enums.OperationType;

@Repository
public interface JournalRepository extends JpaRepository<Journal, Long> {
    List<Journal> findByDatetimeBetween(LocalDateTime from, LocalDateTime to);
    List<Journal> findByUser(String user);
    List<Journal> findByOperationType(OperationType operationType);
    List<Journal> findByItemId(String itemId);
    List<Journal> findByDescriptionId(Long descriptionId);
}
