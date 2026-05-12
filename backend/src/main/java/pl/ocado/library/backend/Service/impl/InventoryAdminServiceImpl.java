package pl.ocado.library.backend.Service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.ocado.library.backend.Repository.BoardGameDescriptionRepository;
import pl.ocado.library.backend.Repository.BookDescriptionRepository;
import pl.ocado.library.backend.Repository.InventoryItemRepository;
import pl.ocado.library.backend.Repository.PsGameDescriptionRepository;
import pl.ocado.library.backend.Security.HardcodedApiUser;
import pl.ocado.library.backend.Service.InventoryAdminService;
import pl.ocado.library.backend.Service.InventoryDomainConstants;
import pl.ocado.library.backend.Service.JournalAuditService;
import pl.ocado.library.backend.Service.support.InventoryDtoMapper;
import pl.ocado.library.backend.domain.entities.BoardGameDescription;
import pl.ocado.library.backend.domain.entities.BookDescription;
import pl.ocado.library.backend.domain.entities.InventoryItem;
import pl.ocado.library.backend.domain.entities.PsGameDescription;
import pl.ocado.library.backend.web.ApiError;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
@Transactional
public class InventoryAdminServiceImpl implements InventoryAdminService {

    private final BookDescriptionRepository bookDescriptionRepository;
    private final BoardGameDescriptionRepository boardGameDescriptionRepository;
    private final PsGameDescriptionRepository psGameDescriptionRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final JournalAuditService journalAuditService;
    private final InventoryDtoMapper mapper;

    public InventoryAdminServiceImpl(
            BookDescriptionRepository bookDescriptionRepository,
            BoardGameDescriptionRepository boardGameDescriptionRepository,
            PsGameDescriptionRepository psGameDescriptionRepository,
            InventoryItemRepository inventoryItemRepository,
            JournalAuditService journalAuditService,
            InventoryDtoMapper mapper) {
        this.bookDescriptionRepository = bookDescriptionRepository;
        this.boardGameDescriptionRepository = boardGameDescriptionRepository;
        this.psGameDescriptionRepository = psGameDescriptionRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.journalAuditService = journalAuditService;
        this.mapper = mapper;
    }

    @Override
    public Map<String, Object> adminCreateItem(Map<String, Object> body, HardcodedApiUser principal) {
        requireAdmin(principal);
        String type = Objects.toString(body.get("type"), "");
        int descriptionId = mapper.toInt(body.get("description_id"));
        String status = Objects.toString(body.getOrDefault("status", "IN_OFFICE"), "IN_OFFICE");
        mapper.parseTypePath(type);
        verifyDescriptionExists(type, descriptionId);
        InventoryItem item = new InventoryItem();
        item.setInternalId(mapper.newInternalId(type));
        item.setType(type);
        item.setDescriptionId(descriptionId);
        item.setStatus(status);
        item.setBorrower(null);
        inventoryItemRepository.save(item);
        journalAuditService.append(principal.email(), "Admin add item " + item.getInternalId());
        return mapper.itemDetail(item);
    }

    @Override
    public Map<String, Object> adminGetItem(String internalId, HardcodedApiUser principal) {
        requireAdmin(principal);
        InventoryItem it =
                inventoryItemRepository
                        .findByInternalId(internalId)
                        .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Item not found"));
        return mapper.itemDetail(it);
    }

    @Override
    public Map<String, Object> adminPatchItemStatus(String internalId, Map<String, Object> body, HardcodedApiUser principal) {
        requireAdmin(principal);
        InventoryItem it =
                inventoryItemRepository
                        .findByInternalId(internalId)
                        .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Item not found"));
        String st = Objects.toString(body.get("status"), null);
        if (st == null) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "status required");
        }
        it.setStatus(st.trim().toUpperCase(Locale.ROOT));
        inventoryItemRepository.save(it);
        journalAuditService.append(principal.email(), "Admin set status " + internalId + " to " + it.getStatus());
        return mapper.itemDetail(it);
    }

    @Override
    public Map<String, Object> createDescription(String typePath, Map<String, Object> body, HardcodedApiUser principal) {
        requireAdmin(principal);
        String type = mapper.parseTypePath(typePath);
        return switch (type) {
            case InventoryDomainConstants.TYPE_BOOK -> createBook(body, principal.email());
            case InventoryDomainConstants.TYPE_BOARD -> createBoard(body, principal.email());
            case InventoryDomainConstants.TYPE_PS -> createPs(body, principal.email());
            default -> throw new ApiError(HttpStatus.BAD_REQUEST, "Unknown type");
        };
    }

    @Override
    public void updateDescription(String typePath, int descriptionId, Map<String, Object> body, HardcodedApiUser principal) {
        requireAdmin(principal);
        String type = mapper.parseTypePath(typePath);
        String status = mapper.optionalString(body, "status");
        switch (type) {
            case InventoryDomainConstants.TYPE_BOOK -> {
                BookDescription d =
                        bookDescriptionRepository
                                .findById(descriptionId)
                                .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Not found"));
                if (body.containsKey("title")) {
                    d.setTitle(Objects.toString(body.get("title"), d.getTitle()));
                }
                if (body.containsKey("author")) {
                    d.setAuthor(Objects.toString(body.get("author"), d.getAuthor()));
                }
                if (body.containsKey("description")) {
                    d.setDescription(Objects.toString(body.get("description"), d.getDescription()));
                }
                if (body.containsKey("image")) {
                    d.setImage(Objects.toString(body.get("image"), d.getImage()));
                }
                bookDescriptionRepository.save(d);
                if (status != null) {
                    inventoryItemRepository.updateAllStatusForDescription(
                            descriptionId, InventoryDomainConstants.TYPE_BOOK, status.trim().toUpperCase(Locale.ROOT));
                }
            }
            case InventoryDomainConstants.TYPE_BOARD -> {
                BoardGameDescription d =
                        boardGameDescriptionRepository
                                .findById(descriptionId)
                                .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Not found"));
                if (body.containsKey("title")) {
                    d.setName(Objects.toString(body.get("title"), d.getName()));
                }
                if (body.containsKey("description")) {
                    d.setDescription(Objects.toString(body.get("description"), d.getDescription()));
                }
                if (body.containsKey("number_of_players")) {
                    Object n = body.get("number_of_players");
                    d.setNumberOfPlayers(n == null ? null : Objects.toString(n, null));
                }
                boardGameDescriptionRepository.save(d);
                if (status != null) {
                    inventoryItemRepository.updateAllStatusForDescription(
                            descriptionId, InventoryDomainConstants.TYPE_BOARD, status.trim().toUpperCase(Locale.ROOT));
                }
            }
            case InventoryDomainConstants.TYPE_PS -> {
                PsGameDescription d =
                        psGameDescriptionRepository
                                .findById(descriptionId)
                                .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Not found"));
                if (body.containsKey("title")) {
                    d.setName(Objects.toString(body.get("title"), d.getName()));
                }
                if (body.containsKey("description")) {
                    d.setDescription(Objects.toString(body.get("description"), d.getDescription()));
                }
                psGameDescriptionRepository.save(d);
                if (status != null) {
                    inventoryItemRepository.updateAllStatusForDescription(
                            descriptionId, InventoryDomainConstants.TYPE_PS, status.trim().toUpperCase(Locale.ROOT));
                }
            }
            default -> throw new ApiError(HttpStatus.BAD_REQUEST, "Unknown type");
        }
        journalAuditService.append(principal.email(), "Edit description " + type + " id=" + descriptionId);
    }

    @Override
    public void archiveDescription(String typePath, int descriptionId, HardcodedApiUser principal) {
        requireAdmin(principal);
        String type = mapper.parseTypePath(typePath);
        verifyDescriptionExists(type, descriptionId);
        inventoryItemRepository.updateAllStatusForDescription(descriptionId, type, "ARCHIVED");
        journalAuditService.append(principal.email(), "Archive " + type + " description id=" + descriptionId);
    }

    @Override
    public List<Map<String, Object>> adminJournal(
            LocalDate from,
            LocalDate to,
            String user,
            String type,
            Integer descriptionId,
            String internalId,
            HardcodedApiUser principal) {
        requireAdmin(principal);
        return journalAuditService.listAdminJournal(from, to, user, type, descriptionId, internalId);
    }

    @Override
    public Map<String, Object> reminderStub(String internalId, HardcodedApiUser principal) {
        requireAdmin(principal);
        InventoryItem it =
                inventoryItemRepository
                        .findByInternalId(internalId)
                        .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Item not found"));
        if (!mapper.isBorrowed(it.getStatus()) || it.getBorrower() == null || it.getBorrower().isBlank()) {
            throw new ApiError(HttpStatus.CONFLICT, "Item is not borrowed");
        }
        return java.util.Map.of(
                "ok", true,
                "message",
                "Reminder queued (stub) for " + it.getBorrower());
    }

    private void requireAdmin(HardcodedApiUser p) {
        if (!p.admin()) {
            throw new ApiError(HttpStatus.FORBIDDEN, "Admin only");
        }
    }

    private void verifyDescriptionExists(String type, int id) {
        switch (type) {
            case InventoryDomainConstants.TYPE_BOOK ->
                    bookDescriptionRepository.findById(id).orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Not found"));
            case InventoryDomainConstants.TYPE_BOARD ->
                    boardGameDescriptionRepository
                            .findById(id)
                            .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Not found"));
            case InventoryDomainConstants.TYPE_PS ->
                    psGameDescriptionRepository.findById(id).orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Not found"));
            default -> throw new ApiError(HttpStatus.BAD_REQUEST, "Unknown type");
        }
    }

    private Map<String, Object> createBook(Map<String, Object> body, String adminEmail) {
        String title = mapper.requiredString(body, "title");
        String author = mapper.requiredString(body, "author");
        BookDescription d = new BookDescription();
        d.setTitle(title);
        d.setAuthor(author);
        d.setDescription(mapper.optionalString(body, "description"));
        d.setImage(mapper.optionalString(body, "image"));
        d = bookDescriptionRepository.save(d);
        InventoryItem it = new InventoryItem();
        it.setInternalId(mapper.newInternalId(InventoryDomainConstants.TYPE_BOOK));
        it.setType(InventoryDomainConstants.TYPE_BOOK);
        it.setDescriptionId(d.getId());
        it.setStatus("IN_OFFICE");
        it.setBorrower(null);
        inventoryItemRepository.save(it);
        journalAuditService.append(adminEmail, "Create description " + it.getInternalId() + " by " + adminEmail);
        return mapper.bookToDto(
                d,
                adminEmail,
                inventoryItemRepository.findByDescriptionIdAndType(d.getId(), InventoryDomainConstants.TYPE_BOOK));
    }

    private Map<String, Object> createBoard(Map<String, Object> body, String adminEmail) {
        String title = mapper.requiredString(body, "title");
        BoardGameDescription d = new BoardGameDescription();
        d.setName(title);
        d.setDescription(mapper.optionalString(body, "description"));
        Object np = body.get("number_of_players");
        d.setNumberOfPlayers(np == null ? null : Objects.toString(np, null));
        d = boardGameDescriptionRepository.save(d);
        InventoryItem it = new InventoryItem();
        it.setInternalId(mapper.newInternalId(InventoryDomainConstants.TYPE_BOARD));
        it.setType(InventoryDomainConstants.TYPE_BOARD);
        it.setDescriptionId(d.getId());
        it.setStatus("IN_OFFICE");
        it.setBorrower(null);
        inventoryItemRepository.save(it);
        journalAuditService.append(adminEmail, "Create description " + it.getInternalId() + " by " + adminEmail);
        return mapper.boardToDto(
                d,
                adminEmail,
                inventoryItemRepository.findByDescriptionIdAndType(d.getId(), InventoryDomainConstants.TYPE_BOARD));
    }

    private Map<String, Object> createPs(Map<String, Object> body, String adminEmail) {
        String title = mapper.requiredString(body, "title");
        PsGameDescription d = new PsGameDescription();
        d.setName(title);
        d.setDescription(mapper.optionalString(body, "description"));
        d = psGameDescriptionRepository.save(d);
        InventoryItem it = new InventoryItem();
        it.setInternalId(mapper.newInternalId(InventoryDomainConstants.TYPE_PS));
        it.setType(InventoryDomainConstants.TYPE_PS);
        it.setDescriptionId(d.getId());
        it.setStatus("FOR_OFFICE_USE_ONLY");
        it.setBorrower(null);
        inventoryItemRepository.save(it);
        journalAuditService.append(adminEmail, "Create description " + it.getInternalId() + " by " + adminEmail);
        return mapper.psToDto(
                d, inventoryItemRepository.findByDescriptionIdAndType(d.getId(), InventoryDomainConstants.TYPE_PS));
    }
}
