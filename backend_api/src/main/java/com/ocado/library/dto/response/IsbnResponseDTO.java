package com.ocado.library.dto.response;

public record IsbnResponseDTO(
        String title,
        String author,
        String image,
        String description
) {}
