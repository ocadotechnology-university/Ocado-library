package pl.ocado.library.backend.Service.support;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import pl.ocado.library.backend.Service.InventoryDomainConstants;
import pl.ocado.library.backend.domain.entities.BoardGameDescription;
import pl.ocado.library.backend.domain.entities.BookDescription;
import pl.ocado.library.backend.domain.entities.InventoryItem;
import pl.ocado.library.backend.domain.entities.JournalEntry;
import pl.ocado.library.backend.domain.entities.PsGameDescription;
import pl.ocado.library.backend.web.ApiError;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Component
public class InventoryDtoMapper {

    public String parseTypePath(String typePath) {
        if (typePath == null) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "type required");
        }
        return switch (typePath.trim()) {
            case "Book" -> InventoryDomainConstants.TYPE_BOOK;
            case "BoardGame" -> InventoryDomainConstants.TYPE_BOARD;
            case "PSGame" -> InventoryDomainConstants.TYPE_PS;
            default -> throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid type: " + typePath);
        };
    }

    public String parseTypeQueryOrBookDefault(String typeQuery) {
        if (typeQuery == null || typeQuery.isBlank()) {
            return InventoryDomainConstants.TYPE_BOOK;
        }
        return parseTypePath(typeQuery);
    }

    public String newInternalId(String type) {
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT);
        return switch (type) {
            case InventoryDomainConstants.TYPE_BOOK -> "OC-B-" + suffix;
            case InventoryDomainConstants.TYPE_BOARD -> "OC-G-" + suffix;
            case InventoryDomainConstants.TYPE_PS -> "OC-PS-" + suffix;
            default -> "OC-X-" + suffix;
        };
    }

    public String normalizeStatus(String raw) {
        if (raw == null) {
            return "IN_OFFICE";
        }
        String u = raw.trim().toUpperCase(Locale.ROOT);
        if (u.equals("AVAILABLE")) {
            return "IN_OFFICE";
        }
        return u;
    }

    public boolean isInOffice(String s) {
        String u = (s == null ? "" : s).trim().toUpperCase(Locale.ROOT);
        return u.equals("IN_OFFICE") || u.equals("AVAILABLE");
    }

    public boolean isBorrowed(String s) {
        return (s == null ? "" : s).trim().toUpperCase(Locale.ROOT).equals("BORROWED");
    }

    public boolean isArchived(String s) {
        return (s == null ? "" : s).trim().toUpperCase(Locale.ROOT).equals("ARCHIVED");
    }

    public String resolveDescriptionStatus(List<InventoryItem> items, String callerEmail) {
        boolean mine = items.stream().anyMatch(i -> callerEmail.equalsIgnoreCase(i.getBorrower()));
        if (mine) {
            return "BORROWED_BY_ME";
        }
        boolean anyOffice = items.stream().anyMatch(i -> isInOffice(i.getStatus()) && !isArchived(i.getStatus()));
        if (anyOffice) {
            return "AVAILABLE";
        }
        return "BORROWED";
    }

    public String firstInternalId(List<InventoryItem> items) {
        return items.stream()
                .min(Comparator.comparingInt(InventoryItem::getId))
                .map(InventoryItem::getInternalId)
                .orElse("");
    }

    public Map<String, Object> itemToSummary(InventoryItem it) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("internal_id", it.getInternalId());
        m.put("status", normalizeStatus(it.getStatus()));
        m.put("borrower", it.getBorrower());
        return m;
    }

    public Map<String, Object> itemDetail(InventoryItem it) {
        Map<String, Object> m = itemToSummary(it);
        m.put("description_id", it.getDescriptionId());
        m.put("type", it.getType());
        m.put("updated_at", LocalDateTime.now().toString());
        return m;
    }

    public Map<String, Object> bookToDto(BookDescription b, String callerEmail, List<InventoryItem> items) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", b.getId());
        m.put("internal_id", firstInternalId(items));
        m.put("type", InventoryDomainConstants.TYPE_BOOK);
        m.put("title", b.getTitle());
        m.put("author", b.getAuthor());
        m.put("description", b.getDescription());
        m.put("category", null);
        m.put("tags", List.of());
        m.put("description_status", resolveDescriptionStatus(items, callerEmail));
        return m;
    }

    public Map<String, Object> boardToDto(BoardGameDescription bg, String callerEmail, List<InventoryItem> items) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", bg.getId());
        m.put("internal_id", firstInternalId(items));
        m.put("type", InventoryDomainConstants.TYPE_BOARD);
        m.put("title", bg.getName());
        m.put("description", bg.getDescription());
        m.put("number_of_players", parseIntOrNull(bg.getNumberOfPlayers()));
        m.put("bgg_link", null);
        m.put("tags", List.of());
        m.put("description_status", resolveDescriptionStatus(items, callerEmail));
        return m;
    }

    public Map<String, Object> psToDto(PsGameDescription g, List<InventoryItem> items) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", g.getId());
        m.put("internal_id", firstInternalId(items));
        m.put("type", InventoryDomainConstants.TYPE_PS);
        m.put("title", g.getName());
        m.put("description", g.getDescription());
        m.put("tags", List.of());
        return m;
    }

    public Map<String, Object> journalToDto(JournalEntry j) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", j.getId());
        m.put("datetime", j.getDate() != null ? j.getDate().toString() : null);
        m.put("description", j.getDescription());
        m.put("user", j.getActor());
        return m;
    }

    public Integer parseIntOrNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        try {
            return Integer.parseInt(s.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public String requiredString(Map<String, Object> body, String key) {
        Object v = body.get(key);
        if (v == null || Objects.toString(v).isBlank()) {
            throw new ApiError(HttpStatus.BAD_REQUEST, key + " required");
        }
        return Objects.toString(v).trim();
    }

    public String optionalString(Map<String, Object> body, String key) {
        if (!body.containsKey(key)) {
            return null;
        }
        Object v = body.get(key);
        return v == null ? null : Objects.toString(v, null);
    }

    public int toInt(Object o) {
        if (o instanceof Number n) {
            return n.intValue();
        }
        return Integer.parseInt(Objects.toString(o, "0"));
    }
}
