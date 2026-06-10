# Catalog Import (Admin)

Bulk-import catalog descriptions (books, board games, PS games) together with their physical copies from a single JSON file.

**Audience:** Administrators  
**UI entry point:** Catalog sidebar → **Import** (below **Add PS game**)  
**API endpoint:** `POST /api/admin/import`  
**Example file:** `frontend/src/data/catalog-import-example.json`

---

## How it works

1. **Prepare a JSON file** — a non-empty array of description objects. Each object must include a `type` field (`Book`, `BoardGame`, or `PSGame`). Fields after that depend on the type.
2. **Open the Import panel** — sign in as admin, open the catalog, click **Import** in the left sidebar.
3. **Paste or upload JSON** — use the text area or **Upload JSON**. Click **Load example** to fill the editor with a valid mixed-type sample.
4. **Validation (client-side)** — the UI validates the JSON as you type (debounced). Errors are listed with a path (e.g. `[1].instances[0].internalId`) and message. Import stays disabled until the file is valid.
5. **Import** — click **Import**. The backend validates again (including database checks), then imports each row in its own transaction.
6. **Results** — the panel shows how many rows succeeded or failed. Each row reports `type`, `descriptionId`, and `instancesCreated`. The catalog refreshes automatically when at least one row is imported.

### What gets created per row

For every successfully imported entry the system:

1. Creates a **description** (catalog metadata) via the same logic as **Add book / Add board game / Add PS game**.
2. Creates one **physical copy** (`Item`) per object in `instances`.
3. Writes **journal** entries (`ADD`) for the description and each instance.

Import does **not** set a borrower email. Rows with `status: "BORROWED"` only mark the copy as borrowed in the system; no user is attached.

### Import behaviour and failure modes

| Scenario | Behaviour |
|----------|-----------|
| Invalid JSON or empty array | Request rejected (`400`). Nothing imported. |
| Duplicate `internalId` within the file | Request rejected (`400`). Nothing imported. |
| `internalId` already in database | Request rejected (`400`). Nothing imported. |
| Row-level validation error (e.g. wrong ID prefix for type) | Request rejected (`400`) before any row is processed. |
| Row fails during DB write (e.g. unexpected error) | Other rows may still succeed. Failed row appears in `results` with `status: "FAILED"`. |

Validation is **all-or-nothing at file level** for structural/duplicate/DB-conflict checks. Per-row transactions apply only after the full file passes those checks.

---

## JSON format

The root value **must be a JSON array**. Each element is one catalog description plus its physical copies.

### Shared fields (all types)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `type` | string | yes | `"Book"`, `"BoardGame"`, or `"PSGame"` |
| `title` | string | yes | Non-empty after trim |
| `description` | string \| null | no | Catalog description text |
| `tags` | string[] \| null | no | Tag labels |
| `instances` | array | yes | Physical copies (may be empty `[]`) |

### Instance object (all types)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `internalId` | string | yes | Unique business key; format depends on `type` (see below) |
| `status` | string | yes | `"AVAILABLE"` or `"BORROWED"` only |

### Type-specific fields

#### `Book`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `author` | string | yes | Use `""` for unknown/anonymous authors |
| `isbn` | string \| null | no | |
| `image` | string \| null | no | Cover image URL |
| `instances[].internalId` | string | yes | Must match `OC-WRO-B-<ID>` (e.g. `OC-WRO-B-0109`) |

#### `BoardGame`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `numberOfPlayers` | integer \| null | no | Must be ≥ 1 when provided |
| `instances[].internalId` | string | yes | Must match `OC-WRO-G-<ID>` (e.g. `OC-WRO-G-0101`) |

#### `PSGame`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `instances` | array | yes | **At most one** instance per PS game |
| `instances[].internalId` | string | yes | Must match `OC-WRO-PS-<ID>` (e.g. `OC-WRO-PS-0001`) |

`<ID>` is uppercase letters and digits (`A–Z`, `0–9`). IDs are normalised to uppercase on import.

---

## Examples

### Minimal book

```json
[
  {
    "type": "Book",
    "title": "Effective Java",
    "author": "Joshua Bloch",
    "isbn": "978-0134685991",
    "description": null,
    "tags": ["java"],
    "instances": [
      { "internalId": "OC-WRO-B-0104", "status": "AVAILABLE" }
    ]
  }
]
```

### Book with unknown author

```json
{
  "type": "Book",
  "title": "Untitled Local Manuscript",
  "author": "",
  "isbn": null,
  "description": "Anonymous donation.",
  "tags": ["Non-fiction"],
  "instances": [
    { "internalId": "OC-WRO-B-0199", "status": "AVAILABLE" }
  ]
}
```

### Board game with multiple copies

```json
{
  "type": "BoardGame",
  "title": "Catan",
  "description": "Classic resource-trading board game.",
  "numberOfPlayers": 4,
  "tags": ["strategy", "family"],
  "instances": [
    { "internalId": "OC-WRO-G-0101", "status": "AVAILABLE" },
    { "internalId": "OC-WRO-G-0102", "status": "BORROWED" }
  ]
}
```

### PS game (single copy)

```json
{
  "type": "PSGame",
  "title": "Gran Turismo 7",
  "description": "Racing simulation for PlayStation.",
  "tags": ["racing", "ps5"],
  "instances": [
    { "internalId": "OC-WRO-PS-0001", "status": "AVAILABLE" }
  ]
}
```

### Mixed import (recommended starting point)

See the full sample in `frontend/src/data/catalog-import-example.json`, or click **Load example** in the Import panel.

---

## API usage

**Request**

```http
POST /api/admin/import
Authorization: Bearer <admin-jwt>
Content-Type: application/json

[
  { "type": "Book", "title": "...", "author": "...", "instances": [...] },
  { "type": "BoardGame", "title": "...", "instances": [...] }
]
```

**Response** (`200 OK`)

```json
{
  "totalRows": 2,
  "imported": 2,
  "failed": 0,
  "results": [
    {
      "rowIndex": 0,
      "type": "Book",
      "status": "IMPORTED",
      "descriptionId": 42,
      "instancesCreated": 1,
      "errors": []
    },
    {
      "rowIndex": 1,
      "type": "BoardGame",
      "status": "IMPORTED",
      "descriptionId": 43,
      "instancesCreated": 2,
      "errors": []
    }
  ]
}
```

**Error response** (`400 Bad Request`) — file-level validation failed; body includes a `message` with one or more semicolon-separated errors.

---

## Common validation errors

| Message | Cause | Fix |
|---------|-------|-----|
| `root must be a JSON array` | Root is an object, not `[...]` | Wrap entries in an array |
| `type is required` | Missing or invalid `type` | Use `Book`, `BoardGame`, or `PSGame` |
| `author is required for Book` | Book row without `author` | Add `"author": ""` if unknown |
| `must match OC-WRO-B-...` | Book row with wrong ID prefix | Use `OC-WRO-B-...` for books |
| `must match OC-WRO-G-...` | Board game with book/PS prefix | Use `OC-WRO-G-...` for board games |
| `PSGame can have at most one physical instance` | Two+ instances on a PS game | Keep a single instance |
| `Duplicate internalId in file` | Same `internalId` on two rows | Assign unique IDs |
| `internalId already exists in database` | ID already registered | Use a new ID or remove the existing item first |

---

## TypeScript reference (frontend)

The canonical types live in `frontend/src/lib/catalogImportValidation.ts`:

```typescript
type MigrationDescriptionType = "Book" | "BoardGame" | "PSGame";

type MigrationInstance = {
  internalId: string;
  status: "AVAILABLE" | "BORROWED";
};

// Discriminated union — `type` selects which extra fields apply
type MigrationDescription =
  | { type: "Book"; title: string; author: string; isbn?: string | null; image?: string | null; description?: string | null; tags?: string[] | null; instances: MigrationInstance[] }
  | { type: "BoardGame"; title: string; description?: string | null; numberOfPlayers?: number | null; tags?: string[] | null; instances: MigrationInstance[] }
  | { type: "PSGame"; title: string; description?: string | null; tags?: string[] | null; instances: MigrationInstance[] };
```

---

## Related documentation

- API flow summary: `docs/specifications/api_flows.md` (Flow 10)
- Manual single-item creation: catalog UI → **Add book** / **Add board game** / **Add PS game**
- Physical copy ID formats: same rules as the **Add instance** dialog in the catalog
