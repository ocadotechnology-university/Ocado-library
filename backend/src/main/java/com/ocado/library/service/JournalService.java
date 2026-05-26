package com.ocado.library.service;

import com.ocado.library.model.Journal;
import com.ocado.library.repository.JournalRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JournalService {
    private final JournalRepository journalRepository;
    
    public JournalService(JournalRepository journalRepository) {
        this.journalRepository = journalRepository;
    }
    
    public void logAction(String description, String userEmail) {
        Journal journal = new Journal();
        journal.setDatetime(LocalDateTime.now());
        journal.setDescription(description);
        journal.setUser(userEmail);
        journalRepository.save(journal);
    }
    
    public List<Journal> getEntries(LocalDateTime from, LocalDateTime to, String user) {
        // Simple mock implementation for fetching journal entries
        if (from != null && to != null) {
            return journalRepository.findByDatetimeBetween(from, to);
        } else if (user != null) {
            return journalRepository.findByUser(user);
        }
        return journalRepository.findAll();
    }
}
