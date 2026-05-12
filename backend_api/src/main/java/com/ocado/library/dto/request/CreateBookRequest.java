package com.ocado.library.dto.request;

import java.util.List;

public record CreateBookRequest(
        String title,
        String author,
        String isbn,
        String description,
        String image,
        String category,
        List<String> tags
) {}
