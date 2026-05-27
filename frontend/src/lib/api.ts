import { clearStoredToken, getAccessToken } from "./authStorage";

export type MeResponse = {
  email: string;
  roles: string[];
};

export type IsbnBookResponse = {
  title: string | null;
  author: string | null;
  image: string | null;
  description: string | null;
};

export type BackendDescriptionStatus =
  | "AVAILABLE"
  | "BORROWED"
  | "BORROWED_BY_ME"
  | "UNAVAILABLE";

export type BackendItemStatus =
  | "AVAILABLE"
  | "BORROWED"
  | "LOST"
  | "FOR_OFFICE_USE_ONLY"
  | "UNAVAILABLE";

export type BackendBookDescription = {
  id: number;
  internalId: string | null;
  type: "Book";
  title: string;
  author: string;
  isbn: string | null;
  image: string | null;
  description: string | null;
  tags: string[] | null;
  descriptionStatus: BackendDescriptionStatus;
};

export type BackendBoardGameDescription = {
  id: number;
  internalId: string | null;
  type: "BoardGame";
  title: string;
  description: string | null;
  numberOfPlayers: number | null;
  tags: string[] | null;
  descriptionStatus: BackendDescriptionStatus;
};

export type BackendPSGameDescription = {
  id: number;
  internalId: string | null;
  type: "PSGame";
  title: string;
  description: string | null;
  tags: string[] | null;
  // PS games have no status (readonly, no borrowing)
};

export type ItemSummary = {
  internalId: string;
  status: BackendItemStatus;
  borrower: string | null;
};

export type ItemDetail = ItemSummary & {
  descriptionId: number;
  type: "Book" | "BoardGame" | "PSGame";
};

export type BookDescriptionPayload = {
  title: string;
  author: string;
  isbn: string;
  description: string;
  image: string;
  tags: string[];
};

export type BoardGameDescriptionPayload = {
  title: string;
  description: string;
  numberOfPlayers: number | null;
  tags: string[];
};

export type PSGameDescriptionPayload = {
  title: string;
  description: string;
  tags: string[];
};

export type CreateItemPayload = {
  internalId: string;
  descriptionId: number;
  status?: BackendItemStatus;
};

export type JournalOperationType =
  | "BORROW"
  | "RETURN"
  | "ADD"
  | "UPDATE"
  | "DELETE";

export type JournalEntry = {
  id: number;
  datetime: string;
  operationType: JournalOperationType | null;
  user: string;
  itemId: string | null;
  descriptionId: number | null;
};

export class ApiError extends Error {
  readonly status: number;
  readonly bodyText?: string;

  constructor(message: string, status: number, bodyText?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.bodyText = bodyText;
  }
}

export function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (token == null) return {};
  return { Authorization: `Bearer ${token}` };
}

async function apiJson<T>(
  url: string,
  init: RequestInit = {},
  fallbackMessage = "Request failed",
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init.body != null ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (response.status === 401) {
    clearStoredToken();
    throw new ApiError("Unauthorized", 401);
  }
  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    const suffix = bodyText ? `: ${bodyText.slice(0, 400)}` : "";
    throw new ApiError(`${fallbackMessage}${suffix}`, response.status, bodyText);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  const text = await response.text();
  return (text.length > 0 ? JSON.parse(text) : undefined) as T;
}

export async function fetchMe(): Promise<MeResponse> {
  const response = await fetch("/api/me", { headers: authHeaders() });
  if (response.status === 401) {
    clearStoredToken();
    throw new ApiError("Unauthorized", 401);
  }
  if (!response.ok) {
    throw new ApiError("Failed to load profile", response.status);
  }
  return (await response.json()) as MeResponse;
}

export async function fetchBookByIsbn(isbn: string): Promise<IsbnBookResponse> {
  const normalized = encodeURIComponent(isbn.replace(/\s+/g, ""));
  const response = await fetch(`/api/isbn/${normalized}`, {
    headers: authHeaders(),
  });
  if (response.status === 401) {
    clearStoredToken();
    throw new ApiError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new ApiError("ISBN not found", 404);
  }
  if (!response.ok) {
    throw new ApiError("Failed to fetch book data", response.status);
  }
  return (await response.json()) as IsbnBookResponse;
}

export async function fetchCatalogTags(
  type: "Book" | "BoardGame" | "PSGame",
): Promise<string[]> {
  const payload = await apiJson<{ tags?: string[] }>(
    `/api/descriptions/${type}/tags`,
    {},
    "Failed to load tags",
  );
  return payload.tags ?? [];
}

export async function updateDescriptionTags(
  type: "Book" | "BoardGame" | "PSGame",
  descriptionId: number,
  tags: string[],
): Promise<string[]> {
  const payload = await apiJson<{ tags?: string[] }>(
    `/api/descriptions/${type}/${descriptionId}/tags`,
    { method: "POST", body: JSON.stringify({ tags }) },
    "Failed to update tags",
  );
  return payload.tags ?? [];
}

export async function fetchBookDescriptions(): Promise<
  BackendBookDescription[]
> {
  return apiJson<BackendBookDescription[]>(
    "/api/descriptions/Book/all",
    {},
    "Failed to load book catalog",
  );
}

export async function fetchItemsByDescription(
  descriptionId: number,
  status?: BackendItemStatus,
): Promise<ItemSummary[]> {
  const params = new URLSearchParams();
  if (status != null) params.set("status", status);
  const query = params.toString();
  return apiJson<ItemSummary[]>(
    `/api/items/${descriptionId}${query ? `?${query}` : ""}`,
    {},
    "Failed to load book instances",
  );
}

export async function borrowItem(internalId: string): Promise<void> {
  await apiJson<void>(
    `/api/items/${encodeURIComponent(internalId)}/borrow`,
    { method: "POST" },
    "Failed to borrow item",
  );
}

export async function returnItem(internalId: string): Promise<void> {
  await apiJson<void>(
    `/api/items/${encodeURIComponent(internalId)}/return`,
    { method: "POST" },
    "Failed to return item",
  );
}

export async function createBookDescription(
  payload: BookDescriptionPayload,
): Promise<BackendBookDescription> {
  return apiJson<BackendBookDescription>(
    "/api/descriptions/Book/add",
    { method: "POST", body: JSON.stringify(payload) },
    "Failed to create book",
  );
}

export async function updateBookDescription(
  descriptionId: number,
  payload: BookDescriptionPayload,
): Promise<BackendBookDescription> {
  return apiJson<BackendBookDescription>(
    `/api/descriptions/Book/${descriptionId}/edit`,
    { method: "PUT", body: JSON.stringify(payload) },
    "Failed to update book",
  );
}

export async function deleteBookDescription(
  descriptionId: number,
): Promise<void> {
  await apiJson<void>(
    `/api/descriptions/Book/${descriptionId}`,
    { method: "DELETE" },
    "Failed to delete book",
  );
}

export async function fetchBoardGameDescriptions(): Promise<
  BackendBoardGameDescription[]
> {
  return apiJson<BackendBoardGameDescription[]>(
    "/api/descriptions/BoardGame/all",
    {},
    "Failed to load board game catalog",
  );
}

export async function createBoardGameDescription(
  payload: BoardGameDescriptionPayload,
): Promise<BackendBoardGameDescription> {
  return apiJson<BackendBoardGameDescription>(
    "/api/descriptions/BoardGame/add",
    { method: "POST", body: JSON.stringify(payload) },
    "Failed to create board game",
  );
}

export async function updateBoardGameDescription(
  descriptionId: number,
  payload: BoardGameDescriptionPayload,
): Promise<BackendBoardGameDescription> {
  return apiJson<BackendBoardGameDescription>(
    `/api/descriptions/BoardGame/${descriptionId}/edit`,
    { method: "PUT", body: JSON.stringify(payload) },
    "Failed to update board game",
  );
}

export async function deleteBoardGameDescription(
  descriptionId: number,
): Promise<void> {
  await apiJson<void>(
    `/api/descriptions/BoardGame/${descriptionId}`,
    { method: "DELETE" },
    "Failed to delete board game",
  );
}

export async function fetchPSGameDescriptions(): Promise<
  BackendPSGameDescription[]
> {
  return apiJson<BackendPSGameDescription[]>(
    "/api/descriptions/PSGame/all",
    {},
    "Failed to load PS game catalog",
  );
}

export async function createPSGameDescription(
  payload: PSGameDescriptionPayload,
): Promise<BackendPSGameDescription> {
  return apiJson<BackendPSGameDescription>(
    "/api/descriptions/PSGame/add",
    { method: "POST", body: JSON.stringify(payload) },
    "Failed to create PS game",
  );
}

export async function updatePSGameDescription(
  descriptionId: number,
  payload: PSGameDescriptionPayload,
): Promise<BackendPSGameDescription> {
  return apiJson<BackendPSGameDescription>(
    `/api/descriptions/PSGame/${descriptionId}/edit`,
    { method: "PUT", body: JSON.stringify(payload) },
    "Failed to update PS game",
  );
}

export async function deletePSGameDescription(
  descriptionId: number,
): Promise<void> {
  await apiJson<void>(
    `/api/descriptions/PSGame/${descriptionId}`,
    { method: "DELETE" },
    "Failed to delete PS game",
  );
}

export async function createItem(
  payload: CreateItemPayload,
): Promise<ItemDetail> {
  return apiJson<ItemDetail>(
    "/api/admin/items/add",
    { method: "POST", body: JSON.stringify(payload) },
    "Failed to create item",
  );
}

export async function updateItemStatus(
  internalId: string,
  status: BackendItemStatus,
): Promise<ItemDetail> {
  return apiJson<ItemDetail>(
    `/api/admin/items/${encodeURIComponent(internalId)}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    "Failed to update item status",
  );
}

export async function fetchJournalEntries(params: {
  from?: string;
  to?: string;
  user?: string;
  operationType?: JournalOperationType;
  descriptionId?: number;
  internalId?: string;
}): Promise<JournalEntry[]> {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.user) query.set("user", params.user);
  if (params.operationType) query.set("operationType", params.operationType);
  if (params.descriptionId != null) {
    query.set("descriptionId", String(params.descriptionId));
  }
  if (params.internalId) query.set("internalId", params.internalId);

  return apiJson<JournalEntry[]>(
    `/api/admin/journal${query.toString() ? `?${query.toString()}` : ""}`,
    {},
    "Failed to load journal",
  );
}

export function hasRole(roles: string[], role: string): boolean {
  return roles.includes(role);
}
