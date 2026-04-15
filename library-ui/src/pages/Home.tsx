import { useCallback, useMemo, useState } from "react";
import Layout from "../components/Layout";
import BookClientWindow from "../components/UI/BookClientWindow";
import BookFullView from "../components/UI/BookFullView";
import BookPreview from "../components/UI/BookPreview";
import CatalogViewToggle from "../components/UI/CatalogViewToggle";
import type { CatalogViewMode } from "../components/UI/CatalogViewToggle";
import type { BookStatus } from "../components/UI/BookPreview";
import CatalogHomeHeader, { type MediaSection } from "../components/UI/CatalogHomeHeader";
import { CatalogTagPoolButton } from "../components/UI/CatalogTagPoolButton";
import TopBar from "../components/UI/TopBar";
import NotificationPanel from "../components/UI/NotificationPanel";
import UserAccountWindow from "../components/UI/UserAccountWindow";
import LayoutRightStaticPanel from "../components/UI/LayoutRightStaticPanel";
import { SidebarAccentTitle, SidebarSectionLabel, SidebarTemplate } from "../components/UI/SidebarTemplate";

type ContentLevel = "junior" | "middle" | "senior";

type BookRow = {
  key: string;
  title: string;
  author: string;
  language: string;
  level: ContentLevel;
  status: BookStatus;
  newArrival: boolean;
  caption: string;
  seed: string;
  bookId: string;
  tags: string[];
};

const BOOK_DESCRIPTION =
  "Between life and death there is a library, and within that library, the shelves go on for ever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices. Would you have done anything differently, if you had the chance to undo your regrets?";

const LEVEL_OPTIONS: { id: ContentLevel; label: string }[] = [
  { id: "junior", label: "Junior" },
  { id: "middle", label: "Middle" },
  { id: "senior", label: "Senior" },
];

const STATUS_OPTIONS: { status: BookStatus; label: string }[] = [
  { status: "free", label: "Available" },
  { status: "borrowed", label: "Borrowed" },
  { status: "borrowed-by-me", label: "Borrowed by me" },
];

function toggleInList<T>(list: T[], item: T): T[] {
  const i = list.indexOf(item);
  if (i >= 0) return list.filter((_, idx) => idx !== i);
  return [...list, item];
}

function rowMatchesStatuses(row: BookRow, selected: BookStatus[]): boolean {
  if (selected.length === 0) return true;
  return selected.includes(row.status);
}

function rowMatchesLanguages(row: BookRow, selected: string[]): boolean {
  if (selected.length === 0) return true;
  return selected.includes(row.language);
}

function rowMatchesAuthors(row: BookRow, selected: string[]): boolean {
  if (selected.length === 0) return true;
  return selected.includes(row.author);
}

function rowMatchesLevels(row: BookRow, selected: ContentLevel[]): boolean {
  if (selected.length === 0) return true;
  return selected.includes(row.level);
}

function rowMatchesChosenTags(row: BookRow, chosen: string[]): boolean {
  if (chosen.length === 0) return true;
  const lower = row.tags.map((t) => t.toLowerCase());
  return chosen.every((c) => lower.includes(c.toLowerCase()));
}

function matchesCategory(row: BookRow, cat: string): boolean {
  if (cat === "All") return true;
  if (cat === "New arrivals") return row.newArrival;
  if (cat === "Popular") return row.tags.some((t) => /popular/i.test(t));
  if (cat === "Bestsellers") return row.tags.some((t) => /best/i.test(t));
  if (cat === "Fiction") return row.tags.some((t) => /^fiction$/i.test(t));
  if (cat === "Non-fiction") return row.tags.some((t) => /non-?fiction/i.test(t));
  if (cat === "Prizes") return row.tags.some((t) => /prize/i.test(t));
  return true;
}

function pillClass(active: boolean): string {
  return [
    "rounded-full border px-2.5 py-1 text-left text-xs font-medium transition",
    active
      ? "border-[#43485e] bg-[#43485e] text-[#eeeef0]"
      : "border-[#b1b2b5]/90 bg-[#dcdfe6] text-[#43485e] hover:border-[#43485e]/40",
  ].join(" ");
}

const previewVariants: BookRow[] = [
  {
    key: "ts-senior",
    title: "TypeScript Deep Dive",
    author: "Basarat Ali Syed",
    language: "TypeScript",
    level: "senior",
    status: "free",
    newArrival: false,
    caption: "Free",
    seed: "ts-senior",
    bookId: "OC-WRO-B-0101",
    tags: ["typescript", "types", "Popular", "web"],
  },
  {
    key: "py-middle",
    title: "Fluent Python",
    author: "Luciano Ramalho",
    language: "Python",
    level: "middle",
    status: "free",
    newArrival: true,
    caption: "Free · New arrival",
    seed: "py-middle",
    bookId: "OC-WRO-B-0102",
    tags: ["python", "idioms", "New", "Popular"],
  },
  {
    key: "go-junior",
    title: "The Go Programming Language",
    author: "Alan Donovan",
    language: "Go",
    level: "junior",
    status: "borrowed",
    newArrival: false,
    caption: "Borrowed",
    seed: "go-junior",
    bookId: "OC-WRO-B-0103",
    tags: ["go", "systems", "reference"],
  },
  {
    key: "java-middle",
    title: "Effective Java",
    author: "Joshua Bloch",
    language: "Java",
    level: "middle",
    status: "borrowed",
    newArrival: true,
    caption: "Borrowed · New arrival",
    seed: "java-middle",
    bookId: "OC-WRO-B-0104",
    tags: ["java", "patterns", "New", "Waitlist"],
  },
  {
    key: "rust-senior",
    title: "The Rust Programming Language",
    author: "Steve Klabnik",
    language: "Rust",
    level: "senior",
    status: "borrowed-by-me",
    newArrival: false,
    caption: "Borrowed by me",
    seed: "rust-senior",
    bookId: "OC-WRO-B-0105",
    tags: ["rust", "ownership", "Due soon"],
  },
  {
    key: "js-junior",
    title: "You Don't Know JS Yet",
    author: "Kyle Simpson",
    language: "JavaScript",
    level: "junior",
    status: "borrowed-by-me",
    newArrival: true,
    caption: "Borrowed by me · New arrival",
    seed: "js-junior",
    bookId: "OC-WRO-B-0106",
    tags: ["javascript", "New", "Checked out", "Popular"],
  },
  {
    key: "ddia-senior",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    language: "Mixed",
    level: "senior",
    status: "free",
    newArrival: false,
    caption: "Free",
    seed: "ddia-senior",
    bookId: "OC-WRO-B-0107",
    tags: ["distributed", "databases", "architecture"],
  },
  {
    key: "c-junior",
    title: "Modern C",
    author: "Jens Gustedt",
    language: "C",
    level: "junior",
    status: "borrowed",
    newArrival: false,
    caption: "Borrowed",
    seed: "c-junior",
    bookId: "OC-WRO-B-0108",
    tags: ["c", "systems", "Non-fiction"],
  },
];

const Home = () => {
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [section, setSection] = useState<MediaSection>("books");
  const [activeCategory, setActiveCategory] = useState("All");
  const [catalogView, setCatalogView] = useState<CatalogViewMode>("cards");

  const [selectedStatuses, setSelectedStatuses] = useState<BookStatus[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<ContentLevel[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [authorQuery, setAuthorQuery] = useState("");

  const selected = openKey != null ? previewVariants.find((b) => b.key === openKey) : undefined;

  const close = useCallback(() => setOpenKey(null), []);

  const openBook = useCallback((key: string) => {
    setUserPanelOpen(false);
    setNotificationsPanelOpen(false);
    setOpenKey(key);
  }, []);

  const openBookFromAccount = useCallback((key: string) => {
    setNotificationsPanelOpen(false);
    setOpenKey(key);
  }, []);

  const catalogLanguages = useMemo(
    () => [...new Set(previewVariants.map((b) => b.language))].sort((a, b) => a.localeCompare(b)),
    [],
  );

  const catalogAuthors = useMemo(
    () => [...new Set(previewVariants.map((b) => b.author))].sort((a, b) => a.localeCompare(b)),
    [],
  );

  const catalogAllTags = useMemo(
    () => [...new Set(previewVariants.flatMap((b) => b.tags))].sort((a, b) => a.localeCompare(b)),
    [],
  );

  const filteredAuthors = useMemo(() => {
    const q = authorQuery.trim().toLowerCase();
    if (q.length === 0) return [];
    return catalogAuthors.filter((a) => a.toLowerCase().includes(q));
  }, [catalogAuthors, authorQuery]);

  const filteredRows = useMemo(() => {
    return previewVariants.filter((row) => {
      if (!matchesCategory(row, activeCategory)) return false;
      if (!rowMatchesStatuses(row, selectedStatuses)) return false;
      if (!rowMatchesLanguages(row, selectedLanguages)) return false;
      if (!rowMatchesAuthors(row, selectedAuthors)) return false;
      if (!rowMatchesLevels(row, selectedLevels)) return false;
      if (!rowMatchesChosenTags(row, filterTags)) return false;
      return true;
    });
  }, [
    activeCategory,
    selectedStatuses,
    selectedLanguages,
    selectedAuthors,
    selectedLevels,
    filterTags,
  ]);

  const sidebarFiltersActive =
    selectedStatuses.length > 0 ||
    selectedLanguages.length > 0 ||
    selectedAuthors.length > 0 ||
    selectedLevels.length > 0 ||
    filterTags.length > 0;

  const toggleFilterTag = useCallback((tag: string) => {
    setFilterTags((prev) => {
      const exists = prev.some((p) => p.toLowerCase() === tag.toLowerCase());
      if (exists) return prev.filter((p) => p.toLowerCase() !== tag.toLowerCase());
      return [...prev, tag];
    });
  }, []);

  const removeFilterTag = useCallback((tag: string) => {
    setFilterTags((prev) => prev.filter((p) => p !== tag));
  }, []);

  const clearSidebarFilters = useCallback(() => {
    setSelectedStatuses([]);
    setSelectedLanguages([]);
    setSelectedAuthors([]);
    setSelectedLevels([]);
    setFilterTags([]);
    setAuthorQuery("");
  }, []);

  const leftSidebar = useMemo(
    () => (
      <SidebarTemplate>
        <SidebarAccentTitle>Filters</SidebarAccentTitle>

        <div className="flex flex-col gap-4 pt-1">
          <div>
            <SidebarSectionLabel>Tags</SidebarSectionLabel>
            <div className="mt-2 flex flex-col gap-2">
              <CatalogTagPoolButton
                allTags={catalogAllTags}
                selectedTags={filterTags}
                onToggleTag={toggleFilterTag}
                variant="block"
                popoverAlign="stretch"
              />
              {filterTags.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {filterTags.map((tag) => (
                    <li
                      key={tag}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[#43485e]/25 bg-[#eeeef0] px-2.5 py-1.5 text-sm text-[#43485e]"
                    >
                      <span className="min-w-0 truncate font-medium">{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeFilterTag(tag)}
                        className="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold text-[#5c6378] transition hover:bg-[#dcdfe6] hover:text-[#43485e]"
                        aria-label={`Remove tag ${tag}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <SidebarSectionLabel>Copy status</SidebarSectionLabel>
            <ul className="mt-2 flex flex-col gap-2">
              {STATUS_OPTIONS.map(({ status, label }) => {
                const on = selectedStatuses.includes(status);
                return (
                  <li key={status}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[#b1b2b5]/80 bg-[#dcdfe6] px-3 py-2 text-sm font-medium text-[#43485e] shadow-sm transition hover:bg-[#e8eaf0]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0 rounded border-[#43485e]/40 text-[#43485e] focus:ring-[#43485e]"
                        checked={on}
                        onChange={() => setSelectedStatuses((s) => toggleInList(s, status))}
                      />
                      <span>{label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <SidebarSectionLabel>Programming language</SidebarSectionLabel>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {catalogLanguages.map((lang) => {
                const on = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLanguages((s) => toggleInList(s, lang))}
                    className={pillClass(on)}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <SidebarSectionLabel>Level</SidebarSectionLabel>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {LEVEL_OPTIONS.map(({ id, label }) => {
                const on = selectedLevels.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedLevels((s) => toggleInList(s, id))}
                    className={pillClass(on)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <SidebarSectionLabel>Author</SidebarSectionLabel>
            <input
              type="search"
              value={authorQuery}
              onChange={(e) => setAuthorQuery(e.target.value)}
              placeholder="Type to find authors…"
              autoComplete="off"
              className="mt-2 w-full rounded-lg border border-[#b1b2b5] bg-white px-2.5 py-2 text-sm text-[#43485e] shadow-sm outline-none placeholder:text-[#9e9eae] focus:border-[#43485e]/50 focus:ring-2 focus:ring-[#43485e]/20"
              aria-label="Find authors"
            />
            {selectedAuthors.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1.5">
                {selectedAuthors.map((author) => (
                  <li
                    key={author}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[#43485e]/25 bg-[#eeeef0] px-2.5 py-1.5 text-sm text-[#43485e]"
                  >
                    <span className="min-w-0 truncate font-medium">{author}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedAuthors((s) => s.filter((a) => a !== author))}
                      className="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold text-[#5c6378] transition hover:bg-[#dcdfe6] hover:text-[#43485e]"
                      aria-label={`Remove author ${author}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {authorQuery.trim().length > 0 && (
              <div className="mt-2 max-h-36 overflow-y-auto overscroll-y-contain pr-0.5">
                {filteredAuthors.length === 0 ? (
                  <p className="text-xs text-[#6b7289]">No authors match.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {filteredAuthors.map((author) => {
                      const on = selectedAuthors.includes(author);
                      return (
                        <button
                          key={author}
                          type="button"
                          title={author}
                          onClick={() => setSelectedAuthors((s) => toggleInList(s, author))}
                          className={[pillClass(on), "max-w-[13rem]"].join(" ")}
                        >
                          <span className="block truncate">{author}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {sidebarFiltersActive && (
            <div className="border-t border-[#9e9eae]/45 pt-3">
              <button
                type="button"
                onClick={clearSidebarFilters}
                className="w-full rounded-lg border border-[#43485e]/35 bg-[#eeeef0] px-3 py-2 text-center text-sm font-medium text-[#43485e] transition hover:bg-white"
              >
                Clear sidebar filters
              </button>
            </div>
          )}
        </div>
      </SidebarTemplate>
    ),
    [
      selectedStatuses,
      selectedLanguages,
      selectedAuthors,
      selectedLevels,
      filterTags,
      catalogLanguages,
      catalogAuthors,
      catalogAllTags,
      authorQuery,
      filteredAuthors,
      sidebarFiltersActive,
      toggleFilterTag,
      removeFilterTag,
      clearSidebarFilters,
    ],
  );

  return (
    <>
      <Layout
        topBar={
          <TopBar
            onLogoClick={() => {
              setOpenKey(null);
              setUserPanelOpen(false);
              setNotificationsPanelOpen(false);
            }}
            notificationsPanelOpen={notificationsPanelOpen}
            onNotificationsClick={() => {
              setUserPanelOpen(false);
              setNotificationsPanelOpen((open) => !open);
            }}
            accountPanelOpen={userPanelOpen}
            onAccountClick={() => {
              setNotificationsPanelOpen(false);
              setOpenKey(null);
              setUserPanelOpen((open) => !open);
            }}
          />
        }
        leftSidebar={leftSidebar}
        rightSidebar={<LayoutRightStaticPanel />}
      >
        <div className="flex w-full flex-col gap-8">
          <CatalogHomeHeader
            allTags={catalogAllTags}
            selectedTags={filterTags}
            onToggleFilterTag={toggleFilterTag}
            section={section}
            onSectionChange={setSection}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {section === "books" ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-[#43485e]">Browse</h2>
                <CatalogViewToggle mode={catalogView} onModeChange={setCatalogView} />
              </div>
              {filteredRows.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#b1b2b5] bg-[#eeeef0]/60 px-4 py-8 text-center text-sm text-[#6b7289]">
                  No items match these filters. Try another category or clear the filters on the left.
                </p>
              ) : catalogView === "cards" ? (
                <ul className="grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                  {filteredRows.map((row) => (
                    <li key={row.key} className="flex justify-center">
                      <BookPreview
                        variant="card"
                        coverSrc={`https://picsum.photos/seed/${row.seed}/272/181`}
                        title={row.title}
                        author={row.author}
                        status={row.status}
                        newArrival={row.newArrival}
                        onOpen={() => openBook(row.key)}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="flex list-none flex-col gap-4">
                  {filteredRows.map((row) => (
                    <li key={row.key} className="w-full">
                      <BookPreview
                        variant="list"
                        coverSrc={`https://picsum.photos/seed/${row.seed}/272/181`}
                        title={row.title}
                        author={row.author}
                        status={row.status}
                        newArrival={row.newArrival}
                        bookId={row.bookId}
                        description={BOOK_DESCRIPTION}
                        onOpen={() => openBook(row.key)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#b1b2b5] bg-[#f3f4f8] px-4 py-10 text-center">
              <p className="text-base font-medium text-[#43485e]">
                {section === "board" ? "Board games" : "PS games"} catalogue
              </p>
              <p className="mt-2 text-sm text-[#6b7289]">
                This section is ready for your inventory — the demo list below is under <strong>Books</strong>.
              </p>
            </div>
          )}
        </div>
      </Layout>
      {selected != null && (
        <BookClientWindow onBackdropClick={close}>
          <BookFullView
            coverSrc={`https://picsum.photos/seed/${selected.seed}/272/181`}
            coverSrcLarge={`https://picsum.photos/seed/${selected.seed}/640/960`}
            title={selected.title}
            author={selected.author}
            description={BOOK_DESCRIPTION}
            bookId={selected.bookId}
            tags={selected.tags}
            status={selected.status}
            newArrival={selected.newArrival}
            onClose={close}
            onBorrow={() => {}}
            onPing={() => {}}
            onReturn={() => {}}
            onEditTags={() => {}}
            className="w-full"
          />
        </BookClientWindow>
      )}
      <NotificationPanel
        open={notificationsPanelOpen}
        onClose={() => setNotificationsPanelOpen(false)}
      />
      <UserAccountWindow
        open={userPanelOpen}
        onClose={() => setUserPanelOpen(false)}
        onOpenBookDetail={openBookFromAccount}
      />
    </>
  );
};

export default Home;
