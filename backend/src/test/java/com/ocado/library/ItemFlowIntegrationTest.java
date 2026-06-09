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
                .header("X-User-Email", "admin@example.com")
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
                .header("X-User-Email", "admin@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createItemRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.internalId").value("OC-B-WR-001"))
                .andExpect(jsonPath("$.status").value("AVAILABLE"));

        // 3. Employee updates tags on the description
        mockMvc.perform(post("/api/descriptions/Book/" + descriptionId + "/tags")
                .header("X-User-Email", "employee@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"tags\":[\"java\",\"best-practices\",\"fiction\"]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tags").isArray())
                .andExpect(jsonPath("$.tags.length()").value(3));

        // 4. Employee views Catalog
        mockMvc.perform(get("/api/descriptions/Book/all")
                .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].descriptionStatus").value("AVAILABLE"));

        // 5. Employee borrows the item
        mockMvc.perform(post("/api/items/OC-B-WR-001/borrow")
                .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk());

        // 6. Employee views Catalog again (should be BORROWED_BY_ME)
        mockMvc.perform(get("/api/descriptions/Book/all")
                .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].descriptionStatus").value("BORROWED_BY_ME"));

        // 7. Another Employee views Catalog (should be BORROWED)
        mockMvc.perform(get("/api/descriptions/Book/all")
                .header("X-User-Email", "other@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].descriptionStatus").value("BORROWED"));

        // 8. Employee returns the item
        mockMvc.perform(post("/api/items/OC-B-WR-001/return")
                .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk());

        // 9. Admin checks Journal
        mockMvc.perform(get("/api/admin/journal")
                .header("X-User-Email", "admin@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5)); // desc, item, tag update, borrow, return
    }
}
