import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import BookClientWindow from "../components/UI/BookClientWindow";
import BookFullView from "../components/UI/BookFullView";
import BookPreview from "../components/UI/BookPreview";
import CatalogViewToggle from "../components/UI/CatalogViewToggle";
import type { CatalogViewMode } from "../components/UI/CatalogViewToggle";
import type { BookStatus } from "../components/UI/BookPreview";
import CatalogHomeHeader, {
  type CatalogSearchItem,
  type MediaSection,
} from "../components/UI/CatalogHomeHeader";
import EditTagsDialog from "../components/UI/EditTagsDialog";
import TagsInput from "../components/UI/TagsInput";
import { CatalogTagPoolButton } from "../components/UI/CatalogTagPoolButton";
import CatalogAppTopBar from "../components/UI/CatalogAppTopBar";
import LayoutRightStaticPanel from "../components/UI/LayoutRightStaticPanel";
import {
  SidebarAccentTitle,
  SidebarSectionLabel,
  SidebarTemplate,
} from "../components/UI/SidebarTemplate";
import { useAppChrome } from "../context/AppChromeContext";
import { useAuth } from "../context/AuthContext";
import {
  ApiError,
  borrowItem,
  createBookDescription,
  createBoardGameDescription,
  createItem,
  createPSGameDescription,
  deleteBoardGameDescription,
  deleteBookDescription,
  deletePSGameDescription,
  fetchBoardGameDescriptions,
  fetchBookByIsbn,
  fetchBookDescriptions,
  fetchCatalogTags,
  fetchItemsByDescription,
  fetchJournalEntries,
  fetchPSGameDescriptions,
  returnItem,
  updateBoardGameDescription,
  updateBookDescription,
  updateDescriptionTags,
  updatePSGameDescription,
  type BackendBoardGameDescription,
  type BackendBookDescription,
  type BackendPSGameDescription,
  type BackendDescriptionStatus,
  type ItemSummary,
} from "../lib/api";
import { applyCatalogFilters, mergeUniqueTags } from "../lib/catalogFilters";

const STATUS_OPTIONS: { status: BookStatus; label: string }[] = [
  { status: "free", label: "Available" },
  { status: "borrowed", label: "Borrowed" },
  { status: "borrowed-by-me", label: "Borrowed by me" },
];
const LANGUAGE_FILTER_OPTIONS = ["English", "Polish"] as const;

type AdminBook = {
  id: number;
  key: string;
  isbn: string;
  title: string;
  author: string;
  language: string;
  level: "middle";
  status: BookStatus;
  backendStatus: BackendDescriptionStatus;
  newArrival: boolean;
  caption: string;
  bookId: string;
  description: string;
  tags: string[];
  placeholderSeed: string;
  imageUrl?: string;
};

type AdminDraft = {
  key: string;
  descriptionId: number | null;
  isbn: string;
  title: string;
  author: string;
  language: string;
  status: BookStatus;
  newArrival: boolean;
  bookId: string;
  imageUrl: string;
  description: string;
  tags: string[];
};

type BorrowDialogState = {
  book: AdminBook;
  items: ItemSummary[];
  selectedInternalId: string;
  loading: boolean;
  submitting: boolean;
  error: string | null;
};

type InstancesDialogState = {
  book: AdminBook;
  items: ItemSummary[];
  loading: boolean;
  error: string | null;
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

function pillClass(active: boolean): string {
  return [
    "rounded-full border px-2.5 py-1 text-left text-xs font-medium transition",
    active
      ? "border-[#43485e] bg-[#43485e] text-[#eeeef0]"
      : "border-[#b1b2b5]/90 bg-[#dcdfe6] text-[#43485e] hover:border-[#43485e]/40",
  ].join(" ");
}

function coverSrcFor(row: AdminBook): string {
  return `https://picsum.photos/seed/${encodeURIComponent(row.placeholderSeed)}/272/181`;
}

function coverSrcLargeFor(row: AdminBook): string {
  return `https://picsum.photos/seed/${encodeURIComponent(row.placeholderSeed)}/640/960`;
}

function toUiStatus(status: BackendDescriptionStatus): BookStatus {
  if (status === "AVAILABLE") return "free";
  if (status === "BORROWED_BY_ME") return "borrowed-by-me";
  return "borrowed";
}

function captionFor(status: BookStatus): string {
  if (status === "free") return "Available";
  if (status === "borrowed-by-me") return "Borrowed by me";
  return "Borrowed";
}

function languageFromTags(tags: string[]): string {
  return tags.find((t) => /^(English|Polish)$/i.test(t)) ?? "";
}

function mapBook(row: BackendBookDescription, index: number): AdminBook {
  const status = toUiStatus(row.descriptionStatus);
  const isbn = row.isbn?.trim() || `description-${row.id}`;
  const tags = row.tags ?? [];
  return {
    id: row.id,
    key: String(row.id),
    isbn,
    title: row.title,
    author: row.author,
    language: languageFromTags(tags),
    level: "middle",
    status,
    backendStatus: row.descriptionStatus,
    newArrival: index < 3,
    caption: captionFor(status),
    bookId: isbn,
    description: row.description ?? "",
    tags,
    placeholderSeed: `book-${isbn}`,
    imageUrl: row.image ?? "",
  };
}

function mapBoardToAdminBook(row: BackendBoardGameDescription): AdminBook {
  const seed = `board-${row.id}`;
  const status = toUiStatus(
    (row.descriptionStatus ?? "AVAILABLE") as BackendDescriptionStatus,
  );
  const tags = row.tags || [];
  return {
    id: row.id,
    key: `board-${row.id}`,
    isbn: "",
    title: row.title,
    author:
      row.numberOfPlayers != null
        ? `${row.numberOfPlayers} players`
        : "Board game",
    language: languageFromTags(tags),
    level: "middle",
    status,
    backendStatus: (row.descriptionStatus ??
      "AVAILABLE") as BackendDescriptionStatus,
    newArrival: false,
    caption: captionFor(status),
    bookId: `OC-WRO-G-${String(row.id).padStart(4, "0")}`,
    description: row.description || "",
    tags,
    placeholderSeed: seed,
    imageUrl: undefined,
  };
}

function mapPSGameToAdminBook(row: BackendPSGameDescription): AdminBook {
  const seed = `ps-${row.id}`;
  const tags = row.tags || [];
  return {
    id: row.id,
    key: `ps-${row.id}`,
    isbn: "",
    title: row.title,
    author: "PS Game",
    language: languageFromTags(tags),
    level: "middle",
    status: "free",
    backendStatus: "AVAILABLE",
    newArrival: false,
    caption: "PS Game",
    bookId: row.internalId ?? "",
    description: row.description || "",
    tags,
    placeholderSeed: seed,
    imageUrl: undefined,
  };
}

const Home = () => {
  const { isAdmin, user } = useAuth();
  const { setNotificationsOpen } = useAppChrome();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [boardGames, setBoardGames] = useState<BackendBoardGameDescription[]>(
    [],
  );
  const [psGames, setPsGames] = useState<BackendPSGameDescription[]>([]);

  const boardPreviewRows = useMemo(
    () => boardGames.map(mapBoardToAdminBook),
    [boardGames],
  );

  const psPreviewRows = useMemo(
    () => psGames.map(mapPSGameToAdminBook),
    [psGames],
  );

  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [adminSaving, setAdminSaving] = useState(false);
  const [borrowedThisWeek, setBorrowedThisWeek] = useState(0);
  const [borrowDialog, setBorrowDialog] = useState<BorrowDialogState | null>(
    null,
  );
  const [instancesDialog, setInstancesDialog] =
    useState<InstancesDialogState | null>(null);
  const [section, setSection] = useState<MediaSection>("books");
  const [activeCategory, setActiveCategory] = useState("All");
  const [catalogView, setCatalogView] = useState<CatalogViewMode>("cards");
  const [adminMode, setAdminMode] = useState<"browse" | "add" | "edit">(
    "browse",
  );
  const [instanceTargetKey, setInstanceTargetKey] = useState<string | null>(
    null,
  );
  const [instanceInput, setInstanceInput] = useState("");
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const [selectedStatuses, setSelectedStatuses] = useState<BookStatus[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [knownTags, setKnownTags] = useState<string[]>([]);
  const [authorQuery, setAuthorQuery] = useState("");
  const [tagsEditTarget, setTagsEditTarget] = useState<AdminBook | null>(null);
  const [adminDraft, setAdminDraft] = useState<AdminDraft>({
    key: "",
    descriptionId: null,
    isbn: "",
    title: "",
    author: "",
    language: "",
    status: "free",
    newArrival: false,
    bookId: "",
    imageUrl: "",
    description: "",
    tags: [],
  });
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [isbnError, setIsbnError] = useState<string | null>(null);

  const selected =
    openKey != null
      ? books.find((b) => b.key === openKey) ||
        boardPreviewRows.find((b) => b.key === openKey) ||
        psPreviewRows.find((b) => b.key === openKey)
      : undefined;

  const close = useCallback(() => setOpenKey(null), []);

  const openBook = useCallback(
    (key: string) => {
      setNotificationsOpen(false);
      setOpenKey(key);
    },
    [setNotificationsOpen],
  );

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const rows = await fetchBookDescriptions();
      const mapped = rows.map(mapBook);
      setBooks(mapped);

      const [boardRows, psRows, bookTagRows, boardTagRows, psTagRows] =
        await Promise.all([
          fetchBoardGameDescriptions().catch(() => []),
          fetchPSGameDescriptions().catch(() => []),
          fetchCatalogTags("Book").catch(() => []),
          fetchCatalogTags("BoardGame").catch(() => []),
          fetchCatalogTags("PSGame").catch(() => []),
        ]);
      setBoardGames(boardRows);
      setPsGames(psRows);
      setKnownTags(mergeUniqueTags(bookTagRows, boardTagRows, psTagRows));

      if (isAdmin) {
        const from = new Date();
        from.setDate(from.getDate() - 7);
        const journal = await fetchJournalEntries({
          operationType: "BORROW",
          from: from.toISOString().slice(0, 10),
        });
        setBorrowedThisWeek(journal.length);
      } else {
        setBorrowedThisWeek(
          mapped.filter((row) => row.status !== "free").length,
        );
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setCatalogError("Session expired. Please sign in again.");
      } else {
        setCatalogError("Could not load the catalog from backend.");
      }
    } finally {
      setCatalogLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const catalogAuthors = useMemo(
    () =>
      [
        ...new Set(
          [...books, ...boardPreviewRows, ...psPreviewRows].map(
            (b) => b.author,
          ),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [books, boardPreviewRows, psPreviewRows],
  );

  const catalogAllTags = useMemo(
    () =>
      mergeUniqueTags(
        knownTags,
        ...books.map((b) => b.tags),
        ...boardPreviewRows.map((b) => b.tags),
        ...psPreviewRows.map((b) => b.tags),
      ),
    [knownTags, books, boardPreviewRows, psPreviewRows],
  );

  const sectionRows = useMemo(() => {
    if (section === "board") return boardPreviewRows;
    if (section === "ps") return psPreviewRows;
    return books;
  }, [section, books, boardPreviewRows, psPreviewRows]);

  const displayRows = useMemo(
    () =>
      sectionRows.filter((row) =>
        applyCatalogFilters(row, {
          activeCategory,
          selectedStatuses,
          selectedLanguages,
          selectedAuthors,
          filterTags,
          searchQuery: catalogSearchQuery,
        }),
      ),
    [
      sectionRows,
      activeCategory,
      selectedStatuses,
      selectedLanguages,
      selectedAuthors,
      filterTags,
      catalogSearchQuery,
    ],
  );

  const searchItems = useMemo<CatalogSearchItem[]>(
    () =>
      sectionRows.map((row) => ({
        key: row.key,
        title: row.title,
        hint: `${row.author}${row.tags.length > 0 ? ` · ${row.tags.slice(0, 3).join(", ")}` : ""}`,
      })),
    [sectionRows],
  );

  const filteredAuthors = useMemo(() => {
    const q = authorQuery.trim().toLowerCase();
    if (q.length === 0) return [];
    return catalogAuthors.filter((a) => a.toLowerCase().includes(q));
  }, [catalogAuthors, authorQuery]);

  const resetDraft = useCallback(() => {
    setAdminDraft({
      key: "",
      descriptionId: null,
      isbn: "",
      title: "",
      author: "",
      language: "",
      status: "free",
      newArrival: false,
      bookId: "",
      imageUrl: "",
      description: "",
      tags: [],
    });
  }, []);

  const startAddBook = useCallback(() => {
    resetDraft();
    setActionError(null);
    setActionMessage(null);
    setAdminMode("add");
  }, [resetDraft]);

  const startEditBook = useCallback((row: AdminBook) => {
    setOpenKey(null);
    setActionError(null);
    setActionMessage(null);
    setAdminDraft({
      key: row.key,
      descriptionId: row.id,
      isbn: row.isbn,
      title: row.title,
      author: row.author,
      language: row.language,
      status: row.status,
      newArrival: row.newArrival,
      bookId: row.bookId,
      imageUrl: row.imageUrl ?? "",
      description: row.description,
      tags: [...row.tags],
    });
    setAdminMode("edit");
  }, []);

  const loadFromRepoByIsbn = useCallback(async () => {
    const code = adminDraft.isbn.trim().replace(/\s+/g, "");
    if (code.length < 10) {
      setIsbnError("Enter a valid ISBN (at least 10 characters).");
      return;
    }
    setIsbnLoading(true);
    setIsbnError(null);
    try {
      const book = await fetchBookByIsbn(code);
      setAdminDraft((d) => ({
        ...d,
        title: book.title || d.title,
        author: book.author || d.author,
        imageUrl: book.image || d.imageUrl,
        description: book.description || d.description,
      }));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setIsbnError("ISBN not found in Open Library.");
      } else if (error instanceof ApiError && error.status === 401) {
        setIsbnError("Session expired. Please sign in again.");
      } else {
        setIsbnError("Could not fetch book data. Try again.");
      }
    } finally {
      setIsbnLoading(false);
    }
  }, [adminDraft.isbn]);

  const saveAdminDraft = useCallback(async () => {
    const isBook = section === "books";
    const isBoard = section === "board";
    const isPs = section === "ps";
    let tags = [...adminDraft.tags];
    if (isBook) {
      const lang = adminDraft.language.trim();
      if (lang && !tags.some((t) => t.toLowerCase() === lang.toLowerCase())) {
        tags.push(lang);
      }
    }

    // Validation: ISBN+title for books, title only for others
    if (isBook) {
      if (!adminDraft.isbn.trim() || !adminDraft.title.trim()) {
        setActionMessage(null);
        setActionError("ISBN and Title are required before saving.");
        return;
      }
    } else if (!adminDraft.title.trim()) {
      setActionMessage(null);
      setActionError("Title is required before saving.");
      return;
    }

    setAdminSaving(true);
    setActionError(null);
    setActionMessage(null);
    try {
      if (isBook) {
        const payload = {
          isbn: adminDraft.isbn.trim(),
          title: adminDraft.title.trim(),
          author: adminDraft.author.trim(),
          description: adminDraft.description.trim(),
          image: adminDraft.imageUrl.trim(),
          tags,
        };
        if (adminMode === "edit") {
          if (adminDraft.descriptionId == null) return;
          await updateBookDescription(adminDraft.descriptionId, payload);
        } else {
          const created = await createBookDescription(payload);
          // createdBookId not used further here
        }
      } else if (isBoard) {
        const payload = {
          title: adminDraft.title.trim(),
          description: adminDraft.description.trim(),
          numberOfPlayers: adminDraft.language
            ? parseInt(adminDraft.language, 10) || null
            : null,
          tags,
        };
        if (adminMode === "edit") {
          if (adminDraft.descriptionId == null) return;
          await updateBoardGameDescription(adminDraft.descriptionId, payload);
        } else {
          const created = await createBoardGameDescription(payload);
          setInstanceTargetKey(String(created.id));
        }
      } else if (isPs) {
        const payload = {
          title: adminDraft.title.trim(),
          description: adminDraft.description.trim(),
          tags,
        };
        if (adminMode === "edit") {
          if (adminDraft.descriptionId == null) return;
          await updatePSGameDescription(adminDraft.descriptionId, payload);
        } else {
          const created = await createPSGameDescription(payload);
          setInstanceTargetKey(`ps-${created.id}`);
        }
      }

      await loadCatalog();
      setAdminMode("browse");
      resetDraft();
      const typeLabel = isBoard ? "Board game" : isPs ? "PS game" : "Book";
      setActionMessage(
        adminMode === "edit"
          ? `${typeLabel} updated.`
          : `${typeLabel} created. Add its first instance.`,
      );
    } catch (error) {
      setActionMessage(null);
      if (error instanceof ApiError && error.status === 401) {
        setActionError("Session expired. Please sign in again.");
      } else {
        setActionError(
          `Could not save the ${isBoard ? "board game" : isPs ? "PS game" : "book"}. Check the fields and try again.`,
        );
      }
    } finally {
      setAdminSaving(false);
    }
  }, [adminDraft, adminMode, loadCatalog, resetDraft, section]);

  const addInstance = useCallback(async () => {
    const value = instanceInput.trim().toUpperCase();
    const isValidBoard = /^OC-WRO-G-[A-Z0-9]+$/.test(value);
    const isValidBook = /^OC-WRO-B-[A-Z0-9]+$/.test(value);
    const isValidPs = /^OC-WRO-PS-[A-Z0-9]+$/.test(value);
    if ((!isValidBook && !isValidBoard && !isValidPs) || !instanceTargetKey)
      return;

    const target =
      books.find((b) => b.key === instanceTargetKey) ||
      boardPreviewRows.find((b) => b.key === instanceTargetKey) ||
      psPreviewRows.find((b) => b.key === instanceTargetKey);
    if (!target) return;

    setActionError(null);
    try {
      await createItem({
        internalId: value,
        descriptionId: target.id,
        status: "AVAILABLE",
      });
      await loadCatalog();
      setInstanceInput("");
      setInstanceTargetKey(null);
    } catch {
      setActionError("Could not add this instance. Check if the ID is unique.");
    }
  }, [
    books,
    boardPreviewRows,
    psPreviewRows,
    instanceInput,
    instanceTargetKey,
    loadCatalog,
  ]);

  const openBorrowDialog = useCallback(async (book: AdminBook) => {
    setBorrowDialog({
      book,
      items: [],
      selectedInternalId: "",
      loading: true,
      submitting: false,
      error: null,
    });
    try {
      const items = await fetchItemsByDescription(book.id, "AVAILABLE");
      setBorrowDialog({
        book,
        items,
        selectedInternalId: items[0]?.internalId ?? "",
        loading: false,
        submitting: false,
        error:
          items.length === 0 ? "No available instances for this book." : null,
      });
    } catch {
      setBorrowDialog({
        book,
        items: [],
        selectedInternalId: "",
        loading: false,
        submitting: false,
        error: "Could not load available instances.",
      });
    }
  }, []);

  const openInstancesDialog = useCallback(async (book: AdminBook) => {
    setInstancesDialog({
      book,
      items: [],
      loading: true,
      error: null,
    });
    try {
      const items = await fetchItemsByDescription(book.id);
      setInstancesDialog({
        book,
        items,
        loading: false,
        error:
          items.length === 0 ? "No physical instances for this book." : null,
      });
    } catch {
      setInstancesDialog({
        book,
        items: [],
        loading: false,
        error: "Could not load instances.",
      });
    }
  }, []);

  const deleteBook = useCallback(
    async (book: AdminBook) => {
      if (!window.confirm(`Delete "${book.title}" and all its instances?`)) {
        return;
      }

      setActionError(null);
      setActionMessage(null);
      try {
        if (book.key.startsWith("board-")) {
          await deleteBoardGameDescription(book.id);
        } else if (book.key.startsWith("ps-")) {
          await deletePSGameDescription(book.id);
        } else {
          await deleteBookDescription(book.id);
        }
        await loadCatalog();
        setOpenKey(null);
        setActionMessage("Description deleted.");
      } catch {
        setActionError("Could not delete this description. Try again.");
      }
    },
    [loadCatalog],
  );

  const confirmBorrow = useCallback(async () => {
    if (!borrowDialog?.selectedInternalId) return;
    setBorrowDialog((state) =>
      state == null ? state : { ...state, submitting: true, error: null },
    );
    try {
      await borrowItem(borrowDialog.selectedInternalId);
      await loadCatalog();
      setBorrowDialog(null);
      setOpenKey(null);
    } catch {
      setBorrowDialog((state) =>
        state == null
          ? state
          : {
              ...state,
              submitting: false,
              error:
                "Could not borrow this instance. It may no longer be available.",
            },
      );
    }
  }, [borrowDialog, loadCatalog]);

  const returnBorrowedBook = useCallback(
    async (book: AdminBook) => {
      if (user == null) return;
      setActionError(null);
      try {
        const items = await fetchItemsByDescription(book.id);
        const borrowedByMe = items.find(
          (item) => item.status === "BORROWED" && item.borrower === user.email,
        );
        if (borrowedByMe == null) {
          setActionError(
            "Could not find your borrowed instance for this book.",
          );
          return;
        }
        await returnItem(borrowedByMe.internalId);
        await loadCatalog();
        setOpenKey(null);
      } catch {
        setActionError("Could not return this book. Try again.");
      }
    },
    [loadCatalog, user],
  );

  const openInstanceModalFromContext = useCallback(() => {
    if (!contextMenu) return;
    setContextMenu(null);
    setInstanceTargetKey(contextMenu.key);
  }, [contextMenu]);

  const findRowByKey = useCallback(
    (key: string) =>
      books.find((b) => b.key === key) ||
      boardPreviewRows.find((b) => b.key === key) ||
      psPreviewRows.find((b) => b.key === key),
    [books, boardPreviewRows, psPreviewRows],
  );

  const saveTagsForRow = useCallback(
    async (row: AdminBook, tags: string[]) => {
      const type = row.key.startsWith("board-")
        ? "BoardGame"
        : row.key.startsWith("ps-")
          ? "PSGame"
          : "Book";
      await updateDescriptionTags(type, row.id, tags);
      await loadCatalog();
    },
    [loadCatalog],
  );

  const openInstancesFromContext = useCallback(() => {
    if (!contextMenu) return;
    const row = findRowByKey(contextMenu.key);
    if (!row) return;
    setContextMenu(null);
    void openInstancesDialog(row);
  }, [contextMenu, findRowByKey, openInstancesDialog]);

  const startEditFromContext = useCallback(() => {
    if (!contextMenu) return;
    const row = findRowByKey(contextMenu.key);
    if (!row) return;
    setContextMenu(null);
    startEditBook(row);
  }, [contextMenu, findRowByKey, startEditBook]);

  const deleteFromContext = useCallback(() => {
    if (!contextMenu) return;
    const row = findRowByKey(contextMenu.key);
    if (!row) return;
    setContextMenu(null);
    void deleteBook(row);
  }, [contextMenu, deleteBook, findRowByKey]);

  const sidebarFiltersActive =
    selectedStatuses.length > 0 ||
    selectedLanguages.length > 0 ||
    selectedAuthors.length > 0 ||
    filterTags.length > 0;

  const toggleFilterTag = useCallback((tag: string) => {
    setFilterTags((prev) => {
      const exists = prev.some((p) => p.toLowerCase() === tag.toLowerCase());
      if (exists)
        return prev.filter((p) => p.toLowerCase() !== tag.toLowerCase());
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
    setCatalogSearchQuery("");
    setAuthorQuery("");
  }, []);

  const libraryStats = useMemo(
    () => ({
      totalRecords: books.length,
      borrowedRecords: books.filter((book) => book.status !== "free").length,
      borrowedThisWeek,
    }),
    [books, borrowedThisWeek],
  );

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
                  onClick={() => {
                    setSection("books");
                    startAddBook();
                  }}
                  className="rounded-lg bg-[#43485e] px-3 py-2 text-sm font-medium text-[#eeeef0] shadow-sm transition hover:bg-[#363b4f]"
                >
                  Add book
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSection("board");
                    startAddBook();
                  }}
                  className="rounded-lg bg-[#43485e] px-3 py-2 text-sm font-medium text-[#eeeef0] shadow-sm transition hover:bg-[#363b4f]"
                >
                  Add board game
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSection("ps");
                    startAddBook();
                  }}
                  className="rounded-lg bg-[#43485e] px-3 py-2 text-sm font-medium text-[#eeeef0] shadow-sm transition hover:bg-[#363b4f]"
                >
                  Add PS game
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
                      <span className="min-w-0 truncate font-medium">
                        {tag}
                      </span>
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
                        onChange={() =>
                          setSelectedStatuses((s) => toggleInList(s, status))
                        }
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
                    onClick={() =>
                      setSelectedLanguages((s) => toggleInList(s, lang))
                    }
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
                    <span className="min-w-0 truncate font-medium">
                      {author}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedAuthors((s) => s.filter((a) => a !== author))
                      }
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
                          onClick={() =>
                            setSelectedAuthors((s) => toggleInList(s, author))
                          }
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
        rightSidebar={<LayoutRightStaticPanel stats={libraryStats} />}
      >
        <div className="flex w-full flex-col gap-8">
          <CatalogHomeHeader
            allTags={catalogAllTags}
            selectedTags={filterTags}
            onToggleFilterTag={toggleFilterTag}
            section={section}
            onSectionChange={(next) => {
              setSection(next);
              setCatalogSearchQuery("");
            }}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            searchQuery={catalogSearchQuery}
            onSearchQueryChange={setCatalogSearchQuery}
            searchItems={searchItems}
            onSearchSelect={(key) => openBook(key)}
          />

          {actionError ? (
            <p className="rounded-xl border border-[#f3b4b4] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
              {actionError}
            </p>
          ) : null}
          {actionMessage ? (
            <p className="rounded-xl border border-[#b7d9bc] bg-[#eefbf0] px-4 py-3 text-sm text-[#166534]">
              {actionMessage}
            </p>
          ) : null}

          {section === "books" || section === "board" || section === "ps" ? (
            <div className="flex flex-col gap-4">
              {isAdmin && adminMode !== "browse" ? (
                <div className="rounded-2xl border border-[#b1b2b5]/80 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-semibold text-[#43485e]">
                    {adminMode === "add"
                      ? section === "board"
                        ? "Add new board game"
                        : section === "ps"
                          ? "Add new PS game"
                          : "Add new book"
                      : section === "board"
                        ? "Edit board game"
                        : section === "ps"
                          ? "Edit PS game"
                          : "Edit book"}
                  </h2>
                  <p className="mt-1 text-xs text-[#6b7289]">
                    {section === "books"
                      ? "Tip: First load data from ISBN, then you can correct the fields below. ISBN and Title are required; the rest are optional."
                      : "No autocomplete for this type. Title is required; rest optional. Cards use entity-specific fields (e.g. numberOfPlayers for board)."}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {section === "books" && (
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-[#43485e]">
                          ISBN <span className="text-[#b91c1c]">*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            value={adminDraft.isbn}
                            onChange={(e) => {
                              setAdminDraft((d) => ({
                                ...d,
                                isbn: e.target.value,
                              }));
                              if (isbnError) setIsbnError(null);
                            }}
                            className="w-full rounded-lg border border-[#b1b2b5] px-3 py-2 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => void loadFromRepoByIsbn()}
                            disabled={isbnLoading}
                            className="shrink-0 rounded-lg border border-[#43485e]/30 bg-[#eeeef0] px-3 py-2 text-sm font-medium text-[#43485e] disabled:opacity-60"
                          >
                            {isbnLoading ? "Loading…" : "Autofill from ISBN"}
                          </button>
                        </div>
                        {isbnError ? (
                          <p className="mt-1 text-sm text-[#b91c1c]">
                            {isbnError}
                          </p>
                        ) : null}
                      </div>
                    )}
                    {(section === "books"
                      ? ([
                          ["Title *", "title"],
                          ["Author", "author"],
                          ["Language", "language"],
                        ] as const)
                      : section === "board"
                        ? ([
                            ["Title *", "title"],
                            ["# Players (optional)", "language"],
                          ] as const)
                        : ([["Title *", "title"]] as const)
                    ).map(([label, field]) => (
                      <div key={field}>
                        <label className="mb-1 block text-sm font-medium text-[#43485e]">
                          {label}
                        </label>
                        <input
                          value={adminDraft[field]}
                          onChange={(e) =>
                            setAdminDraft((d) => ({
                              ...d,
                              [field]: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-[#b1b2b5] px-3 py-2 text-sm"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-[#43485e]">
                        Tags
                      </label>
                      <TagsInput
                        value={adminDraft.tags}
                        onChange={(tags) =>
                          setAdminDraft((d) => ({
                            ...d,
                            tags,
                          }))
                        }
                        suggestions={catalogAllTags}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-[#43485e]">
                        Description
                      </label>
                      <textarea
                        value={adminDraft.description}
                        onChange={(e) =>
                          setAdminDraft((d) => ({
                            ...d,
                            description: e.target.value,
                          }))
                        }
                        rows={4}
                        className="w-full rounded-lg border border-[#b1b2b5] px-3 py-2 text-sm"
                      />
                    </div>
                    {section === "books" && (
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-[#43485e]">
                          Image URL
                        </label>
                        <input
                          value={adminDraft.imageUrl}
                          onChange={(e) =>
                            setAdminDraft((d) => ({
                              ...d,
                              imageUrl: e.target.value,
                            }))
                          }
                          placeholder="https://..."
                          className="w-full rounded-lg border border-[#b1b2b5] px-3 py-2 text-sm"
                        />
                      </div>
                    )}
                    {section === "books" && (
                      <>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-[#43485e]">
                            Status
                          </label>
                          <select
                            value={adminDraft.status}
                            onChange={(e) =>
                              setAdminDraft((d) => ({
                                ...d,
                                status: e.target.value as BookStatus,
                              }))
                            }
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
                            onChange={(e) =>
                              setAdminDraft((d) => ({
                                ...d,
                                newArrival: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 rounded border-[#43485e]/40 text-[#43485e]"
                          />
                          Mark as new arrival
                        </label>
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={saveAdminDraft}
                      disabled={adminSaving}
                      className="rounded-lg bg-[#43485e] px-4 py-2 text-sm font-medium text-[#eeeef0]"
                    >
                      {adminSaving ? "Saving..." : "Save"}
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
              ) : catalogLoading ? (
                <p className="rounded-xl border border-dashed border-[#b1b2b5] bg-[#eeeef0]/60 px-4 py-8 text-center text-sm text-[#6b7289]">
                  Loading real catalog data...
                </p>
              ) : catalogError ? (
                <div className="rounded-xl border border-[#f3b4b4] bg-[#fef2f2] px-4 py-8 text-center text-sm text-[#b91c1c]">
                  <p>{catalogError}</p>
                  <button
                    type="button"
                    onClick={() => void loadCatalog()}
                    className="mt-3 rounded-lg bg-[#43485e] px-4 py-2 text-sm font-medium text-[#eeeef0]"
                  >
                    Retry
                  </button>
                </div>
              ) : displayRows.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#b1b2b5] bg-[#eeeef0]/60 px-4 py-8 text-center text-sm text-[#6b7289]">
                  No items match these filters. Try another category or clear
                  the filters on the left.
                </p>
              ) : catalogView === "cards" ? (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-[#43485e]">
                      Browse
                    </h2>
                    <CatalogViewToggle
                      mode={catalogView}
                      onModeChange={setCatalogView}
                    />
                  </div>
                  <ul className="grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                    {displayRows.map((row) => (
                      <li
                        key={row.key}
                        className="flex flex-col items-center gap-2"
                        onContextMenu={(e) => {
                          if (!isAdmin) return;
                          e.preventDefault();
                          setContextMenu({
                            key: row.key,
                            x: e.clientX,
                            y: e.clientY,
                          });
                        }}
                      >
                        <BookPreview
                          variant="card"
                          coverSrc={coverSrcFor(row)}
                          title={row.title}
                          author={row.author}
                          status={row.status}
                          newArrival={row.newArrival}
                          bookId={row.bookId}
                          onOpen={() => openBook(row.key)}
                        />
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-[#43485e]">
                      Browse
                    </h2>
                    <CatalogViewToggle
                      mode={catalogView}
                      onModeChange={setCatalogView}
                    />
                  </div>
                  <ul className="flex list-none flex-col gap-4">
                    {displayRows.map((row) => (
                      <li key={row.key} className="w-full">
                        <div
                          onContextMenu={(e) => {
                            if (!isAdmin) return;
                            e.preventDefault();
                            setContextMenu({
                              key: row.key,
                              x: e.clientX,
                              y: e.clientY,
                            });
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
                            description={row.description}
                            onOpen={() => openBook(row.key)}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : null}
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
              description={selected.description}
              bookId={selected.bookId}
              tags={selected.tags}
              status={selected.status}
              newArrival={selected.newArrival}
              onClose={close}
              onBorrow={
                selected.key.startsWith("ps-")
                  ? undefined
                  : () => void openBorrowDialog(selected)
              }
              onPing={
                selected.key.startsWith("ps-")
                  ? undefined
                  : () =>
                      setActionError(
                        "All copies are currently borrowed. Try again later.",
                      )
              }
              onReturn={
                selected.key.startsWith("ps-")
                  ? undefined
                  : () => void returnBorrowedBook(selected)
              }
              onEditTags={() => setTagsEditTarget(selected)}
              showPrimaryAction={!isAdmin && !selected.key.startsWith("ps-")}
              footerExtraActions={
                <>
                  {!selected.key.startsWith("ps-") && (
                    <button
                      type="button"
                      onClick={() => void openInstancesDialog(selected)}
                      className="w-44 rounded-2xl border border-[#43485e]/35 bg-[#eef0f6] px-6 py-3.5 text-base font-semibold text-[#3f465c] shadow-sm transition hover:bg-white"
                    >
                      View instances
                    </button>
                  )}
                  {isAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditBook(selected)}
                        className="w-44 rounded-2xl border border-[#43485e]/35 bg-[#eef0f6] px-6 py-3.5 text-base font-semibold text-[#3f465c] shadow-sm transition hover:bg-white"
                      >
                        Edit
                      </button>
                      {!selected.key.startsWith("ps-") && (
                        <button
                          type="button"
                          onClick={() => setInstanceTargetKey(selected.key)}
                          className="w-44 rounded-2xl border border-[#43485e]/35 bg-[#eef0f6] px-6 py-3.5 text-base font-semibold text-[#3f465c] shadow-sm transition hover:bg-white"
                        >
                          Add instance
                        </button>
                      )}
                      {selected.key.startsWith("ps-") &&
                        selected.bookId.trim().length === 0 && (
                          <button
                            type="button"
                            onClick={() => setInstanceTargetKey(selected.key)}
                            className="w-44 rounded-2xl border border-[#43485e]/35 bg-[#eef0f6] px-6 py-3.5 text-base font-semibold text-[#3f465c] shadow-sm transition hover:bg-white"
                          >
                            Add instance
                          </button>
                        )}
                      <button
                        type="button"
                        onClick={() => void deleteBook(selected)}
                        className="w-44 rounded-2xl border border-[#dc2626]/35 bg-[#fbe7e9] px-6 py-3.5 text-base font-semibold text-[#b4232a] shadow-sm transition hover:bg-[#fee2e2]"
                      >
                        Delete
                      </button>
                    </>
                  ) : null}
                </>
              }
              className="w-full"
            />
          </div>
        </BookClientWindow>
      )}
      {tagsEditTarget != null && (
        <EditTagsDialog
          title={tagsEditTarget.title}
          initialTags={tagsEditTarget.tags}
          allTagSuggestions={catalogAllTags}
          onClose={() => setTagsEditTarget(null)}
          onSave={(tags) => saveTagsForRow(tagsEditTarget, tags)}
        />
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
              onClick={openInstancesFromContext}
              className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-[#43485e] hover:bg-[#eeeef0]"
            >
              View instances
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
      {instancesDialog != null && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-lg rounded-xl border border-[#b1b2b5]/80 bg-white p-4 shadow-lg">
            <h3 className="text-base font-semibold text-[#43485e]">
              Book instances
            </h3>
            <p className="mt-1 text-sm text-[#6b7289]">
              {instancesDialog.book.title}
            </p>
            {instancesDialog.loading ? (
              <p className="mt-4 text-sm text-[#6b7289]">
                Loading instances...
              </p>
            ) : instancesDialog.error ? (
              <p className="mt-4 rounded-lg bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
                {instancesDialog.error}
              </p>
            ) : (
              <ul className="mt-4 flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
                {instancesDialog.items.map((item) => (
                  <li
                    key={item.internalId}
                    className="rounded-lg border border-[#b1b2b5]/80 bg-[#eeeef0] px-3 py-2 text-sm text-[#43485e]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono font-semibold">
                        {item.internalId}
                      </span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold">
                        {item.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    {item.borrower ? (
                      <p className="mt-1 text-xs text-[#6b7289]">
                        Borrower: {item.borrower}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setInstancesDialog(null)}
                className="rounded-md border border-[#43485e]/30 bg-[#eeeef0] px-3 py-1.5 text-sm text-[#43485e]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {borrowDialog != null && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-md rounded-xl border border-[#b1b2b5]/80 bg-white p-4 shadow-lg">
            <h3 className="text-base font-semibold text-[#43485e]">
              Choose an instance
            </h3>
            <p className="mt-1 text-sm text-[#6b7289]">
              {borrowDialog.book.title}
            </p>
            {borrowDialog.loading ? (
              <p className="mt-4 text-sm text-[#6b7289]">
                Loading available copies...
              </p>
            ) : borrowDialog.error ? (
              <p className="mt-4 rounded-lg bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
                {borrowDialog.error}
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {borrowDialog.items.map((item) => (
                  <label
                    key={item.internalId}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#b1b2b5]/80 bg-[#eeeef0] px-3 py-2 text-sm font-medium text-[#43485e]"
                  >
                    <input
                      type="radio"
                      name="borrow-instance"
                      value={item.internalId}
                      checked={
                        borrowDialog.selectedInternalId === item.internalId
                      }
                      onChange={() =>
                        setBorrowDialog((state) =>
                          state == null
                            ? state
                            : {
                                ...state,
                                selectedInternalId: item.internalId,
                              },
                        )
                      }
                    />
                    <span className="font-mono">{item.internalId}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBorrowDialog(null)}
                className="rounded-md border border-[#43485e]/30 bg-[#eeeef0] px-3 py-1.5 text-sm text-[#43485e]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmBorrow()}
                disabled={
                  borrowDialog.loading ||
                  borrowDialog.submitting ||
                  !borrowDialog.selectedInternalId
                }
                className="rounded-md bg-[#43485e] px-3 py-1.5 text-sm text-[#eeeef0] disabled:opacity-60"
              >
                {borrowDialog.submitting ? "Borrowing..." : "Borrow"}
              </button>
            </div>
          </div>
        </div>
      )}
      {instanceTargetKey != null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[#b1b2b5]/80 bg-white p-4 shadow-lg">
            <h3 className="text-base font-semibold text-[#43485e]">
              Add instance
            </h3>
            <p className="mt-1 text-xs text-[#6b7289]">
              {instanceTargetKey?.startsWith("ps-")
                ? "Use format: OC-WRO-PS-num"
                : instanceTargetKey?.startsWith("board-")
                  ? "Use format: OC-WRO-G-num"
                  : "Use format: OC-WRO-B-num"}
            </p>
            <input
              value={instanceInput}
              onChange={(e) => setInstanceInput(e.target.value)}
              placeholder={
                instanceTargetKey?.startsWith("ps-")
                  ? "OC-WRO-PS-0001"
                  : instanceTargetKey?.startsWith("board-")
                    ? "OC-WRO-G-0101"
                    : "OC-WRO-B-0109"
              }
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
