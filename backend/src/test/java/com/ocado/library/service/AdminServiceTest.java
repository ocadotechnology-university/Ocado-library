package com.ocado.library.service;

import com.ocado.library.dto.request.AdminCreateItemRequest;
import com.ocado.library.dto.request.CreateBookRequest;
import com.ocado.library.model.BookDescription;
import com.ocado.library.model.Description;
import com.ocado.library.model.Item;
import com.ocado.library.model.Journal;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.model.enums.ItemType;
import com.ocado.library.model.enums.OperationType;
import com.ocado.library.repository.DescriptionRepository;
import com.ocado.library.repository.ItemRepository;
import com.ocado.library.repository.JournalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private DescriptionRepository descriptionRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private JournalRepository journalRepository;

    private AdminService adminService;

    @BeforeEach
    void setUp() {
        when(journalRepository.save(any(Journal.class))).thenAnswer(invocation -> {
            Journal journal = invocation.getArgument(0);
            journal.setId(1L);
            return journal;
        });
        adminService = new AdminService(
                descriptionRepository, itemRepository, new JournalService(journalRepository));
    }

    @Test
    void createDescription_savesBookAndLogsJournal() {
        CreateBookRequest request = new CreateBookRequest(
                "Clean Code", "Robert C. Martin", "978-0132350884",
                "A handbook", "cover.jpg", List.of("java"));

        when(descriptionRepository.save(any(BookDescription.class))).thenAnswer(invocation -> {
            BookDescription bd = invocation.getArgument(0);
            bd.setId(10L);
            return bd;
        });

        Description result = adminService.createDescription(ItemType.Book, request, "admin@example.com");

        assertEquals("Clean Code", result.getTitle());

        ArgumentCaptor<Journal> journal = ArgumentCaptor.forClass(Journal.class);
        verify(journalRepository).save(journal.capture());
        assertEquals(OperationType.ADD, journal.getValue().getOperationType());
    }

    @Test
    void updateDescription_updatesBookAndLogsJournal() {
        BookDescription existing = new BookDescription();
        existing.setId(5L);
        existing.setType(ItemType.Book);
        existing.setTitle("Old Title");

        CreateBookRequest request = new CreateBookRequest(
                "New Title", "Author", "978-0000000000", "Desc", "", List.of());

        when(descriptionRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(descriptionRepository.save(existing)).thenReturn(existing);

        Description result = adminService.updateDescription(ItemType.Book, 5L, request, "admin@example.com");

        assertEquals("New Title", result.getTitle());
        verify(journalRepository).save(any(Journal.class));
    }

    @Test
    void deleteDescription_removesDescriptionAndLogsJournal() {
        BookDescription existing = new BookDescription();
        existing.setId(7L);
        existing.setType(ItemType.Book);

        when(descriptionRepository.findById(7L)).thenReturn(Optional.of(existing));

        adminService.deleteDescription(ItemType.Book, 7L, "admin@example.com");

        verify(itemRepository).deleteByDescriptionId(7L);
        verify(descriptionRepository).delete(existing);
        verify(journalRepository).save(any(Journal.class));
    }

    @Test
    void updatePhysicalCopyStatus_clearsBorrowerWhenAvailable() {
        BookDescription description = new BookDescription();
        description.setId(3L);
        description.setType(ItemType.Book);

        Item item = new Item();
        item.setInternalId("OC-B-003");
        item.setStatus(ItemStatus.BORROWED);
        item.setBorrower("user@example.com");
        item.setDescription(description);

        when(itemRepository.findByInternalId("OC-B-003")).thenReturn(Optional.of(item));
        when(itemRepository.save(item)).thenReturn(item);

        Item result = adminService.updatePhysicalCopyStatus("OC-B-003", ItemStatus.AVAILABLE, "admin@example.com");

        assertEquals(ItemStatus.AVAILABLE, result.getStatus());
        assertNull(result.getBorrower());
        verify(journalRepository).save(any(Journal.class));
    }
}
