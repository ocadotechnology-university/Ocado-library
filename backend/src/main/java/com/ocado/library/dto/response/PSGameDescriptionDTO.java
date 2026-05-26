package com.ocado.library.dto.response;

import com.ocado.library.model.enums.ItemType;
import java.util.List;

public record PSGameDescriptionDTO(
        Long id,
        String internalId,
        ItemType type,
        String title,
        String description,
        List<String> tags
) {}
