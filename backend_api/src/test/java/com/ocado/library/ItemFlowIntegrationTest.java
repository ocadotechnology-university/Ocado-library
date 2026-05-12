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
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ItemFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testFullItemFlow() throws Exception {
        // 1. Admin creates a Book Description
        CreateBookRequest createBookRequest = new CreateBookRequest(
                "Clean Code", "Robert C. Martin", "978-0132350884", 
                "A Handbook of Agile Software Craftsmanship", "sample_image_url", List.of("java", "best-practices"));

        String descResponse = mockMvc.perform(post("/api/descriptions/Book/add")
                .header("X-User-Email", "admin@ocado.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createBookRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("Clean Code"))
                .andReturn().getResponse().getContentAsString();

        Long descriptionId = objectMapper.readTree(descResponse).get("id").asLong();

        // 2. Admin adds a Physical Copy
        AdminCreateItemRequest createItemRequest = new AdminCreateItemRequest(
                "OC-B-WR-001", descriptionId, ItemStatus.AVAILABLE);

        mockMvc.perform(post("/api/admin/items/add")
                .header("X-User-Email", "admin@ocado.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createItemRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.internalId").value("OC-B-WR-001"))
                .andExpect(jsonPath("$.status").value("AVAILABLE"));

        // 3. Employee views Catalog
        mockMvc.perform(get("/api/descriptions/Book/all")
                .header("X-User-Email", "employee@ocado.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].descriptionStatus").value("AVAILABLE"));

        // 4. Employee borrows the item
        mockMvc.perform(post("/api/items/OC-B-WR-001/borrow")
                .header("X-User-Email", "employee@ocado.com"))
                .andExpect(status().isOk());

        // 5. Employee views Catalog again (should be BORROWED_BY_ME)
        mockMvc.perform(get("/api/descriptions/Book/all")
                .header("X-User-Email", "employee@ocado.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].descriptionStatus").value("BORROWED_BY_ME"));

        // 6. Another Employee views Catalog (should be BORROWED)
        mockMvc.perform(get("/api/descriptions/Book/all")
                .header("X-User-Email", "other@ocado.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].descriptionStatus").value("BORROWED"));

        // 7. Employee returns the item
        mockMvc.perform(post("/api/items/OC-B-WR-001/return")
                .header("X-User-Email", "employee@ocado.com"))
                .andExpect(status().isOk());

        // 8. Admin checks Journal
        mockMvc.perform(get("/api/admin/journal")
                .header("X-User-Email", "admin@ocado.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4)); // 1 desc, 1 item, 1 borrow, 1 return
    }
}
