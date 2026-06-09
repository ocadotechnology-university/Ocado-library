package com.ocado.library.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ocado.library.model.Journal;
import com.ocado.library.model.enums.OperationType;
import com.ocado.library.repository.JournalRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class JournalService {
    private final JournalRepository journalRepository;
    
    public JournalService(JournalRepository journalRepository) {
        this.journalRepository = journalRepository;
    }
    
    public void logAction(String description, String userEmail) {
        logAction(OperationType.UPDATE, userEmail, null, null, description);
    }

    public void logAction(OperationType operationType, String userEmail, String itemId, Long descriptionId) {
        String description = buildDescription(operationType, itemId, descriptionId);
        logAction(operationType, userEmail, itemId, descriptionId, description);
    }

    private void logAction(OperationType operationType, String userEmail, String itemId, Long descriptionId, String description) {
        Journal journal = new Journal();
        journal.setDatetime(LocalDateTime.now());
        journal.setOperationType(operationType);
        journal.setDescription(description);
        journal.setUser(userEmail);
        journal.setItemId(itemId);
        journal.setDescriptionId(descriptionId);
        Journal saved = journalRepository.save(journal);
        log.info("Journal entry saved (id={}): {} | {} by {}",
                saved.getId(), operationType, description, userEmail);
    }
    
    public List<Journal> getEntries(
            LocalDateTime from,
            LocalDateTime to,
            String user,
            OperationType operationType,
            Long descriptionId,
            String itemId) {
        return journalRepository.findAll().stream()
                .filter(j -> from == null || !j.getDatetime().isBefore(from))
                .filter(j -> to == null || !j.getDatetime().isAfter(to))
                .filter(j -> user == null || user.equals(j.getUser()))
                .filter(j -> operationType == null || operationType == j.getOperationType())
                .filter(j -> descriptionId == null || descriptionId.equals(j.getDescriptionId()))
                .filter(j -> itemId == null || itemId.equals(j.getItemId()))
                .toList();
    }

    public List<Journal> getEntries(LocalDateTime from, LocalDateTime to, String user) {
        return getEntries(from, to, user, null, null, null);
    }

    private String buildDescription(OperationType operationType, String itemId, Long descriptionId) {
        return switch (operationType) {
            case ADD -> itemId != null
                    ? "Create physical copy " + itemId
                    : "Create description " + descriptionId;
            case BORROW -> "Borrow item " + itemId;
            case RETURN -> "Return item " + itemId;
            case UPDATE -> "Update item " + itemId;
            case DELETE -> "Delete item " + itemId;
        };
    }
}
