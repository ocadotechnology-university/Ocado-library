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
class CatalogIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void catalogFiltersByTagAndShowsBorrowedByMe() throws Exception {
        CreateBookRequest bookA = new CreateBookRequest(
                "Domain-Driven Design", "Eric Evans", "978-0321125217",
                "DDD book", "", List.of("architecture", "java"));

        String descA = mockMvc.perform(post("/api/descriptions/Book/add")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookA)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long idA = objectMapper.readTree(descA).get("id").asLong();

        CreateBookRequest bookB = new CreateBookRequest(
                "The Pragmatic Programmer", "Hunt & Thomas", "978-0201616224",
                "Tips for developers", "", List.of("best-practices"));

        String descB = mockMvc.perform(post("/api/descriptions/Book/add")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookB)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long idB = objectMapper.readTree(descB).get("id").asLong();

        mockMvc.perform(post("/api/admin/items/add")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new AdminCreateItemRequest("OC-B-CAT-001", idA, ItemStatus.AVAILABLE))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/admin/items/add")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new AdminCreateItemRequest("OC-B-CAT-002", idB, ItemStatus.AVAILABLE))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/descriptions/Book/all")
                        .header("X-User-Email", "employee@example.com")
                        .param("tags", "architecture"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Domain-Driven Design"));

        mockMvc.perform(post("/api/items/OC-B-CAT-001/borrow")
                        .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/descriptions/Book/all")
                        .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.title=='Domain-Driven Design')].descriptionStatus")
                        .value("BORROWED_BY_ME"))
                .andExpect(jsonPath("$[?(@.title=='The Pragmatic Programmer')].descriptionStatus")
                        .value("AVAILABLE"));
    }
}
