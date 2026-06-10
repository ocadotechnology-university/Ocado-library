package com.ocado.library;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ocado.library.dto.request.MigrationDescriptionRequest;
import com.ocado.library.dto.request.MigrationInstanceRequest;
import com.ocado.library.model.enums.ItemStatus;
import com.ocado.library.model.enums.ItemType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class CatalogImportIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void importDescriptionsCreatesAllTypes() throws Exception {
        List<MigrationDescriptionRequest> payload = List.of(
                new MigrationDescriptionRequest(
                        ItemType.Book,
                        "Fluent Python",
                        "Luciano Ramalho",
                        "978-1491946008",
                        "Clear introduction to Python 3.",
                        null,
                        null,
                        List.of("python", "Popular"),
                        List.of(
                                new MigrationInstanceRequest("OC-WRO-B-9001", ItemStatus.AVAILABLE),
                                new MigrationInstanceRequest("OC-WRO-B-9002", ItemStatus.BORROWED)
                        )
                ),
                new MigrationDescriptionRequest(
                        ItemType.BoardGame,
                        "Catan",
                        null,
                        null,
                        "Classic resource-trading board game.",
                        null,
                        4,
                        List.of("strategy", "family"),
                        List.of(new MigrationInstanceRequest("OC-WRO-G-9001", ItemStatus.AVAILABLE))
                ),
                new MigrationDescriptionRequest(
                        ItemType.PSGame,
                        "Gran Turismo 7",
                        null,
                        null,
                        "Racing simulation for PlayStation.",
                        null,
                        null,
                        List.of("racing", "ps5"),
                        List.of(new MigrationInstanceRequest("OC-WRO-PS-9001", ItemStatus.AVAILABLE))
                )
        );

        mockMvc.perform(post("/api/admin/import")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRows").value(3))
                .andExpect(jsonPath("$.imported").value(3))
                .andExpect(jsonPath("$.failed").value(0))
                .andExpect(jsonPath("$.results[0].type").value("Book"))
                .andExpect(jsonPath("$.results[1].type").value("BoardGame"))
                .andExpect(jsonPath("$.results[2].type").value("PSGame"));

        mockMvc.perform(get("/api/descriptions/Book/all")
                        .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.title == 'Fluent Python')]").exists());

        mockMvc.perform(get("/api/descriptions/BoardGame/all")
                        .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.title == 'Catan')]").exists());

        mockMvc.perform(get("/api/descriptions/PSGame/all")
                        .header("X-User-Email", "employee@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.title == 'Gran Turismo 7')]").exists());
    }

    @Test
    void importDescriptionsRejectsDuplicateInternalIdsInFile() throws Exception {
        List<MigrationDescriptionRequest> payload = List.of(
                new MigrationDescriptionRequest(
                        ItemType.Book,
                        "Book A",
                        "Author A",
                        null,
                        null,
                        null,
                        null,
                        List.of(),
                        List.of(new MigrationInstanceRequest("OC-WRO-B-9101", ItemStatus.AVAILABLE))
                ),
                new MigrationDescriptionRequest(
                        ItemType.BoardGame,
                        "Game B",
                        null,
                        null,
                        null,
                        null,
                        null,
                        List.of(),
                        List.of(new MigrationInstanceRequest("OC-WRO-B-9101", ItemStatus.AVAILABLE))
                )
        );

        mockMvc.perform(post("/api/admin/import")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Duplicate internalId")));
    }

    @Test
    void importDescriptionsRejectsMismatchedInternalIdFormat() throws Exception {
        List<MigrationDescriptionRequest> payload = List.of(
                new MigrationDescriptionRequest(
                        ItemType.BoardGame,
                        "Bad Format",
                        null,
                        null,
                        null,
                        null,
                        null,
                        List.of(),
                        List.of(new MigrationInstanceRequest("OC-WRO-B-9201", ItemStatus.AVAILABLE))
                )
        );

        mockMvc.perform(post("/api/admin/import")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("OC-WRO-G")));
    }

    @Test
    void importDescriptionsRejectsMultiplePsInstances() throws Exception {
        List<MigrationDescriptionRequest> payload = List.of(
                new MigrationDescriptionRequest(
                        ItemType.PSGame,
                        "Too Many Copies",
                        null,
                        null,
                        null,
                        null,
                        null,
                        List.of(),
                        List.of(
                                new MigrationInstanceRequest("OC-WRO-PS-9301", ItemStatus.AVAILABLE),
                                new MigrationInstanceRequest("OC-WRO-PS-9302", ItemStatus.AVAILABLE)
                        )
                )
        );

        mockMvc.perform(post("/api/admin/import")
                        .header("X-User-Email", "admin@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("at most one")));
    }
}
