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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AdminCrudIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void editDeleteAndPatchStatus() throws Exception {
        CreateBookRequest createBookRequest = new CreateBookRequest(
                "Refactoring", "Martin Fowler", "978-0201485677",
                "Improving the design of existing code", "", List.of("java"));

        String descResponse = mockMvc.perform(post("/api/descriptions/Book/add")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createBookRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long descriptionId = objectMapper.readTree(descResponse).get("id").asLong();

        AdminCreateItemRequest createItemRequest = new AdminCreateItemRequest(
                "OC-B-CR-001", descriptionId, ItemStatus.AVAILABLE);

        mockMvc.perform(post("/api/admin/items/add")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createItemRequest)))
                .andExpect(status().isCreated());

        CreateBookRequest updatedBook = new CreateBookRequest(
                "Refactoring 2nd Ed", "Martin Fowler", "978-0201485677",
                "Updated description", "", List.of("java", "refactoring"));

        mockMvc.perform(put("/api/descriptions/Book/" + descriptionId + "/edit")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedBook)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Refactoring 2nd Ed"));

        mockMvc.perform(patch("/api/admin/items/OC-B-CR-001/status")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"UNAVAILABLE\",\"reason\":\"maintenance\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNAVAILABLE"));

        mockMvc.perform(delete("/api/descriptions/Book/" + descriptionId)
                        .header("X-User-Email", "admin@example.com"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/descriptions/Book/all")
                        .header("X-User-Email", "admin@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
