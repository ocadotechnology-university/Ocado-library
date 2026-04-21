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
import CatalogAppTopBar from "../components/UI/CatalogAppTopBar";
import LayoutRightStaticPanel from "../components/UI/LayoutRightStaticPanel";
import { SidebarAccentTitle, SidebarSectionLabel, SidebarTemplate } from "../components/UI/SidebarTemplate";
import {
  BOOK_DESCRIPTION,
  type BookRow,
  previewVariants,
} from "../catalogue/demoCatalog";
import { useAppChrome } from "../context/AppChromeContext";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS: { status: BookStatus; label: string }[] = [
  { status: "free", label: "Available" },
  { status: "borrowed", label: "Borrowed" },
  { status: "borrowed-by-me", label: "Borrowed by me" },
];
const LANGUAGE_FILTER_OPTIONS = ["English", "Polish"] as const;

type AdminBook = BookRow & {
  isbn: string;
  instances: string[];
  imageUrl?: string;
};

type AdminDraft = {
  key: string;
  isbn: string;
  title: string;
  author: string;
  language: string;
  status: BookStatus;
  newArrival: boolean;
  bookId: string;
  seed: string;
  imageUrl: string;
  tagsInput: string;
};

type ContextMenuState = {
  key: string;
  x: number;
  y: number;
};

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

function coverSrcFor(row: AdminBook): string {
  return row.imageUrl?.trim() ? row.imageUrl : `https://picsum.photos/seed/${row.seed}/272/181`;
}

function coverSrcLargeFor(row: AdminBook): string {
  return row.imageUrl?.trim() ? row.imageUrl : `https://picsum.photos/seed/${row.seed}/640/960`;
}

const Home = () => {
  const { isAdmin } = useAuth();
  const { setNotificationsOpen } = useAppChrome();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [books, setBooks] = useState<AdminBook[]>(
    previewVariants.map((b, i) => ({
      ...b,
      language: i % 2 === 0 ? "English" : "Polish",
      isbn: `97800000000${i + 1}`,
      instances: [b.bookId],
      imageUrl: "",
    })),
  );
  const [section, setSection] = useState<MediaSection>("books");
  const [activeCategory, setActiveCategory] = useState("All");
  const [catalogView, setCatalogView] = useState<CatalogViewMode>("cards");
  const [adminMode, setAdminMode] = useState<"browse" | "add" | "edit">("browse");
  const [instanceTargetKey, setInstanceTargetKey] = useState<string | null>(null);
  const [instanceInput, setInstanceInput] = useState("");
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const [selectedStatuses, setSelectedStatuses] = useState<BookStatus[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [authorQuery, setAuthorQuery] = useState("");
  const [adminDraft, setAdminDraft] = useState<AdminDraft>({
    key: "",
    isbn: "",
    title: "",
    author: "",
    language: "",
    status: "free",
    newArrival: false,
    bookId: "",
    seed: "",
    imageUrl: "",
    tagsInput: "",
  });

  const selected = openKey != null ? books.find((b) => b.key === openKey) : undefined;

  const close = useCallback(() => setOpenKey(null), []);

  const openBook = useCallback(
    (key: string) => {
      setNotificationsOpen(false);
      setOpenKey(key);
    },
    [setNotificationsOpen],
  );

  const catalogAuthors = useMemo(
    () => [...new Set(books.map((b) => b.author))].sort((a, b) => a.localeCompare(b)),
    [books],
  );

  const catalogAllTags = useMemo(
    () => [...new Set(books.flatMap((b) => b.tags))].sort((a, b) => a.localeCompare(b)),
    [books],
  );

  const filteredAuthors = useMemo(() => {
    const q = authorQuery.trim().toLowerCase();
    if (q.length === 0) return [];
    return catalogAuthors.filter((a) => a.toLowerCase().includes(q));
  }, [catalogAuthors, authorQuery]);

  const filteredRows = useMemo(() => {
    return books.filter((row) => {
      if (!matchesCategory(row, activeCategory)) return false;
      if (!rowMatchesStatuses(row, selectedStatuses)) return false;
      if (!rowMatchesLanguages(row, selectedLanguages)) return false;
      if (!rowMatchesAuthors(row, selectedAuthors)) return false;
      if (!rowMatchesChosenTags(row, filterTags)) return false;
      return true;
    });
  }, [
    activeCategory,
    selectedStatuses,
    selectedLanguages,
    selectedAuthors,
    filterTags,
    books,
  ]);

  const resetDraft = useCallback(() => {
    setAdminDraft({
      key: "",
      isbn: "",
      title: "",
      author: "",
      language: "",
      status: "free",
      newArrival: false,
      bookId: "",
      seed: "",
      imageUrl: "",
      tagsInput: "",
    });
  }, []);

  const startAddBook = useCallback(() => {
    resetDraft();
    setAdminMode("add");
  }, [resetDraft]);

  const startEditBook = useCallback((row: AdminBook) => {
    setAdminDraft({
      key: row.key,
      isbn: row.isbn,
      title: row.title,
      author: row.author,
      language: row.language,
      status: row.status,
      newArrival: row.newArrival,
      bookId: row.bookId,
      seed: row.seed,
      imageUrl: row.imageUrl ?? "",
      tagsInput: row.tags.join(", "),
    });
    setAdminMode("edit");
  }, []);

  const loadFromRepoByIsbn = useCallback(() => {
    if (adminDraft.isbn.trim().length < 5) return;
    const code = adminDraft.isbn.trim().replace(/\s+/g, "");
    setAdminDraft((d) => ({
      ...d,
      title: d.title || "Loaded from repository",
      author: d.author || "Repository Author",
      language: d.language || "English",
      tagsInput: d.tagsInput || "loaded, api-pending",
      seed: d.seed || `isbn-${code}`,
    }));
  }, [adminDraft.isbn]);

  const saveAdminDraft = useCallback(() => {
    const tags = adminDraft.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!adminDraft.title.trim() || !adminDraft.author.trim() || !adminDraft.bookId.trim()) return;

    if (adminMode === "edit") {
      setBooks((prev) =>
        prev.map((row) =>
          row.key === adminDraft.key
            ? {
                ...row,
                isbn: adminDraft.isbn.trim(),
                title: adminDraft.title.trim(),
                author: adminDraft.author.trim(),
                language: adminDraft.language.trim(),
                level: row.level,
                status: adminDraft.status,
                newArrival: adminDraft.newArrival,
                bookId: adminDraft.bookId.trim(),
                seed: adminDraft.seed.trim() || row.seed,
                imageUrl: adminDraft.imageUrl.trim(),
                tags,
              }
            : row,
        ),
      );
    } else {
      const key = `book-${Date.now()}`;
      setBooks((prev) => [
        ...prev,
        {
          key,
          isbn: adminDraft.isbn.trim(),
          title: adminDraft.title.trim(),
          author: adminDraft.author.trim(),
          language: adminDraft.language.trim(),
          level: "middle",
          status: adminDraft.status,
          newArrival: adminDraft.newArrival,
          caption: adminDraft.status === "free" ? "Free" : "Borrowed",
          seed: adminDraft.seed.trim() || key,
          imageUrl: adminDraft.imageUrl.trim(),
          bookId: adminDraft.bookId.trim(),
          tags,
          instances: [adminDraft.bookId.trim()],
        },
      ]);
    }
    setAdminMode("browse");
    resetDraft();
  }, [adminDraft, adminMode, resetDraft]);

  const deleteBook = useCallback((key: string) => {
    if (!window.confirm("Delete this book?")) return;
    setBooks((prev) => prev.filter((b) => b.key !== key));
  }, []);

  const addInstance = useCallback(() => {
    const value = instanceInput.trim().toUpperCase();
    if (!/^OC-WRO-B-[A-Z0-9]+$/.test(value) || !instanceTargetKey) return;
    setBooks((prev) =>
      prev.map((b) =>
        b.key === instanceTargetKey
          ? { ...b, instances: b.instances.includes(value) ? b.instances : [...b.instances, value] }
          : b,
      ),
    );
    setInstanceInput("");
    setInstanceTargetKey(null);
  }, [instanceInput, instanceTargetKey]);

  const openInstanceModalFromContext = useCallback(() => {
    if (!contextMenu) return;
    setContextMenu(null);
    setInstanceTargetKey(contextMenu.key);
  }, [contextMenu]);

  const startEditFromContext = useCallback(() => {
    if (!contextMenu) return;
    const row = books.find((b) => b.key === contextMenu.key);
    if (!row) return;
    setContextMenu(null);
    startEditBook(row);
  }, [contextMenu, books, startEditBook]);

  const deleteFromContext = useCallback(() => {
    if (!contextMenu) return;
    const key = contextMenu.key;
    setContextMenu(null);
    if (openKey === key) setOpenKey(null);
    deleteBook(key);
  }, [contextMenu, deleteBook, openKey]);

  const sidebarFiltersActive =
    selectedStatuses.length > 0 ||
    selectedLanguages.length > 0 ||
    selectedAuthors.length > 0 ||
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
    setFilterTags([]);
    setAuthorQuery("");
  }, []);

  const leftSidebar = useMemo(
    () => (
      <SidebarTemplate>
        <SidebarAccentTitle>Filters</SidebarAccentTitle>

        <div className="flex flex-col gap-4 pt-1">
          {isAdmin && (
            <div>
              <SidebarSectionLabel>Admin</SidebarSectionLabel>
              <div className="mt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={startAddBook}
                  className="rounded-lg bg-[#43485e] px-3 py-2 text-sm font-medium text-[#eeeef0] shadow-sm transition hover:bg-[#363b4f]"
                >
                  Add book
                </button>
                {adminMode !== "browse" && (
                  <button
                    type="button"
                    onClick={() => setAdminMode("browse")}
                    className="rounded-lg border border-[#43485e]/30 bg-[#eeeef0] px-3 py-2 text-sm font-medium text-[#43485e]"
                  >
                    Back to browse
                  </button>
                )}
              </div>
            </div>
          )}
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
            <SidebarSectionLabel>Language</SidebarSectionLabel>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {LANGUAGE_FILTER_OPTIONS.map((lang) => {
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
      filterTags,
      catalogAuthors,
      catalogAllTags,
      authorQuery,
      filteredAuthors,
      sidebarFiltersActive,
      isAdmin,
      adminMode,
      startAddBook,
      toggleFilterTag,
      removeFilterTag,
      clearSidebarFilters,
    ],
  );

  return (
    <>
      <Layout
        topBar={
          <CatalogAppTopBar
            onLogoClick={() => {
              setOpenKey(null);
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
              {isAdmin && adminMode !== "browse" ? (
                <div className="rounded-2xl border border-[#b1b2b5]/80 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-semibold text-[#43485e]">
                    {adminMode === "add" ? "Add new book" : "Edit book"}
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-[#43485e]">ISBN</label>
                      <div className="flex gap-2">
                        <input
                          value={adminDraft.isbn}
                          onChange={(e) => setAdminDraft((d) => ({ ...d, isbn: e.target.value }))}
                          className="w-full rounded-lg border border-[#b1b2b5] px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={loadFromRepoByIsbn}
                          className="rounded-lg border border-[#43485e]/30 bg-[#eeeef0] px-3 py-2 text-sm font-medium text-[#43485e]"
                        >
                          Load from repo
                        </button>
                      </div>
                    </div>
                    {(
                      [
                        ["Title", "title"],
                        ["Author", "author"],
                        ["Language", "language"],
                        ["Book number", "bookId"],
                        ["Seed", "seed"],
                        ["Tags (comma separated)", "tagsInput"],
                      ] as const
                    ).map(([label, field]) => (
                      <div key={field} className={field === "tagsInput" ? "sm:col-span-2" : ""}>
                        <label className="mb-1 block text-sm font-medium text-[#43485e]">{label}</label>
                        <input
                          value={adminDraft[field]}
                          onChange={(e) => setAdminDraft((d) => ({ ...d, [field]: e.target.value }))}
                          className="w-full rounded-lg border border-[#b1b2b5] px-3 py-2 text-sm"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-[#43485e]">Image URL</label>
                      <input
                        value={adminDraft.imageUrl}
                        onChange={(e) => setAdminDraft((d) => ({ ...d, imageUrl: e.target.value }))}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-[#b1b2b5] px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#43485e]">Status</label>
                      <select
                        value={adminDraft.status}
                        onChange={(e) => setAdminDraft((d) => ({ ...d, status: e.target.value as BookStatus }))}
                        className="w-full rounded-lg border border-[#b1b2b5] px-3 py-2 text-sm"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.status} value={s.status}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="sm:col-span-2 flex items-center gap-2 text-sm text-[#43485e]">
                      <input
                        type="checkbox"
                        checked={adminDraft.newArrival}
                        onChange={(e) => setAdminDraft((d) => ({ ...d, newArrival: e.target.checked }))}
                        className="h-4 w-4 rounded border-[#43485e]/40 text-[#43485e]"
                      />
                      Mark as new arrival
                    </label>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={saveAdminDraft}
                      className="rounded-lg bg-[#43485e] px-4 py-2 text-sm font-medium text-[#eeeef0]"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminMode("browse")}
                      className="rounded-lg border border-[#43485e]/30 bg-[#eeeef0] px-4 py-2 text-sm font-medium text-[#43485e]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : filteredRows.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#b1b2b5] bg-[#eeeef0]/60 px-4 py-8 text-center text-sm text-[#6b7289]">
                  No items match these filters. Try another category or clear the filters on the left.
                </p>
              ) : catalogView === "cards" ? (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-[#43485e]">Browse</h2>
                    <CatalogViewToggle mode={catalogView} onModeChange={setCatalogView} />
                  </div>
                  <ul className="grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                  {filteredRows.map((row) => (
                    <li
                      key={row.key}
                      className="flex flex-col items-center gap-2"
                      onContextMenu={(e) => {
                        if (!isAdmin) return;
                        e.preventDefault();
                        setContextMenu({ key: row.key, x: e.clientX, y: e.clientY });
                      }}
                    >
                      <BookPreview
                        variant="card"
                        coverSrc={coverSrcFor(row)}
                        title={row.title}
                        author={row.author}
                        status={row.status}
                        newArrival={row.newArrival}
                        onOpen={() => openBook(row.key)}
                      />
                    </li>
                  ))}
                  </ul>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-[#43485e]">Browse</h2>
                    <CatalogViewToggle mode={catalogView} onModeChange={setCatalogView} />
                  </div>
                  <ul className="flex list-none flex-col gap-4">
                  {filteredRows.map((row) => (
                    <li key={row.key} className="w-full">
                      <div
                        onContextMenu={(e) => {
                          if (!isAdmin) return;
                          e.preventDefault();
                          setContextMenu({ key: row.key, x: e.clientX, y: e.clientY });
                        }}
                      >
                        <BookPreview
                        variant="list"
                        coverSrc={coverSrcFor(row)}
                        title={row.title}
                        author={row.author}
                        status={row.status}
                        newArrival={row.newArrival}
                        bookId={row.bookId}
                        description={BOOK_DESCRIPTION}
                        onOpen={() => openBook(row.key)}
                      />
                      </div>
                    </li>
                  ))}
                  </ul>
                </>
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
          <div className="relative w-full">
            <BookFullView
              coverSrc={coverSrcFor(selected)}
              coverSrcLarge={coverSrcLargeFor(selected)}
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
              footerExtraActions={
                isAdmin ? (
                  <>
                    <button
                      type="button"
                      onClick={() => startEditBook(selected)}
                      className="w-44 rounded-2xl border border-[#43485e]/35 bg-[#eef0f6] px-6 py-3.5 text-base font-semibold text-[#3f465c] shadow-sm transition hover:bg-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstanceTargetKey(selected.key)}
                      className="w-44 rounded-2xl border border-[#43485e]/35 bg-[#eef0f6] px-6 py-3.5 text-base font-semibold text-[#3f465c] shadow-sm transition hover:bg-white"
                    >
                      Add instance
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBook(selected.key)}
                      className="w-44 rounded-2xl border border-[#dc2626]/35 bg-[#fbe7e9] px-6 py-3.5 text-base font-semibold text-[#b4232a] shadow-sm transition hover:bg-[#fee2e2]"
                    >
                      Delete
                    </button>
                  </>
                ) : null
              }
              className="w-full"
            />
          </div>
        </BookClientWindow>
      )}
      {isAdmin && contextMenu && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[85] cursor-default bg-transparent p-0"
            aria-label="Close menu"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-[90] min-w-[9rem] rounded-lg border border-[#b1b2b5]/90 bg-white p-1.5 shadow-lg"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              type="button"
              onClick={startEditFromContext}
              className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-[#43485e] hover:bg-[#eeeef0]"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={openInstanceModalFromContext}
              className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-[#43485e] hover:bg-[#eeeef0]"
            >
              Add instance
            </button>
            <button
              type="button"
              onClick={deleteFromContext}
              className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-[#b91c1c] hover:bg-[#fee2e2]"
            >
              Delete
            </button>
          </div>
        </>
      )}
      {instanceTargetKey != null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[#b1b2b5]/80 bg-white p-4 shadow-lg">
            <h3 className="text-base font-semibold text-[#43485e]">Add instance</h3>
            <p className="mt-1 text-xs text-[#6b7289]">Use format: OC-WRO-B-num</p>
            <input
              value={instanceInput}
              onChange={(e) => setInstanceInput(e.target.value)}
              placeholder="OC-WRO-B-0109"
              className="mt-3 w-full rounded-lg border border-[#b1b2b5] px-3 py-2 text-sm"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setInstanceTargetKey(null);
                  setInstanceInput("");
                }}
                className="rounded-md border border-[#43485e]/30 bg-[#eeeef0] px-3 py-1.5 text-sm text-[#43485e]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addInstance}
                className="rounded-md bg-[#43485e] px-3 py-1.5 text-sm text-[#eeeef0]"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
