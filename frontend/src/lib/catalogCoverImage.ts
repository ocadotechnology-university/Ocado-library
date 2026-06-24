export type CoverImageSize = "preview" | "large";

export const CATALOG_COVER_PLACEHOLDER_CLASS = "bg-[#c8ccd6]";

export function normalizeIsbn(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const cleaned = raw.trim().replace(/[\s-]/g, "");
  if (cleaned.length === 0 || cleaned.startsWith("description-")) return null;
  if (/^(97[89])?\d{9}[\dXx]$/.test(cleaned) || /^\d{9}[\dXx]$/.test(cleaned)) {
    return cleaned.toUpperCase();
  }
  return null;
}

function normalizeStoredCoverUrl(
  imageUrl: string | null | undefined,
): string | null {
  const trimmed = imageUrl?.trim();
  if (!trimmed) return null;
  if (
    trimmed.includes("covers.openlibrary.org") &&
    trimmed.includes("default=false")
  ) {
    return trimmed.replace("default=false", "default=true");
  }
  return trimmed;
}

export function openLibraryCoverUrl(
  isbn: string,
  size: CoverImageSize = "preview",
): string {
  const suffix = size === "large" ? "L" : "M";
  return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-${suffix}.jpg?default=true`;
}

export function resolveInitialCoverMode(
  imageUrl: string | null | undefined,
  isbn: string | null | undefined,
): "stored" | "isbn" | "none" {
  if (normalizeStoredCoverUrl(imageUrl)) return "stored";
  if (normalizeIsbn(isbn)) return "isbn";
  return "none";
}

export function resolveCoverSrc(
  mode: "stored" | "isbn" | "none",
  imageUrl: string | null | undefined,
  isbn: string | null | undefined,
  size: CoverImageSize = "preview",
): string | null {
  if (mode === "stored") return normalizeStoredCoverUrl(imageUrl);
  if (mode === "isbn") {
    const normalized = normalizeIsbn(isbn);
    return normalized ? openLibraryCoverUrl(normalized, size) : null;
  }
  return null;
}
