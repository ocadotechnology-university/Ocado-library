import { useCallback, useEffect, useId, useMemo, useState } from "react";
import Layout from "../components/Layout";
import {
  BOOK_LIST_COVER_FRAME_CLASS,
  BOOK_LIST_TEXT_CELL_CLASS,
} from "../components/UI/bookListLayout";
import CatalogAppTopBar from "../components/UI/CatalogAppTopBar";
import {
  SidebarAccentTitle,
  SidebarSectionLabel,
  SidebarTemplate,
  SidebarUserBlock,
} from "../components/UI/SidebarTemplate";
import { useAppChrome } from "../context/AppChromeContext";
import { useAuth } from "../context/AuthContext";
import {
  ApiError,
  fetchBookDescriptions,
  fetchJournalEntries,
  type BackendBookDescription,
  type JournalEntry,
  type JournalOperationType,
} from "../lib/api";

export type AccountSectionId = "history" | "borrowed" | "waiting";

type AdminStatusFilter =
  | "all"
  | "not-returned"
  | "returned"
  | "borrowed"
  | "waiting";

type HistoryRowKind = AccountSectionId | "log";

type UserOrderRow = {
  id: string;
  title: string;
  author: string;
  seed: string;
  description: string;
  eventDate: string;
  borrowedOn?: string;
  returnedOn?: string;
  userEmail?: string;
  instanceId?: string;
  operationType?: JournalOperationType | null;
  kind: HistoryRowKind;
};

const NAV: { id: AccountSectionId; label: string }[] = [
  { id: "history", label: "History" },
  { id: "borrowed", label: "Borrowed by me" },
  { id: "waiting", label: "Waiting for" },
];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function bookForEntry(
  entry: JournalEntry,
  booksById: Map<number, BackendBookDescription>,
): BackendBookDescription | undefined {
  if (entry.descriptionId == null) return undefined;
  return booksById.get(entry.descriptionId);
}

function eventRow(
  entry: JournalEntry,
  booksById: Map<number, BackendBookDescription>,
  kind: HistoryRowKind,
): UserOrderRow {
  const book = bookForEntry(entry, booksById);
  const fallback = entry.descriptionId ?? entry.itemId ?? entry.id;
  const title = book?.title ?? `Resource ${fallback}`;
  const author = book?.author ?? "Unknown author";
  return {
    id: String(entry.id),
    title,
    author,
    seed: `history-${book?.isbn ?? fallback}`,
    description: book?.description ?? "",
    eventDate: entry.datetime,
    borrowedOn:
      entry.operationType === "BORROW" ? formatDate(entry.datetime) : undefined,
    returnedOn:
      entry.operationType === "RETURN" ? formatDate(entry.datetime) : undefined,
    userEmail: entry.user,
    instanceId: entry.itemId ?? undefined,
    operationType: entry.operationType,
    kind,
  };
}

function buildBorrowedRows(
  entries: JournalEntry[],
  booksById: Map<number, BackendBookDescription>,
  currentUserEmail: string,
): UserOrderRow[] {
  const byItem = new Map<string, JournalEntry>();

  entries
    .filter(
      (entry) =>
        entry.itemId != null &&
        (entry.operationType === "BORROW" || entry.operationType === "RETURN"),
    )
    .sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    )
    .forEach((entry) => {
      if (entry.itemId == null) return;
      byItem.set(entry.itemId, entry);
    });

  return [...byItem.values()]
    .filter(
      (entry) =>
        entry.operationType === "BORROW" && entry.user === currentUserEmail,
    )
    .map((entry) => eventRow(entry, booksById, "borrowed"))
    .sort(
      (a, b) =>
        new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
    );
}

function buildHistoryRows(
  entries: JournalEntry[],
  booksById: Map<number, BackendBookDescription>,
  currentUserEmail: string,
): UserOrderRow[] {
  return entries
    .filter(
      (entry) =>
        entry.user === currentUserEmail &&
        (entry.operationType === "BORROW" || entry.operationType === "RETURN"),
    )
    .map((entry) => eventRow(entry, booksById, "history"))
    .sort(
      (a, b) =>
        new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
    );
}

function buildAdminRows(
  entries: JournalEntry[],
  booksById: Map<number, BackendBookDescription>,
): UserOrderRow[] {
  return entries
    .map((entry) => eventRow(entry, booksById, "log"))
    .sort(
      (a, b) =>
        new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
    );
}

function OrderDateLines({ row }: { row: UserOrderRow }) {
  const lineClass =
    "mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#5c6378] sm:mt-3 sm:gap-x-6 sm:text-sm";

  if (row.kind === "log") {
    return (
      <p className={lineClass}>
        <span>
          <span className="font-semibold text-[#43485e]">Operation:</span>{" "}
          {row.operationType ?? "UNKNOWN"}
        </span>
        <span>
          <span className="font-semibold text-[#43485e]">Date:</span>{" "}
          {formatDate(row.eventDate)}
        </span>
      </p>
    );
  }

  if (row.kind === "history") {
    return (
      <p className={lineClass}>
        <span>
          <span className="font-semibold text-[#43485e]">
            {row.operationType === "RETURN" ? "Returned:" : "Borrowed:"}
          </span>{" "}
          {formatDate(row.eventDate)}
        </span>
      </p>
    );
  }

  if (row.kind === "borrowed") {
    return (
      <p className={lineClass}>
        <span>
          <span className="font-semibold text-[#43485e]">Borrowed:</span>{" "}
          {row.borrowedOn ?? formatDate(row.eventDate)}
        </span>
      </p>
    );
  }

  return (
    <p className={lineClass}>
      <span>No waiting-list data is available yet.</span>
    </p>
  );
}

function OrderListRow({
  row,
  showUserMeta = false,
}: {
  row: UserOrderRow;
  showUserMeta?: boolean;
}) {
  const coverSrc = `https://picsum.photos/seed/${encodeURIComponent(row.seed)}/272/181`;

  return (
    <li className="list-none">
      <div className="flex w-full gap-4 rounded-xl border border-[#b1b2b5]/80 bg-white/95 p-2.5 shadow-sm sm:gap-5 sm:p-3">
        <div className={`${BOOK_LIST_COVER_FRAME_CLASS} rounded-lg`}>
          <img
            src={coverSrc}
            alt=""
            className="h-full w-full object-cover"
            width={272}
            height={181}
            loading="lazy"
          />
        </div>
        <div
          className={`${BOOK_LIST_TEXT_CELL_CLASS} min-h-[5rem] py-0.5 sm:min-h-[6rem]`}
        >
          <h3 className="line-clamp-2 text-base font-semibold text-[#43485e] sm:text-lg">
            {row.title}
          </h3>
          <p className="line-clamp-1 text-sm text-[#9e9eae]">{row.author}</p>
          {(showUserMeta || row.instanceId != null) && (
            <p className="mt-1 text-xs text-[#5c6378]">
              {showUserMeta && row.userEmail ? (
                <span className="font-semibold text-[#43485e]">
                  {row.userEmail}
                </span>
              ) : null}
              {showUserMeta && row.userEmail && row.instanceId ? " · " : null}
              {row.instanceId ? (
                <span className="font-mono">{row.instanceId}</span>
              ) : null}
            </p>
          )}
          {row.description.length > 0 && (
            <div className="mt-2 rounded-2xl border border-[#c5c9d6]/70 bg-white/70 p-3 shadow-[inset_0_1px_0_0_rgb(255_255_255_/0.85)] sm:mt-3 sm:p-4">
              <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b92a8] sm:text-[11px]">
                Description
              </h4>
              <p className="line-clamp-4 text-sm leading-relaxed text-[#3d4659] sm:line-clamp-5 sm:text-[0.9375rem]">
                {row.description}
              </p>
            </div>
          )}
          <OrderDateLines row={row} />
        </div>
      </div>
    </li>
  );
}

function AccountStatsSidebar({
  counts,
}: {
  counts: {
    borrowed: number;
    waiting: number;
    history: number;
    totalUsers: number;
  };
}) {
  const items: { id: string; label: string; sub: string }[] = [
    { id: "borrowed", label: String(counts.borrowed), sub: "Borrowed now" },
    { id: "waiting", label: String(counts.waiting), sub: "Waiting for" },
    { id: "history", label: String(counts.history), sub: "In history" },
    { id: "users", label: String(counts.totalUsers), sub: "Users involved" },
  ];
  return (
    <SidebarTemplate>
      <SidebarAccentTitle>Your totals</SidebarAccentTitle>
      <div className="flex flex-col gap-3 pt-1">
        {items.map(({ id, label, sub }) => (
          <div
            key={id}
            className="rounded-xl border border-[#b1b2b5]/80 bg-[#eeeef0]/95 px-4 py-4 text-center shadow-sm"
          >
            <p className="text-3xl font-bold tabular-nums text-[#43485e] sm:text-4xl">
              {label}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#6b7289]">
              {sub}
            </p>
          </div>
        ))}
      </div>
    </SidebarTemplate>
  );
}

const Account = () => {
  const titleId = useId();
  const searchId = useId();
  const { setNotificationsOpen } = useAppChrome();
  const { user, logout, isAdmin } = useAuth();
  const [section, setSection] = useState<AccountSectionId>("borrowed");
  const [findQuery, setFindQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [books, setBooks] = useState<BackendBookDescription[]>([]);

  const [personFilter, setPersonFilter] = useState("");
  const [bookFilter, setBookFilter] = useState("");
  const [instanceFilter, setInstanceFilter] = useState("");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [adminStatus, setAdminStatus] = useState<AdminStatusFilter>("all");

  const loadHistory = useCallback(async () => {
    if (user == null) return;
    setLoading(true);
    setError(null);
    try {
      const [catalog, entries] = await Promise.all([
        fetchBookDescriptions(),
        fetchJournalEntries(isAdmin ? {} : { user: user.email }),
      ]);
      setBooks(catalog);
      setJournal(entries);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Session expired. Please sign in again.");
      } else {
        setError("Could not load journal history from backend.");
      }
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const booksById = useMemo(
    () => new Map(books.map((book) => [book.id, book])),
    [books],
  );

  const borrowedRows = useMemo(
    () =>
      user == null ? [] : buildBorrowedRows(journal, booksById, user.email),
    [booksById, journal, user],
  );

  const historyRows = useMemo(
    () =>
      user == null ? [] : buildHistoryRows(journal, booksById, user.email),
    [booksById, journal, user],
  );

  const adminRows = useMemo(
    () => buildAdminRows(journal, booksById),
    [booksById, journal],
  );

  const counts = useMemo(() => {
    const source = isAdmin ? adminRows : [...borrowedRows, ...historyRows];
    return {
      borrowed: borrowedRows.length,
      waiting: 0,
      history: isAdmin ? adminRows.length : historyRows.length,
      totalUsers: new Set(source.map((row) => row.userEmail).filter(Boolean))
        .size,
    };
  }, [adminRows, borrowedRows, historyRows, isAdmin]);

  const rows = useMemo(() => {
    const q = findQuery.trim().toLowerCase();
    const baseRows = isAdmin
      ? adminRows
      : section === "borrowed"
        ? borrowedRows
        : section === "history"
          ? historyRows
          : [];

    return baseRows.filter((row) => {
      if (q.length > 0) {
        const text =
          `${row.title} ${row.author} ${row.description} ${row.userEmail ?? ""} ${row.instanceId ?? ""} ${row.operationType ?? ""}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      if (
        isAdmin &&
        personFilter.trim() &&
        !(row.userEmail ?? "")
          .toLowerCase()
          .includes(personFilter.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        isAdmin &&
        bookFilter.trim() &&
        !row.title.toLowerCase().includes(bookFilter.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        isAdmin &&
        instanceFilter.trim() &&
        !(row.instanceId ?? "")
          .toLowerCase()
          .includes(instanceFilter.trim().toLowerCase())
      ) {
        return false;
      }

      if (isAdmin) {
        if (adminStatus === "not-returned" && row.operationType !== "BORROW") {
          return false;
        }
        if (adminStatus === "returned" && row.operationType !== "RETURN") {
          return false;
        }
        if (adminStatus === "borrowed" && row.operationType !== "BORROW") {
          return false;
        }
        if (adminStatus === "waiting") return false;
      }

      const fromDate = parseDate(periodFrom || undefined);
      const toDate = parseDate(periodTo || undefined);
      const rowDate = parseDate(row.eventDate);
      if (fromDate && rowDate && rowDate < fromDate) return false;
      if (toDate && rowDate && rowDate > toDate) return false;
      return true;
    });
  }, [
    adminRows,
    adminStatus,
    bookFilter,
    borrowedRows,
    findQuery,
    historyRows,
    instanceFilter,
    isAdmin,
    periodFrom,
    periodTo,
    personFilter,
    section,
  ]);

  const onNav = useCallback((id: AccountSectionId) => setSection(id), []);

  const leftSidebar = useMemo(
    () => (
      <SidebarTemplate>
        <div className="flex flex-col gap-3">
          <SidebarUserBlock email={user?.email ?? "unknown@ocado.com"} />
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(false);
              logout();
            }}
            className="rounded-lg border border-[#43485e]/35 bg-[#eeeef0] px-3 py-2 text-sm font-semibold text-[#43485e] shadow-sm transition hover:bg-white"
          >
            Log out
          </button>

          {isAdmin ? (
            <>
              <SidebarAccentTitle>Admin history</SidebarAccentTitle>
              <SidebarSectionLabel>Person</SidebarSectionLabel>
              <input
                value={personFilter}
                onChange={(e) => setPersonFilter(e.target.value)}
                placeholder="Filter by user email..."
                className="rounded-lg border border-[#b1b2b5] bg-white px-2.5 py-2 text-sm"
              />
              <SidebarSectionLabel>Book</SidebarSectionLabel>
              <input
                value={bookFilter}
                onChange={(e) => setBookFilter(e.target.value)}
                placeholder="Filter by book title..."
                className="rounded-lg border border-[#b1b2b5] bg-white px-2.5 py-2 text-sm"
              />
              <SidebarSectionLabel>Book instance</SidebarSectionLabel>
              <input
                value={instanceFilter}
                onChange={(e) => setInstanceFilter(e.target.value)}
                placeholder="OC-WRO-B-..."
                className="rounded-lg border border-[#b1b2b5] bg-white px-2.5 py-2 text-sm"
              />
              <SidebarSectionLabel>Period from</SidebarSectionLabel>
              <input
                type="date"
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
                className="rounded-lg border border-[#b1b2b5] bg-white px-2.5 py-2 text-sm"
              />
              <SidebarSectionLabel>Period to</SidebarSectionLabel>
              <input
                type="date"
                value={periodTo}
                onChange={(e) => setPeriodTo(e.target.value)}
                className="rounded-lg border border-[#b1b2b5] bg-white px-2.5 py-2 text-sm"
              />
              <SidebarSectionLabel>Status</SidebarSectionLabel>
              <select
                value={adminStatus}
                onChange={(e) =>
                  setAdminStatus(e.target.value as AdminStatusFilter)
                }
                className="rounded-lg border border-[#b1b2b5] bg-white px-2.5 py-2 text-sm"
              >
                <option value="all">All logs</option>
                <option value="not-returned">Borrow logs</option>
                <option value="returned">Return logs</option>
                <option value="borrowed">Borrowed now</option>
                <option value="waiting">Waiting</option>
              </select>
            </>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4a5060]">
                Categories
              </p>
              <nav
                className="flex flex-col gap-2.5"
                aria-label="Account sections"
              >
                {NAV.map(({ id, label }) => {
                  const on = section === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onNav(id)}
                      className={[
                        "rounded-xl border px-4 py-3.5 text-left text-base font-semibold transition sm:py-4",
                        on
                          ? "border-[#43485e] bg-[#43485e] text-[#eeeef0] shadow-md"
                          : "border-[#b1b2b5]/80 bg-[#dcdfe6] text-[#43485e] shadow-sm hover:bg-[#e8eaf0]",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  );
                })}
              </nav>
            </>
          )}
        </div>
      </SidebarTemplate>
    ),
    [
      adminStatus,
      bookFilter,
      instanceFilter,
      isAdmin,
      logout,
      onNav,
      periodFrom,
      periodTo,
      personFilter,
      section,
      setNotificationsOpen,
      user?.email,
    ],
  );

  return (
    <Layout
      topBar={<CatalogAppTopBar />}
      leftSidebar={leftSidebar}
      rightSidebar={<AccountStatsSidebar counts={counts} />}
    >
      <h1 id={titleId} className="sr-only">
        {isAdmin ? "All users history" : "My loans and holds"}
      </h1>
      <div className="flex w-full flex-col gap-6">
        <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#6b7289] sm:text-base">
            {isAdmin
              ? "All journal logs"
              : NAV.find((n) => n.id === section)?.label}
          </p>
          <div className="w-full sm:max-w-md sm:flex-1 sm:pl-4 lg:max-w-lg">
            <label htmlFor={searchId} className="sr-only">
              Find in this list
            </label>
            <input
              id={searchId}
              type="search"
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
              placeholder={
                isAdmin
                  ? "Find user, book, instance..."
                  : "Find title or author…"
              }
              autoComplete="off"
              className="w-full rounded-xl border border-[#b1b2b5] bg-white px-4 py-3 text-base text-[#43485e] shadow-sm outline-none ring-[#43485e]/20 placeholder:text-[#9e9eae] focus:border-[#43485e]/50 focus:ring-2"
            />
          </div>
        </div>

        {loading ? (
          <p className="rounded-2xl border border-dashed border-[#b1b2b5] bg-white/60 px-4 py-14 text-center text-base text-[#6b7289]">
            Loading real journal history...
          </p>
        ) : error ? (
          <div className="rounded-2xl border border-[#f3b4b4] bg-[#fef2f2] px-4 py-10 text-center text-sm text-[#b91c1c]">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadHistory()}
              className="mt-3 rounded-lg bg-[#43485e] px-4 py-2 text-sm font-medium text-[#eeeef0]"
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#b1b2b5] bg-white/60 px-4 py-14 text-center text-base text-[#6b7289]">
            {findQuery.trim().length > 0
              ? "No matches — try another word."
              : section === "waiting"
                ? "Waiting list is not implemented in backend yet."
                : "Nothing here yet."}
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {rows.map((row) => (
              <OrderListRow key={row.id} row={row} showUserMeta={isAdmin} />
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default Account;
