import { clearStoredToken, getAccessToken } from "./authStorage";

export type MeResponse = {
  email: string;
  roles: string[];
};

export type IsbnBookResponse = {
  title: string;
  author: string;
  image: string;
  description: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (token == null) return {};
  return { Authorization: `Bearer ${token}` };
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

export function hasRole(roles: string[], role: string): boolean {
  return roles.includes(role);
}
