package com.ocado.library.dto.response;

import com.ocado.library.model.enums.ItemType;
import java.util.List;

public record BoardGameDescriptionDTO(
        Long id,
        String internalId,
        ItemType type,
        String title,
        String description,
        Integer numberOfPlayers,
        String bggLink,
        List<String> tags,
        String descriptionStatus
) {}
