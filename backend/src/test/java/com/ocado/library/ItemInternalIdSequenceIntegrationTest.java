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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ItemInternalIdSequenceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void proposesAndAdvancesInternalIdCounter() throws Exception {
        mockMvc.perform(get("/api/admin/items/next-internal-id")
                        .param("type", "Book")
                        .header("X-User-Email", "admin@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.internalId").value("OC-WRO-B-0300"));

        long descriptionId = createBookDescription();

        AdminCreateItemRequest createItemRequest = new AdminCreateItemRequest(
                "OC-WRO-B-0300", descriptionId, ItemStatus.AVAILABLE);

        mockMvc.perform(post("/api/admin/items/add")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createItemRequest)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/admin/items/next-internal-id")
                        .param("type", "BoardGame")
                        .header("X-User-Email", "admin@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.internalId").value("OC-WRO-G-0301"));
    }

    private long createBookDescription() throws Exception {
        CreateBookRequest createBookRequest = new CreateBookRequest(
                "Sequence Test", "Author", "978-0201485677",
                "Description", "", List.of("test"));

        String descResponse = mockMvc.perform(post("/api/descriptions/Book/add")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createBookRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(descResponse).get("id").asLong();
    }
}
