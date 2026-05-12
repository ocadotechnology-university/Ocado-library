package com.ocado.library.dto.response;

import com.ocado.library.model.enums.ItemType;
import java.util.List;

public record BookDescriptionDTO(
        Long id,
        String internalId,
        ItemType type,
        String title,
        String author,
        String image,
        String description,
        String category,
        List<String> tags,
        String descriptionStatus
) {}
