# Inventory Management System Documentation

This document outlines the database schema and system processes for the inventory management system handling Books, Board Games, and PlayStation Games.

---

## 1. Database Model (Entity-Relationship Diagram)

The database uses a polymorphic relationship in the `ITEM` table to link physical instances to their respective metadata tables based on the `type` field.

```mermaid
erDiagram
    BOOK_DESCRIPTION {
        int id PK "auto_inc"
        string title
        string autor
        string description
    }

    BOARD_GAME_DESCRIPTION {
        int id PK "auto_inc"
        string title
        string description
        int number_of_players
    }

    PS_GAME {
        int id PK "auto_inc"
        string title
        string description
    }

    ITEM {
        int id PK "auto_inc"
        string internal_id
        string type "Book, BoardGame, or PSGame"
        int description_id FK "ID from the respective description table"
        string status
        string borrower
    }

    JOURNAL {
        int id PK "auto_inc"
        datetime datetime
        string description
        string user
    }

    %% Polymorphic relationships mapped visually
    BOOK_DESCRIPTION ||--o{ ITEM : "describes (if type=Book)"
    BOARD_GAME_DESCRIPTION ||--o{ ITEM : "describes (if type=BoardGame)"
    PS_GAME ||--o{ ITEM : "describes (if type=PSGame)"

```

