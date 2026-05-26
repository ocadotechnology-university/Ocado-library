package com.ocado.library.dto.request;

import java.util.List;

public record CreatePSGameRequest(
        String title,
        String description,
        List<String> tags
) {}
