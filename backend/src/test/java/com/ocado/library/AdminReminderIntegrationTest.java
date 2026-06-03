package com.ocado.library;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ocado.library.dto.request.AdminCreateItemRequest;
import com.ocado.library.dto.request.CreateBookRequest;
import com.ocado.library.model.enums.ItemStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AdminReminderIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void manualReminderWhenBorrowedReturnsNoContent() throws Exception {
        String internalId = "OC-B-RM-001";
        createBookAndItem(internalId);

        mockMvc.perform(post("/api/items/" + internalId + "/borrow")
                        .header("X-User-Email", "borrower@example.com"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/admin/reminders/" + internalId)
                        .header("X-User-Email", "admin@example.com"))
                .andExpect(status().isNoContent());
    }

    @Test
    void manualReminderWhenNotBorrowedReturnsConflict() throws Exception {
        String internalId = "OC-B-RM-002";
        createBookAndItem(internalId);

        mockMvc.perform(post("/api/admin/reminders/" + internalId)
                        .header("X-User-Email", "admin@example.com"))
                .andExpect(status().isConflict());
    }

    @Test
    void manualReminderWhenItemMissingReturnsNotFound() throws Exception {
        mockMvc.perform(post("/api/admin/reminders/OC-B-MISSING")
                        .header("X-User-Email", "admin@example.com"))
                .andExpect(status().isNotFound());
    }

    private void createBookAndItem(String internalId) throws Exception {
        CreateBookRequest createBookRequest = new CreateBookRequest(
                "Reminder Test Book",
                "Author",
                "978-0000000001",
                "Description",
                null,
                List.of());

        String descResponse = mockMvc.perform(post("/api/descriptions/Book/add")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createBookRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long descriptionId = objectMapper.readTree(descResponse).get("id").asLong();

        AdminCreateItemRequest createItemRequest = new AdminCreateItemRequest(
                internalId, descriptionId, ItemStatus.AVAILABLE);

        mockMvc.perform(post("/api/admin/items/add")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createItemRequest)))
                .andExpect(status().isCreated());
    }
}
