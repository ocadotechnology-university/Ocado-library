package com.ocado.library.notification;

import com.ocado.library.model.BoardGameDescription;
import com.ocado.library.model.BookDescription;
import com.ocado.library.model.Item;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.model.enums.ItemType;
import com.ocado.library.repository.ItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OverdueDetectionServiceTest {

    @Mock
    private ItemRepository itemRepository;

    private NotificationProperties properties;
    private OverdueDetectionService overdueDetectionService;

    @BeforeEach
    void setUp() {
        properties = new NotificationProperties();
        properties.getLoanLimitsDays().setBook(120);
        properties.getLoanLimitsDays().setBoardGame(240);
        overdueDetectionService = new OverdueDetectionService(itemRepository, properties);
    }

    @Test
    void bookNotOverdueAt119Days() {
        Item item = borrowedBook(LocalDateTime.now().minusDays(119));
        when(itemRepository.findByStatus(ItemStatus.BORROWED)).thenReturn(List.of(item));

        assertTrue(overdueDetectionService.findOverdueItems().isEmpty());
    }

    @Test
    void bookOverdueAt121Days() {
        Item item = borrowedBook(LocalDateTime.now().minusDays(121));
        when(itemRepository.findByStatus(ItemStatus.BORROWED)).thenReturn(List.of(item));

        assertEquals(List.of(item), overdueDetectionService.findOverdueItems());
    }

    @Test
    void boardGameOverdueAt241Days() {
        Item item = borrowedBoardGame(LocalDateTime.now().minusDays(241));
        when(itemRepository.findByStatus(ItemStatus.BORROWED)).thenReturn(List.of(item));

        assertEquals(List.of(item), overdueDetectionService.findOverdueItems());
    }

    @Test
    void skipsItemsWithoutBorrowedAt() {
        Item item = borrowedBook(null);
        when(itemRepository.findByStatus(ItemStatus.BORROWED)).thenReturn(List.of(item));

        assertTrue(overdueDetectionService.findOverdueItems().isEmpty());
    }

    private static Item borrowedBook(LocalDateTime borrowedAt) {
        BookDescription description = new BookDescription();
        description.setType(ItemType.Book);
        description.setTitle("Clean Code");

        Item item = new Item();
        item.setInternalId("OC-B-001");
        item.setStatus(ItemStatus.BORROWED);
        item.setBorrower("user@example.com");
        item.setBorrowedAt(borrowedAt);
        item.setDescription(description);
        return item;
    }

    private static Item borrowedBoardGame(LocalDateTime borrowedAt) {
        BoardGameDescription description = new BoardGameDescription();
        description.setType(ItemType.BoardGame);
        description.setTitle("Catan");

        Item item = new Item();
        item.setInternalId("OC-G-001");
        item.setStatus(ItemStatus.BORROWED);
        item.setBorrower("user@example.com");
        item.setBorrowedAt(borrowedAt);
        item.setDescription(description);
        return item;
    }
}
