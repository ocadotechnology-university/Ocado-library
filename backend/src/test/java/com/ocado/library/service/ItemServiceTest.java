package com.ocado.library.service;

import com.ocado.library.model.BookDescription;
import com.ocado.library.model.Item;
import com.ocado.library.model.Journal;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.model.enums.ItemType;
import com.ocado.library.model.enums.OperationType;
import com.ocado.library.repository.ItemRepository;
import com.ocado.library.repository.JournalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private JournalRepository journalRepository;

    private ItemService itemService;

    @BeforeEach
    void setUp() {
        itemService = new ItemService(itemRepository, new JournalService(journalRepository));
    }

    @Test
    void borrowItem_marksItemBorrowedAndLogsJournal() {
        BookDescription description = new BookDescription();
        description.setId(1L);
        description.setType(ItemType.Book);
        description.setTitle("Clean Code");

        Item item = new Item();
        item.setInternalId("OC-B-001");
        item.setStatus(ItemStatus.AVAILABLE);
        item.setDescription(description);

        when(itemRepository.findByInternalId("OC-B-001")).thenReturn(Optional.of(item));
        when(itemRepository.save(item)).thenReturn(item);

        itemService.borrowItem("OC-B-001", "employee@example.com");

        ArgumentCaptor<Item> saved = ArgumentCaptor.forClass(Item.class);
        verify(itemRepository).save(saved.capture());
        assertEquals(ItemStatus.BORROWED, saved.getValue().getStatus());
        assertEquals("employee@example.com", saved.getValue().getBorrower());

        ArgumentCaptor<Journal> journal = ArgumentCaptor.forClass(Journal.class);
        verify(journalRepository).save(journal.capture());
        assertEquals(OperationType.BORROW, journal.getValue().getOperationType());
        assertEquals("employee@example.com", journal.getValue().getUser());
    }

    @Test
    void returnItem_marksItemAvailableAndLogsJournal() {
        BookDescription description = new BookDescription();
        description.setId(2L);
        description.setType(ItemType.Book);

        Item item = new Item();
        item.setInternalId("OC-B-002");
        item.setStatus(ItemStatus.BORROWED);
        item.setBorrower("employee@example.com");
        item.setDescription(description);

        when(itemRepository.findByInternalId("OC-B-002")).thenReturn(Optional.of(item));
        when(itemRepository.save(item)).thenReturn(item);

        itemService.returnItem("OC-B-002", "employee@example.com");

        ArgumentCaptor<Item> saved = ArgumentCaptor.forClass(Item.class);
        verify(itemRepository).save(saved.capture());
        assertEquals(ItemStatus.AVAILABLE, saved.getValue().getStatus());
        assertNull(saved.getValue().getBorrower());
        assertNull(saved.getValue().getBorrowedAt());

        verify(journalRepository).save(any(Journal.class));
    }
}
