import { describe, expect, it } from "vitest";
import {
  normalizeIsbn,
  openLibraryCoverUrl,
  resolveCoverSrc,
  resolveInitialCoverMode,
} from "./catalogCoverImage";

describe("catalogCoverImage", () => {
  it("normalizes ISBN values", () => {
    expect(normalizeIsbn("978-0-13-468599-1")).toBe("9780134685991");
    expect(normalizeIsbn("description-42")).toBeNull();
    expect(normalizeIsbn("")).toBeNull();
  });

  it("builds Open Library cover URLs", () => {
    expect(openLibraryCoverUrl("9780134685991", "large")).toBe(
      "https://covers.openlibrary.org/b/isbn/9780134685991-L.jpg?default=true",
    );
  });

  it("prefers stored image URLs over ISBN lookup", () => {
    expect(
      resolveInitialCoverMode("https://example.com/cover.jpg", "9780134685991"),
    ).toBe("stored");
    expect(resolveInitialCoverMode("", "9780134685991")).toBe("isbn");
    expect(resolveInitialCoverMode("", "description-1")).toBe("none");
  });

  it("resolves cover src by mode", () => {
    expect(
      resolveCoverSrc(
        "stored",
        "https://example.com/cover.jpg",
        "9780134685991",
      ),
    ).toBe("https://example.com/cover.jpg");
    expect(resolveCoverSrc("isbn", "", "9780134685991", "preview")).toContain(
      "9780134685991-M.jpg",
    );
    expect(resolveCoverSrc("none", "", "")).toBeNull();
  });
});
