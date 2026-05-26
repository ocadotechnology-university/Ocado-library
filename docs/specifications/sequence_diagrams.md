# Sequence Diagrams - Ocado-library

This file contains normalized sequence diagrams aligned with the current data model from `docs/database_model.md`.

## System Context

The diagrams reflect these core entities:

- `ITEM` (physical copy with `type`, `status`, `borrower`),
- metadata tables: `BOOK_DESCRIPTION`, `BOARD_GAME_DESCRIPTION`, `PS_GAME`,
- `JOURNAL` for audit events.

## 1. Catalog View

User opens the catalog and then opens details of one specific item.  
Backend resolves metadata table based on `ITEM.type`.

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant BE as Backend API
    participant IT as ITEM
    participant D as DESCRIPTION

    U->>FE: Open catalog
    FE->>BE: GET /api/descriptions/{type}/all
    BE->>D: SELECT *
    D-->>BE: List of descriptions

    note over BE: Process list

    loop For each element in list
        BE->>IT: SELECT status, borrower WHERE description_id=id
        IT-->>BE: status, borrower

        alt borrower is current user
            BE->>BE: description_status = BORROWED_BY_ME
        else status is AVAILABLE
            BE->>BE: description_status = AVAILABLE
        else
            BE->>BE: description_status = BORROWED
        end

        BE->>BE: descriptionDTO = description + description_status
    end

    BE-->>FE: 200 + descriptionDTOs
    FE-->>U: Render list
```

## 2. Borrow Item

User borrows a currently available item.  
System writes both `ITEM` status change and audit row in `JOURNAL`.

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant BE as Backend API
    participant IT as ITEM
    participant JR as JOURNAL

    U->>FE: Click "Borrow"
    FE->>BE: GET /api/items/{description_id}{status(Optional)}
    BE->>IT: SELECT internal_id WHERE description_id=descpition_id and status=status
    IT-->>BE: List of internal_id
    BE-->>FE: 200+List of internal_id
    U-->>FE: Choose internal_id from List
    FE->>BE: POST /api/items/{internal_id}/borrow
    BE->>IT: get instance(internal_id)
    IT-->>BE: status, borrower

    alt status = AVAILABLE
        BE->>IT: UPDATE status='BORROWED', borrower={userEmail}
        BE->>JR: INSERT "Borrow item {itemId}" by {userEmail}
        BE-->>FE: 200 OK
        FE-->>U: Borrow confirmed
    else status != AVAILABLE
        BE-->>FE: 409 Conflict (item unavailable)
        FE-->>U: Show unavailable message
    end
```

## 3. Return Item

Borrower (or admin) returns the item.  
Status becomes available and audit event is stored.

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant BE as Backend API
    participant IT as ITEM
    participant JR as JOURNAL

    U->>FE: Click "Return"
    FE->>BE: POST /api/items/{itemId}/return
    BE->>IT: SELECT status, borrower WHERE id={itemId}
    IT-->>BE: status, borrower

    alt status = BORROWED and borrower = user
        BE->>IT: UPDATE status='AVAILABLE', borrower=NULL
        BE->>JR: INSERT "Return item {itemId}" by {userEmail}
        BE-->>FE: 200 OK
        FE-->>U: Return confirmed
    else item not borrowed
        BE-->>FE: 409 Conflict (invalid state)
        FE-->>U: Show state error
    end
```

## 4. Admin Creates New Physical Item

Admin first creates metadata, then creates a physical `ITEM` pointing to that metadata (`description_id`).

```mermaid
sequenceDiagram
    actor A as Admin
    participant FE as Frontend
    participant BE as Backend API
    participant D as Description
    participant IT as ITEM
    participant JR as JOURNAL

    A->>FE: Submit new resource form
    FE->>BE: POST /api/descriptions/{type}/add

    BE->>BE: Validate admin

    alt is_admin = true
        BE->>D: INSERT description
        BE->>JR: INSERT "Create item {internal_id}" by {adminEmail}
        BE-->>FE: 201 Created
        FE-->>A: Show success + created item
    else
        BE-->>FE: 500 permission denied
        FE-->>A: Permision denied message
    end

```

## 5. Audit Log View

Admin opens complete system history based on `JOURNAL`.

```mermaid
sequenceDiagram
    actor A as Any User (Admin or Regular)
    participant FE as Frontend
    participant BE as Backend API
    participant JR as JOURNAL

    A->>FE: Open Audit, set filters (date, item_id)
    FE->>BE: GET /api/journal?from=...&to=...&item_id=...&page=1
    
    Note over BE: Get userEmail & role from JWT
    
    alt role == 'USER'
        Note over BE: Force filter: WHERE user_email = userEmail
    else role == 'ADMIN'
        Note over BE: Keep filters as they are (all users allowed)
    end

    BE->>JR: SELECT * FROM journal WHERE {filters} LIMIT 50
    JR-->>BE: Rows + Total Count
    
    BE-->>FE: 200 OK (History + Pagination Metadata)
    FE-->>A: Render filtered view
```

## Notes

- Mermaid participants use short aliases for stable rendering.
- Endpoint names are examples and can be mapped to your real API routes.
- Queue/waitlist and Slack notifications are not part of the current database model, so they are intentionally excluded here.
