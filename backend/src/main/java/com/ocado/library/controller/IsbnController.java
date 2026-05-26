package com.ocado.library.controller;

import com.ocado.library.dto.response.IsbnResponseDTO;
import com.ocado.library.service.IsbnService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/isbn")
public class IsbnController {

    private final IsbnService isbnService;

    public IsbnController(IsbnService isbnService) {
        this.isbnService = isbnService;
    }

    @GetMapping("/{isbn}")
    public ResponseEntity<IsbnResponseDTO> getBookByIsbn(@PathVariable String isbn) {
        IsbnResponseDTO response = isbnService.getBookDetailsByIsbn(isbn);
        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
