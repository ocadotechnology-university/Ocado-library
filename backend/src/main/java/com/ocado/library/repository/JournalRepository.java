package com.ocado.library.repository;

import com.ocado.library.model.Journal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JournalRepository extends JpaRepository<Journal, Long> {
    List<Journal> findByDatetimeBetween(LocalDateTime from, LocalDateTime to);
    List<Journal> findByUser(String user);
}
