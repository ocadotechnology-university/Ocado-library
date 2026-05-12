package pl.ocado.library.backend.Service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.ocado.library.backend.Repository.BoardGameDescriptionRepository;
import pl.ocado.library.backend.Repository.BookDescriptionRepository;
import pl.ocado.library.backend.Repository.InventoryItemRepository;
import pl.ocado.library.backend.Repository.PsGameDescriptionRepository;
import pl.ocado.library.backend.Security.HardcodedApiUser;
import pl.ocado.library.backend.Service.InventoryCatalogService;
import pl.ocado.library.backend.Service.InventoryDomainConstants;
import pl.ocado.library.backend.Service.support.InventoryDtoMapper;
import pl.ocado.library.backend.domain.entities.BoardGameDescription;
import pl.ocado.library.backend.domain.entities.BookDescription;
import pl.ocado.library.backend.domain.entities.InventoryItem;
import pl.ocado.library.backend.domain.entities.PsGameDescription;
import pl.ocado.library.backend.web.ApiError;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional(readOnly = true)
public class InventoryCatalogServiceImpl implements InventoryCatalogService {

    private final BookDescriptionRepository bookDescriptionRepository;
    private final BoardGameDescriptionRepository boardGameDescriptionRepository;
    private final PsGameDescriptionRepository psGameDescriptionRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryDtoMapper mapper;

    public InventoryCatalogServiceImpl(
            BookDescriptionRepository bookDescriptionRepository,
            BoardGameDescriptionRepository boardGameDescriptionRepository,
            PsGameDescriptionRepository psGameDescriptionRepository,
            InventoryItemRepository inventoryItemRepository,
            InventoryDtoMapper mapper) {
        this.bookDescriptionRepository = bookDescriptionRepository;
        this.boardGameDescriptionRepository = boardGameDescriptionRepository;
        this.psGameDescriptionRepository = psGameDescriptionRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Map<String, Object>> listDescriptionsAll(
            String typePath,
            String search,
            String category,
            Boolean showArchived,
            HardcodedApiUser principal) {
        boolean showArch = Boolean.TRUE.equals(showArchived);
        if (showArch && !principal.admin()) {
            throw new ApiError(HttpStatus.FORBIDDEN, "show_archived is admin-only");
        }
        String type = mapper.parseTypePath(typePath);
        return switch (type) {
            case InventoryDomainConstants.TYPE_BOOK -> listBooks(search, showArch, principal.email());
            case InventoryDomainConstants.TYPE_BOARD -> listBoardGames(search, showArch, principal.email());
            case InventoryDomainConstants.TYPE_PS -> listPsGames(search, showArch);
            default -> throw new ApiError(HttpStatus.BAD_REQUEST, "Unknown type: " + typePath);
        };
    }

    @Override
    public Map<String, Object> getDescription(String typePath, int descriptionId, HardcodedApiUser principal) {
        String type = mapper.parseTypePath(typePath);
        return switch (type) {
            case InventoryDomainConstants.TYPE_BOOK ->
                    mapper.bookToDto(
                            bookDescriptionRepository
                                    .findById(descriptionId)
                                    .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Book not found")),
                            principal.email(),
                            inventoryItemRepository.findByDescriptionIdAndType(
                                    descriptionId, InventoryDomainConstants.TYPE_BOOK));
            case InventoryDomainConstants.TYPE_BOARD ->
                    mapper.boardToDto(
                            boardGameDescriptionRepository
                                    .findById(descriptionId)
                                    .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Board game not found")),
                            principal.email(),
                            inventoryItemRepository.findByDescriptionIdAndType(
                                    descriptionId, InventoryDomainConstants.TYPE_BOARD));
            case InventoryDomainConstants.TYPE_PS ->
                    mapper.psToDto(
                            psGameDescriptionRepository
                                    .findById(descriptionId)
                                    .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "PS game not found")),
                            inventoryItemRepository.findByDescriptionIdAndType(
                                    descriptionId, InventoryDomainConstants.TYPE_PS));
            default -> throw new ApiError(HttpStatus.BAD_REQUEST, "Unknown type");
        };
    }

    private List<Map<String, Object>> listBooks(String search, boolean showArchived, String callerEmail) {
        List<BookDescription> all = bookDescriptionRepository.findAll();
        Stream<BookDescription> stream = all.stream();
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase(Locale.ROOT);
            stream =
                    stream.filter(
                            b ->
                                    (b.getTitle() != null && b.getTitle().toLowerCase(Locale.ROOT).contains(q))
                                            || (b.getAuthor() != null && b.getAuthor().toLowerCase(Locale.ROOT).contains(q)));
        }
        return stream
                .map(
                        b -> {
                            List<InventoryItem> items =
                                    inventoryItemRepository.findByDescriptionIdAndType(
                                            b.getId(), InventoryDomainConstants.TYPE_BOOK);
                            if (!showArchived && items.stream().allMatch(i -> mapper.isArchived(i.getStatus()))) {
                                return null;
                            }
                            return mapper.bookToDto(b, callerEmail, items);
                        })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> listBoardGames(String search, boolean showArchived, String callerEmail) {
        return boardGameDescriptionRepository.findAll().stream()
                .filter(
                        bg -> {
                            if (search == null || search.isBlank()) {
                                return true;
                            }
                            String q = search.toLowerCase(Locale.ROOT);
                            return bg.getName() != null && bg.getName().toLowerCase(Locale.ROOT).contains(q);
                        })
                .map(
                        bg -> {
                            List<InventoryItem> items =
                                    inventoryItemRepository.findByDescriptionIdAndType(
                                            bg.getId(), InventoryDomainConstants.TYPE_BOARD);
                            if (!showArchived && items.stream().allMatch(i -> mapper.isArchived(i.getStatus()))) {
                                return null;
                            }
                            return mapper.boardToDto(bg, callerEmail, items);
                        })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> listPsGames(String search, boolean showArchived) {
        return psGameDescriptionRepository.findAll().stream()
                .filter(
                        g -> {
                            if (search == null || search.isBlank()) {
                                return true;
                            }
                            String q = search.toLowerCase(Locale.ROOT);
                            return g.getName() != null && g.getName().toLowerCase(Locale.ROOT).contains(q);
                        })
                .map(
                        g -> {
                            List<InventoryItem> items =
                                    inventoryItemRepository.findByDescriptionIdAndType(
                                            g.getId(), InventoryDomainConstants.TYPE_PS);
                            if (!showArchived && items.stream().allMatch(i -> mapper.isArchived(i.getStatus()))) {
                                return null;
                            }
                            return mapper.psToDto(g, items);
                        })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
