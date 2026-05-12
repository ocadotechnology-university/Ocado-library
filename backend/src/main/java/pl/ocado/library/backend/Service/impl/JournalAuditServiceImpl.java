package pl.ocado.library.backend.Service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.ocado.library.backend.Repository.JournalRepository;
import pl.ocado.library.backend.Service.JournalAuditService;
import pl.ocado.library.backend.Service.support.InventoryDtoMapper;
import pl.ocado.library.backend.domain.entities.JournalEntry;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class JournalAuditServiceImpl implements JournalAuditService {

    private final JournalRepository journalRepository;
    private final InventoryDtoMapper dtoMapper;

    public JournalAuditServiceImpl(JournalRepository journalRepository, InventoryDtoMapper dtoMapper) {
        this.journalRepository = journalRepository;
        this.dtoMapper = dtoMapper;
    }

    @Override
    public void append(String actor, String message) {
        JournalEntry e = new JournalEntry();
        e.setActor(actor);
        e.setDescription(message);
        e.setDate(LocalDateTime.now());
        journalRepository.save(e);
    }

    @Override
    public List<Map<String, Object>> listAdminJournal(
            LocalDate from, LocalDate to, String user, String type, Integer descriptionId, String internalId) {
        LocalDateTime fromDt = from == null ? null : from.atStartOfDay();
        LocalDateTime toDt = to == null ? null : to.plusDays(1).atStartOfDay();
        List<JournalEntry> rows = journalRepository.findFiltered(user, fromDt, toDt);
        return rows.stream()
                .filter(j -> internalId == null || j.getDescription() != null && j.getDescription().contains(internalId))
                .filter(
                        j ->
                                descriptionId == null
                                        || j.getDescription() != null && j.getDescription().contains("id=" + descriptionId))
                .filter(j -> type == null || j.getDescription() != null && j.getDescription().contains(type))
                .map(dtoMapper::journalToDto)
                .collect(Collectors.toList());
    }
}
