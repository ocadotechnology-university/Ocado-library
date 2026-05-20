package com.ocado.library.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.ocado.library.dto.response.IsbnResponseDTO;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class IsbnService {

    private final RestTemplate restTemplate;

    public IsbnService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    public IsbnResponseDTO getBookDetailsByIsbn(String isbn) {
        String url = "https://openlibrary.org/api/books?bibkeys=ISBN:" + isbn + "&format=json&jscmd=data";

        try {
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            if (response != null && response.has("ISBN:" + isbn)) {
                JsonNode bookNode = response.get("ISBN:" + isbn);

                String title = bookNode.has("title") ? bookNode.get("title").asText() : null;

                String author = null;
                if (bookNode.has("authors") && bookNode.get("authors").isArray() && !bookNode.get("authors").isEmpty()) {
                    author = bookNode.get("authors").get(0).get("name").asText();
                }

                String image = null;
                if (bookNode.has("cover")) {
                    JsonNode coverNode = bookNode.get("cover");
                    if (coverNode.has("large")) {
                        image = coverNode.get("large").asText();
                    } else if (coverNode.has("medium")) {
                        image = coverNode.get("medium").asText();
                    }
                }

                String description = null;
                if (bookNode.has("description")) {
                    description = bookNode.get("description").asText();
                } else if (bookNode.has("notes")) {
                    description = bookNode.get("notes").asText();
                }

                return new IsbnResponseDTO(title, author, image, description);
            }
        } catch (Exception e) {
            // In case of an error, we return null so the controller returns a 404
            System.err.println("Error fetching ISBN details from OpenLibrary: " + e.getMessage());
        }

        return null;
    }
}
