package com.ocado.library;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ocado.library.dto.request.AdminCreateItemRequest;
import com.ocado.library.dto.request.CreateBoardGameRequest;
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
class BoardGameFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void boardGameBorrowReturnFlow() throws Exception {
        CreateBoardGameRequest createRequest = new CreateBoardGameRequest(
                "Catan", "Classic strategy game", 4, List.of("strategy"));

        String descResponse = mockMvc.perform(post("/api/descriptions/BoardGame/add")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Catan"))
                .andReturn().getResponse().getContentAsString();

        Long descriptionId = objectMapper.readTree(descResponse).get("id").asLong();

        AdminCreateItemRequest createItemRequest = new AdminCreateItemRequest(
                "OC-G-001", descriptionId, ItemStatus.AVAILABLE);

        mockMvc.perform(post("/api/admin/items/add")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createItemRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.internalId").value("OC-G-001"));

        mockMvc.perform(get("/api/descriptions/BoardGame/all")
                        .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].descriptionStatus").value("AVAILABLE"));

        mockMvc.perform(post("/api/items/OC-G-001/borrow")
                        .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/descriptions/BoardGame/all")
                        .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].descriptionStatus").value("BORROWED_BY_ME"));

        mockMvc.perform(post("/api/items/OC-G-001/return")
                        .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/descriptions/BoardGame/all")
                        .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].descriptionStatus").value("AVAILABLE"));
    }
}
