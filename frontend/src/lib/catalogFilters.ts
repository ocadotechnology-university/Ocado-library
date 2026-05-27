import type { BookStatus } from "../components/UI/BookPreview";

export type CatalogFilterableRow = {
  title: string;
  author: string;
  description: string;
  tags: string[];
  status: BookStatus;
  newArrival: boolean;
  language: string;
  bookId: string;
};

export type CatalogFilterState = {
  activeCategory: string;
  selectedStatuses: BookStatus[];
  selectedLanguages: string[];
  selectedAuthors: string[];
  filterTags: string[];
  searchQuery: string;
};

export function rowMatchesSearch(
  row: CatalogFilterableRow,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return true;
  const haystack = [
    row.title,
    row.author,
    row.description,
    row.bookId,
    ...row.tags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function rowMatchesStatuses(
  row: CatalogFilterableRow,
  selected: BookStatus[],
): boolean {
  if (selected.length === 0) return true;
  return selected.includes(row.status);
}

export function rowMatchesLanguages(
  row: CatalogFilterableRow,
  selected: string[],
): boolean {
  if (selected.length === 0) return true;
  return selected.some(
    (lang) =>
      row.language === lang ||
      row.tags.some((t) => t.toLowerCase() === lang.toLowerCase()),
  );
}

export function rowMatchesAuthors(
  row: CatalogFilterableRow,
  selected: string[],
): boolean {
  if (selected.length === 0) return true;
  return selected.includes(row.author);
}

export function rowMatchesChosenTags(
  row: CatalogFilterableRow,
  chosen: string[],
): boolean {
  if (chosen.length === 0) return true;
  const lower = row.tags.map((t) => t.toLowerCase());
  return chosen.every((c) => lower.includes(c.toLowerCase()));
}

export function matchesCategory(
  row: CatalogFilterableRow,
  cat: string,
): boolean {
  if (cat === "All") return true;
  if (cat === "New arrivals") return row.newArrival;
  if (cat === "Popular") return row.tags.some((t) => /popular/i.test(t));
  if (cat === "Bestsellers") return row.tags.some((t) => /best/i.test(t));
  if (cat === "Fiction") return row.tags.some((t) => /^fiction$/i.test(t));
  if (cat === "Non-fiction")
    return row.tags.some((t) => /non-?fiction/i.test(t));
  if (cat === "Prizes") return row.tags.some((t) => /prize/i.test(t));
  return true;
}

export function applyCatalogFilters(
  row: CatalogFilterableRow,
  filters: CatalogFilterState,
): boolean {
  if (!matchesCategory(row, filters.activeCategory)) return false;
  if (!rowMatchesStatuses(row, filters.selectedStatuses)) return false;
  if (!rowMatchesLanguages(row, filters.selectedLanguages)) return false;
  if (!rowMatchesAuthors(row, filters.selectedAuthors)) return false;
  if (!rowMatchesChosenTags(row, filters.filterTags)) return false;
  if (!rowMatchesSearch(row, filters.searchQuery)) return false;
  return true;
}

export function mergeUniqueTags(...tagLists: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of tagLists) {
    for (const raw of list) {
      const tag = raw.trim();
      if (!tag) continue;
      const key = tag.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(tag);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}
