package com.ocado.library.dto.request;

import com.ocado.library.model.enums.ItemType;

import java.util.List;

public record MigrationDescriptionRequest(
        ItemType type,
        String title,
        String author,
        String isbn,
        String description,
        String image,
        Integer numberOfPlayers,
        List<String> tags,
        List<MigrationInstanceRequest> instances
) {}
