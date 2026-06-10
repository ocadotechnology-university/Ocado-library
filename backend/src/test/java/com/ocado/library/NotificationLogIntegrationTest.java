package com.ocado.library;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ocado.library.model.NotificationLog;
import com.ocado.library.model.enums.NotificationType;
import com.ocado.library.repository.NotificationLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class NotificationLogIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @BeforeEach
    void clearNotifications() {
        notificationLogRepository.deleteAll();
    }

    @Test
    void getNotificationsReturnsOnlyEntriesForCurrentUser() throws Exception {
        notificationLogRepository.save(log(
                "OC-B-NOTIF-001",
                NotificationType.USER_PING,
                "borrower@example.com",
                "pinger@example.com"));
        notificationLogRepository.save(log(
                "OC-B-NOTIF-002",
                NotificationType.OVERDUE_REMINDER,
                "other@example.com",
                null));

        String response = mockMvc.perform(get("/api/notifications")
                        .header("X-User-Email", "borrower@example.com"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode entries = objectMapper.readTree(response);
        assertThat(entries).hasSize(1);
        assertThat(entries.get(0).get("itemInternalId").asText()).isEqualTo("OC-B-NOTIF-001");
        assertThat(entries.get(0).get("notificationType").asText()).isEqualTo("USER_PING");
        assertThat(entries.get(0).get("recipientEmail").asText()).isEqualTo("borrower@example.com");
        assertThat(entries.get(0).get("senderEmail").asText()).isEqualTo("pinger@example.com");
        assertThat(entries.get(0).get("read").asBoolean()).isFalse();
    }

    @Test
    void getNotificationsMatchesRecipientEmailCaseInsensitively() throws Exception {
        notificationLogRepository.save(log(
                "OC-B-NOTIF-CASE",
                NotificationType.USER_PING,
                "Borrower@Example.com",
                "pinger@example.com"));

        String response = mockMvc.perform(get("/api/notifications")
                        .header("X-User-Email", "borrower@example.com"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(objectMapper.readTree(response)).hasSize(1);
    }

    @Test
    void markNotificationAsReadPersistsAndUpdatesUnreadCount() throws Exception {
        NotificationLog saved = notificationLogRepository.save(log(
                "OC-B-NOTIF-READ-001",
                NotificationType.USER_PING,
                "borrower@example.com",
                "pinger@example.com"));

        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("X-User-Email", "borrower@example.com"))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(objectMapper.readTree(result.getResponse().getContentAsString())
                        .get("unreadCount").asLong()).isEqualTo(1));

        mockMvc.perform(patch("/api/notifications/" + saved.getId() + "/read")
                        .header("X-User-Email", "borrower@example.com"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("X-User-Email", "borrower@example.com"))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(objectMapper.readTree(result.getResponse().getContentAsString())
                        .get("unreadCount").asLong()).isZero());

        String response = mockMvc.perform(get("/api/notifications")
                        .header("X-User-Email", "borrower@example.com"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(objectMapper.readTree(response).get(0).get("read").asBoolean()).isTrue();
    }

    @Test
    void markNotificationAsReadForAnotherUserReturnsForbidden() throws Exception {
        NotificationLog saved = notificationLogRepository.save(log(
                "OC-B-NOTIF-READ-002",
                NotificationType.USER_PING,
                "borrower@example.com",
                "pinger@example.com"));

        mockMvc.perform(patch("/api/notifications/" + saved.getId() + "/read")
                        .header("X-User-Email", "other@example.com"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getNotificationsWhenNoneExistReturnsEmptyList() throws Exception {
        String response = mockMvc.perform(get("/api/notifications")
                        .header("X-User-Email", "nobody@example.com"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode entries = objectMapper.readTree(response);
        assertThat(entries).isEmpty();
    }

    private static NotificationLog log(
            String itemInternalId,
            NotificationType type,
            String recipientEmail,
            String senderEmail) {
        NotificationLog entry = new NotificationLog();
        entry.setItemInternalId(itemInternalId);
        entry.setNotificationType(type);
        entry.setRecipientEmail(recipientEmail);
        entry.setSenderEmail(senderEmail);
        entry.setSentAt(LocalDateTime.now());
        entry.setReadByRecipient(false);
        return entry;
    }
}
