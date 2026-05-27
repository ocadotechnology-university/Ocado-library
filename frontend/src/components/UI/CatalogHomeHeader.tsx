import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { CatalogTagPoolButton } from "./CatalogTagPoolButton";

export type MediaSection = "books" | "board" | "ps";

const SECTIONS: { id: MediaSection; label: string }[] = [
  { id: "books", label: "Books" },
  { id: "board", label: "Board Games" },
  { id: "ps", label: "PS Games" },
];

export const CATEGORY_CHIPS = [
  "All",
  "New arrivals",
  "Popular",
  "Bestsellers",
  "Fiction",
  "Non-fiction",
  "Prizes",
] as const;

export type CatalogSearchItem = {
  key: string;
  title: string;
  hint: string;
};

export type CatalogHomeHeaderProps = {
  allTags: string[];
  selectedTags: string[];
  onToggleFilterTag: (tag: string) => void;
  section: MediaSection;
  onSectionChange: (s: MediaSection) => void;
  activeCategory: string;
  onCategoryChange: (c: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchItems: CatalogSearchItem[];
  onSearchSelect: (key: string) => void;
  className?: string;
};

const CatalogHomeHeader = ({
  allTags,
  selectedTags,
  onToggleFilterTag,
  section,
  onSectionChange,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchQueryChange,
  searchItems,
  onSearchSelect,
  className,
}: CatalogHomeHeaderProps) => {
  const searchId = useId();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length === 0) return [];
    return searchItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.hint.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [searchItems, searchQuery]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(t))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const pickSuggestion = useCallback(
    (key: string, title: string) => {
      onSearchQueryChange(title);
      onSearchSelect(key);
      setSearchOpen(false);
    },
    [onSearchQueryChange, onSearchSelect],
  );

  return (
    <div className={`flex w-full flex-col gap-5 ${className ?? ""}`.trim()}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div
          className="flex flex-wrap items-end gap-1 sm:gap-2"
          role="tablist"
          aria-label="Media type"
        >
          {SECTIONS.map(({ id, label }) => {
            const selected = section === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onSectionChange(id)}
                className={[
                  "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  selected
                    ? "scale-105 bg-[#43485e] text-[#eeeef0] underline decoration-[#eeeef0] decoration-2 underline-offset-4 shadow-md"
                    : "scale-100 bg-[#e4e8f0] text-[#5c6378] hover:bg-[#dce1eb]",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:max-w-xl">
          <div
            className="relative min-w-0 flex-1 sm:max-w-md lg:max-w-xl"
            ref={searchRef}
          >
            <label htmlFor={searchId} className="sr-only">
              Search catalogue
            </label>
            <input
              id={searchId}
              type="search"
              value={searchQuery}
              onChange={(e) => {
                onSearchQueryChange(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search titles, authors, tags…"
              autoComplete="off"
              className="w-full rounded-xl border border-[#b1b2b5] bg-white/90 px-4 py-2.5 text-sm text-[#43485e] shadow-sm outline-none ring-[#43485e]/20 transition placeholder:text-[#9e9eae] focus:border-[#43485e]/50 focus:ring-2"
            />
            {searchOpen &&
              searchQuery.trim().length > 0 &&
              suggestions.length > 0 && (
                <ul
                  className="absolute top-full right-0 left-0 z-40 mt-1 max-h-52 overflow-y-auto rounded-xl border border-[#d8dce8] bg-white py-1 shadow-[0_12px_32px_-8px_rgb(67_72_94_/0.25)]"
                  role="listbox"
                >
                  {suggestions.map((s) => (
                    <li key={s.key} role="option">
                      <button
                        type="button"
                        className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm transition hover:bg-[#eeeef0]"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickSuggestion(s.key, s.title)}
                      >
                        <span className="font-medium text-[#43485e]">
                          {s.title}
                        </span>
                        <span className="text-xs text-[#9e9eae]">{s.hint}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            {searchOpen &&
              searchQuery.trim().length > 0 &&
              suggestions.length === 0 && (
                <div className="absolute top-full right-0 left-0 z-40 mt-1 rounded-xl border border-[#d8dce8] bg-white px-3 py-2 text-sm text-[#9e9eae] shadow-lg">
                  No matches — try another word.
                </div>
              )}
          </div>

          <CatalogTagPoolButton
            allTags={allTags}
            selectedTags={selectedTags}
            onToggleTag={onToggleFilterTag}
            variant="icon"
            popoverAlign="end"
            onPopoverOpen={closeSearch}
          />
        </div>
      </div>

      <nav
        className="flex flex-wrap gap-2 border-b border-[#c5c9d6]/80 pb-3"
        aria-label="Browse categories"
      >
        {CATEGORY_CHIPS.map((name) => {
          const selected = activeCategory === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onCategoryChange(name)}
              className={[
                "rounded-full px-3 py-1.5 text-sm font-medium transition",
                selected
                  ? "bg-[#43485e] text-[#eeeef0] shadow-sm"
                  : "bg-white/80 text-[#5c6378] ring-1 ring-[#b1b2b5]/60 hover:bg-[#eeeef0]",
              ].join(" ")}
            >
              {name}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default CatalogHomeHeader;
