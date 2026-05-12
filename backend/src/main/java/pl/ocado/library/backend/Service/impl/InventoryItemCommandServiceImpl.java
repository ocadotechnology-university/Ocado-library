package pl.ocado.library.backend.Service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.ocado.library.backend.Repository.InventoryItemRepository;
import pl.ocado.library.backend.Security.HardcodedApiUser;
import pl.ocado.library.backend.Service.InventoryItemCommandService;
import pl.ocado.library.backend.Service.JournalAuditService;
import pl.ocado.library.backend.Service.support.InventoryDtoMapper;
import pl.ocado.library.backend.domain.entities.InventoryItem;
import pl.ocado.library.backend.web.ApiError;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional
public class InventoryItemCommandServiceImpl implements InventoryItemCommandService {

    private final InventoryItemRepository inventoryItemRepository;
    private final JournalAuditService journalAuditService;
    private final InventoryDtoMapper mapper;

    public InventoryItemCommandServiceImpl(
            InventoryItemRepository inventoryItemRepository,
            JournalAuditService journalAuditService,
            InventoryDtoMapper mapper) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.journalAuditService = journalAuditService;
        this.mapper = mapper;
    }

    @Override
    public List<Map<String, Object>> listItems(int descriptionId, String typeQuery, String statusFilter) {
        String type = mapper.parseTypeQueryOrBookDefault(typeQuery);
        List<InventoryItem> list = inventoryItemRepository.findByDescriptionIdAndType(descriptionId, type);
        Stream<InventoryItem> s = list.stream();
        if (statusFilter != null && !statusFilter.isBlank()) {
            String want = statusFilter.trim().toUpperCase(Locale.ROOT);
            s = s.filter(it -> mapper.normalizeStatus(it.getStatus()).equals(want));
        }
        return s.map(mapper::itemToSummary).collect(Collectors.toList());
    }

    @Override
    public void borrow(String internalId, HardcodedApiUser principal) {
        if (inventoryItemRepository.findByInternalId(internalId).isEmpty()) {
            throw new ApiError(HttpStatus.NOT_FOUND, "Item not found");
        }
        int n = inventoryItemRepository.tryBorrow(internalId, principal.email());
        if (n == 0) {
            throw new ApiError(HttpStatus.CONFLICT, "Item not available");
        }
        journalAuditService.append(principal.email(), "Borrow item " + internalId + " by " + principal.email());
    }

    @Override
    public void returnItem(String internalId, HardcodedApiUser principal) {
        InventoryItem it =
                inventoryItemRepository
                        .findByInternalId(internalId)
                        .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Item not found"));
        if (!mapper.isBorrowed(it.getStatus())) {
            throw new ApiError(HttpStatus.CONFLICT, "Item is not borrowed");
        }
        if (!principal.admin() && (it.getBorrower() == null || !it.getBorrower().equalsIgnoreCase(principal.email()))) {
            throw new ApiError(HttpStatus.FORBIDDEN, "Not the borrower");
        }
        it.setStatus("IN_OFFICE");
        it.setBorrower(null);
        inventoryItemRepository.save(it);
        journalAuditService.append(principal.email(), "Return item " + internalId + " by " + principal.email());
    }
}
