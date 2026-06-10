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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ItemFlowIntegrationTest {

    private static final String BOOK_TITLE = "Clean Code";
    private static final String INTERNAL_ID = "OC-WRO-B-FLOW-001";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testFullItemFlow() throws Exception {
        // 1. Admin creates a Book Description
        CreateBookRequest createBookRequest = new CreateBookRequest(
                BOOK_TITLE, "Robert C. Martin", "978-0132350884",
                "A Handbook of Agile Software Craftsmanship", "sample_image_url", List.of("java", "best-practices"));

        String descResponse = mockMvc.perform(post("/api/descriptions/Book/add")
                .header("X-User-Email", "admin@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createBookRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value(BOOK_TITLE))
                .andReturn().getResponse().getContentAsString();

        Long descriptionId = objectMapper.readTree(descResponse).get("id").asLong();

        // 2. Admin adds a Physical Copy
        AdminCreateItemRequest createItemRequest = new AdminCreateItemRequest(
                INTERNAL_ID, descriptionId, ItemStatus.AVAILABLE);

        mockMvc.perform(post("/api/admin/items/add")
                .header("X-User-Email", "admin@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createItemRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.internalId").value(INTERNAL_ID))
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
                .andExpect(jsonPath("$[?(@.id == " + descriptionId + ")].descriptionStatus", hasItem("AVAILABLE")));

        // 5. Employee borrows the item
        mockMvc.perform(post("/api/items/" + INTERNAL_ID + "/borrow")
                .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk());

        // 6. Employee views Catalog again (should be BORROWED_BY_ME)
        mockMvc.perform(get("/api/descriptions/Book/all")
                .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + descriptionId + ")].descriptionStatus", hasItem("BORROWED_BY_ME")));

        // 7. Another Employee views Catalog (should be BORROWED)
        mockMvc.perform(get("/api/descriptions/Book/all")
                .header("X-User-Email", "other@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + descriptionId + ")].descriptionStatus", hasItem("BORROWED")));

        // 8. Employee returns the item
        mockMvc.perform(post("/api/items/" + INTERNAL_ID + "/return")
                .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk());

        // 9. Admin checks Journal for this description only
        mockMvc.perform(get("/api/admin/journal?descriptionId=" + descriptionId)
                .header("X-User-Email", "admin@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5)); // desc, item, tag update, borrow, return
    }
}
