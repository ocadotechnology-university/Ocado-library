package com.ocado.library.controller;

import com.ocado.library.dto.response.JournalEntry;
import com.ocado.library.model.enums.OperationType;
import com.ocado.library.service.JournalService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/journal")
public class AdminJournalController {

    private final JournalService journalService;

    public AdminJournalController(JournalService journalService) {
        this.journalService = journalService;
    }

    @GetMapping
    public ResponseEntity<List<JournalEntry>> getJournalEntries(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) OperationType operationType,
            @RequestParam(required = false) Long descriptionId,
            @RequestParam(required = false) String internalId) {
            
        List<JournalEntry> entries = journalService.getEntries(
                from != null ? from.atStartOfDay() : null,
                to != null ? to.plusDays(1).atStartOfDay().minusNanos(1) : null,
                user,
                operationType,
                descriptionId,
                internalId
        ).stream()
                .map(j -> new JournalEntry(
                        j.getId(),
                        j.getDatetime(),
                        j.getOperationType(),
                        j.getUser(),
                        j.getItemId(),
                        j.getDescriptionId()))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(entries);
    }
}
