package com.ocado.library;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ocado.library.dto.request.AdminCreateItemRequest;
import com.ocado.library.dto.request.CreateBookRequest;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.model.enums.NotificationType;
import com.ocado.library.repository.NotificationLogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ItemPingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Test
    void pingBorrowerWhenBorrowedBySomeoneElseReturnsNoContent() throws Exception {
        String internalId = "OC-B-PING-001";
        long descriptionId = createBookAndItem(internalId);

        mockMvc.perform(post("/api/items/" + internalId + "/borrow")
                        .header("X-User-Email", "borrower@example.com"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/items/" + internalId + "/ping")
                        .header("X-User-Email", "pinger@example.com"))
                .andExpect(status().isNoContent());

        assertThat(notificationLogRepository.findAll()).anySatisfy(entry -> {
            assertThat(entry.getItemInternalId()).isEqualTo(internalId);
            assertThat(entry.getNotificationType()).isEqualTo(NotificationType.USER_PING);
            assertThat(entry.getRecipientEmail()).isEqualTo("borrower@example.com");
            assertThat(entry.getSenderEmail()).isEqualTo("pinger@example.com");
            assertThat(entry.isReadByRecipient()).isFalse();
        });
    }

    @Test
    void pingSelfReturnsConflict() throws Exception {
        String internalId = "OC-B-PING-002";
        createBookAndItem(internalId);

        mockMvc.perform(post("/api/items/" + internalId + "/borrow")
                        .header("X-User-Email", "borrower@example.com"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/items/" + internalId + "/ping")
                        .header("X-User-Email", "borrower@example.com"))
                .andExpect(status().isConflict());
    }

    @Test
    void pingWhenNotBorrowedReturnsConflict() throws Exception {
        String internalId = "OC-B-PING-003";
        createBookAndItem(internalId);

        mockMvc.perform(post("/api/items/" + internalId + "/ping")
                        .header("X-User-Email", "pinger@example.com"))
                .andExpect(status().isConflict());
    }

    @Test
    void pingUnknownItemReturnsNotFound() throws Exception {
        mockMvc.perform(post("/api/items/OC-B-MISSING-PING/ping")
                        .header("X-User-Email", "pinger@example.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    void pingDescriptionNotifiesAllBorrowedInstances() throws Exception {
        String internalId1 = "OC-B-PING-MULTI-001";
        String internalId2 = "OC-B-PING-MULTI-002";
        long descriptionId = createBookAndItem(internalId1);
        createItemForDescription(internalId2, descriptionId);

        mockMvc.perform(post("/api/items/" + internalId1 + "/borrow")
                        .header("X-User-Email", "borrower1@example.com"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/items/" + internalId2 + "/borrow")
                        .header("X-User-Email", "borrower2@example.com"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/items/description/" + descriptionId + "/ping")
                        .header("X-User-Email", "pinger@example.com"))
                .andExpect(status().isNoContent());
    }

    private long createBookAndItem(String internalId) throws Exception {
        CreateBookRequest createBookRequest = new CreateBookRequest(
                "Ping Test Book",
                "Author",
                "978-0000000099",
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

        long descriptionId = objectMapper.readTree(descResponse).get("id").asLong();

        AdminCreateItemRequest createItemRequest = new AdminCreateItemRequest(
                internalId, descriptionId, ItemStatus.AVAILABLE);

        mockMvc.perform(post("/api/admin/items/add")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createItemRequest)))
                .andExpect(status().isCreated());

        return descriptionId;
    }

    private void createItemForDescription(String internalId, long descriptionId) throws Exception {
        AdminCreateItemRequest createItemRequest = new AdminCreateItemRequest(
                internalId, descriptionId, ItemStatus.AVAILABLE);

        mockMvc.perform(post("/api/admin/items/add")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createItemRequest)))
                .andExpect(status().isCreated());
    }
}
