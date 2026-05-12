package com.ocado.library.dto.request;

import java.util.List;

public record CreateBoardGameRequest(
        String title,
        String description,
        Integer numberOfPlayers,
        String bggLink,
        List<String> tags
) {}
