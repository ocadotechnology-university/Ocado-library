# API Flows – Ocado Library

This document maps each user-facing action to the exact API calls that implement it.
It is the bridge between `sequence_diagrams.md` (the "why") and `openapi.yaml` (the "what").

Use this as the reference when:
- building frontend fetch/hook logic
- writing backend controller stubs
- designing integration / E2E tests

---

## Authentication

Every request must carry a JWT from Google OAuth2 in the `Authorization: Bearer <token>` header.
The backend validates the token and resolves the caller's email and role.

---

## Flow 1 – Open catalog (Employee)

**Goal:** show a list of resources of a chosen type with per-user availability status.

| Step | Actor | Call |
|------|-------|------|
| 1 | FE → BE | `GET /api/descriptions/{type}/all` |
| 2 | BE | resolves `description_status` per physical ITEM |
| 3 | BE → FE | `200` + array of `BookDescriptionDTO` / `BoardGameDescriptionDTO` / `PSGameDescriptionDTO` |

**Query parameters available:**
- `search` – free-text on title/author
- `category` – category filter (Books)
- `show_archived=true` – Admin only

**`description_status` resolution logic (backend):**

```
if any ITEM.borrower == callerEmail  →  BORROWED_BY_ME
else if any ITEM.status == IN_OFFICE →  AVAILABLE
else                                 →  BORROWED
```

PS5 games never expose `description_status`; they are catalog-only.

---

## Flow 2 – Open item detail (Employee)

**Goal:** show full metadata + available physical copies for a single description.

| Step | Actor | Call |
|------|-------|------|
| 1 | FE → BE | `GET /api/descriptions/{type}/{description_id}` |
| 2 | FE → BE | `GET /api/items/{description_id}` (optionally `?status=IN_OFFICE`) |

The second call provides the list of `internal_id` values the user can choose from before borrowing.

---

## Flow 3 – Borrow an item (Employee)

**Goal:** assign an available physical copy to the calling user.

| Step | Actor | Call |
|------|-------|------|
| 1 | FE → BE | `GET /api/items/{description_id}?status=IN_OFFICE` |
| 2 | User | selects an `internal_id` from the returned list |
| 3 | FE → BE | `POST /api/items/{internal_id}/borrow` |

**Happy path:** `200 OK` – FE shows confirmation.  
**Error path:** `409 Conflict` – item was taken between steps 1 and 3 (race condition); FE shows "unavailable" and re-fetches the list.

**Backend side effects:**
- `ITEM.status = BORROWED`, `ITEM.borrower = userEmail`
- JOURNAL row inserted: `"Borrow item {internal_id} by {userEmail}"`

---

## Flow 4 – Return an item (Employee / Admin)

**Goal:** mark a borrowed item as available again.

| Step | Actor | Call |
|------|-------|------|
| 1 | FE → BE | `POST /api/items/{internal_id}/return` |

**Happy path:** `200 OK` – FE updates item status in UI.  
**Error paths:**
- `403 Forbidden` – caller is not the borrower and is not Admin
- `409 Conflict` – item is not in `BORROWED` state

**Backend side effects:**
- `ITEM.status = IN_OFFICE`, `ITEM.borrower = NULL`
- JOURNAL row inserted: `"Return item {internal_id} by {userEmail}"`

---

## Flow 5 – Admin creates a new resource (Admin)

**Goal:** add a new metadata entry + first physical copy.

| Step | Actor | Call |
|------|-------|------|
| 1 | FE → BE | `POST /api/descriptions/{type}/add` with request body |

**Request bodies by type:**

- `Book` – requires `title`, `author`; optional `isbn` (auto-fills metadata)
- `BoardGame` – requires `title`; optional `number_of_players`, `bgg_link`
- `PSGame` – requires `title`

**Happy path:** `201 Created` – response contains the new description with assigned `internal_id`.  
**Error path:** `403 Forbidden` – caller is not Admin.

**Backend side effects:**
- Description row inserted in the matching metadata table
- JOURNAL row inserted: `"Create description {internal_id} by {adminEmail}"`
- Default status assigned: `IN_OFFICE` (Book/BoardGame) or `FOR_OFFICE_USE_ONLY` (PSGame)

---

## Flow 6 – Admin edits a resource (Admin)

**Goal:** update metadata fields or change item status (e.g. mark as LOST).

| Step | Actor | Call |
|------|-------|------|
| 1 | FE → BE | `PUT /api/descriptions/{type}/{description_id}/edit` with updated fields |

Allowed `status` values via edit: `IN_OFFICE`, `LOST`, `FOR_OFFICE_USE_ONLY`.  
Use the dedicated `/archive` endpoint for archiving.

---

## Flow 7 – Admin archives a resource (Admin)

**Goal:** soft-delete – hide from active catalog while preserving history.

| Step | Actor | Call |
|------|-------|------|
| 1 | FE → BE | `PATCH /api/descriptions/{type}/{description_id}/archive` |

**Backend side effects:**
- All linked ITEM rows set to `status = ARCHIVED`
- JOURNAL row inserted

Items with `ARCHIVED` status are hidden by default in catalog listings (`show_archived=false`).

---

## Flow 8 – Admin views audit log (Admin)

**Goal:** review full system history from JOURNAL.

| Step | Actor | Call |
|------|-------|------|
| 1 | FE → BE | `GET /api/admin/journal?from=&to=&user=` |

Results are ordered by `datetime DESC`.  
All three query parameters are optional and can be combined.

---

## Flow 9 – Admin sends manual reminder (Admin)

**Goal:** send a Slack message to the current borrower of a specific item.

| Step | Actor | Call |
|------|-------|------|
| 1 | FE → BE | `POST /api/admin/reminders/{internal_id}` |

**Error path:** `409` if the item is not currently borrowed.

---

## Flow 10 – Admin bulk-import catalog (Admin)

**Goal:** create descriptions and physical copies from a JSON array in one operation (books, board games, PS games).

| Step | Actor | Call |
|------|-------|------|
| 1 | FE | validate JSON client-side (`catalogImportValidation.ts`) |
| 2 | FE → BE | `POST /api/admin/import` with `MigrationDescription[]` body |
| 3 | BE | file-level validation (duplicates, DB conflicts, per-type rules) |
| 4 | BE | per-row import: `createDescription` + `addPhysicalCopy` (separate transaction per row) |
| 5 | BE → FE | `200` + `CatalogImportResponse` (`totalRows`, `imported`, `failed`, `results[]`) |
| 6 | FE | refresh catalog on success |

**Payload shape:** JSON array; each element has `type` (`Book` \| `BoardGame` \| `PSGame`), shared fields (`title`, `description`, `tags`, `instances`), and type-specific fields (`author`/`isbn`/`image` for books, `numberOfPlayers` for board games).

**Instance ID prefixes:** `OC-WRO-B-…` (books), `OC-WRO-G-…` (board games), `OC-WRO-PS-…` (PS games). PS games: max one instance per row.

**Error path:** `400` if the whole file fails validation (malformed JSON, duplicate IDs in file, ID already in DB, wrong prefix for type). Partial row failures are returned in `results` with `status: "FAILED"`.

**Full format and UI guide:** `docs/instructions/catalog_import.md`

---

## Error codes reference

| Code | Meaning in this system |
|------|------------------------|
| `400` | Malformed request body or invalid parameter |
| `401` | No token / expired token |
| `403` | Valid token but wrong role (Admin endpoint called by Employee) |
| `404` | Item or description not found |
| `409` | Business rule conflict (borrow unavailable item, return non-borrowed item, etc.) |

---

## Notes for frontend generation

When generating API client code from `openapi.yaml`:

- Use `oneOf` discriminator on `type` field to pick the correct DTO schema.
- `description_status` is the primary field for rendering borrow/return buttons in the catalog list — do not derive it on the frontend.
- All mutation endpoints (`POST`, `PUT`, `PATCH`) should invalidate the relevant catalog query cache after success.
- On `409`, re-fetch the item list before showing the error — the conflict reason is usually a stale status.
