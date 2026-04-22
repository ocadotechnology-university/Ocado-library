import { useCallback, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import BookClientWindow from "../components/UI/BookClientWindow";
import BookFullView from "../components/UI/BookFullView";
import type { BookStatus } from "../components/UI/BookPreview";
import { BOOK_DESCRIPTION, findCatalogBook } from "../catalogue/demoCatalog";
import {
  BOOK_LIST_COVER_FRAME_CLASS,
  BOOK_LIST_TEXT_CELL_CLASS,
} from "../components/UI/bookListLayout";
import CatalogAppTopBar from "../components/UI/CatalogAppTopBar";
import {
  SidebarAccentTitle,
  SidebarSectionLabel,
  SidebarUserBlock,
  SidebarTemplate,
} from "../components/UI/SidebarTemplate";
import { useAppChrome } from "../context/AppChromeContext";
import { useAuth } from "../context/AuthContext";

export type AccountSectionId = "history" | "borrowed" | "waiting";
type AdminStatusFilter =
  | "all"
  | "not-returned"
  | "returned"
  | "borrowed"
  | "waiting";

export type UserOrderRow = {
  id: string;
  catalogKey: string;
  title: string;
  author: string;
  seed: string;
  description: string;
  borrowedOn: string;
  dueOn?: string;
  returnedOn?: string;
  queuePosition?: number;
  requestedOn?: string;
  userEmail?: string;
  instanceId?: string;
  kind: AccountSectionId;
};

const NAV: { id: AccountSectionId; label: string }[] = [
  { id: "history", label: "History" },
  { id: "borrowed", label: "Borrowed by me" },
  { id: "waiting", label: "Waiting for" },
];

const DEMO_ORDERS: Record<AccountSectionId, UserOrderRow[]> = {
  borrowed: [
    {
      id: "b1",
      catalogKey: "rust-senior",
      title: "The Rust Programming Language",
      author: "Steve Klabnik",
      seed: "rust-senior",
      description: BOOK_DESCRIPTION,
      borrowedOn: "12 Mar 2026",
      dueOn: "18 Apr 2026",
      userEmail: "jane.smith@ocado.com",
      instanceId: "OC-WRO-B-0105",
      kind: "borrowed",
    },
    {
      id: "b2",
      catalogKey: "js-junior",
      title: "You Don't Know JS Yet",
      author: "Kyle Simpson",
      seed: "js-junior",
      description: BOOK_DESCRIPTION,
      borrowedOn: "28 Feb 2026",
      dueOn: "2 May 2026",
      userEmail: "jane.smith@ocado.com",
      instanceId: "OC-WRO-B-0106",
      kind: "borrowed",
    },
  ],
  waiting: [
    {
      id: "w1",
      catalogKey: "go-junior",
      title: "The Go Programming Language",
      author: "Alan Donovan",
      seed: "go-junior",
      description: BOOK_DESCRIPTION,
      borrowedOn: "",
      requestedOn: "20 Feb 2026",
      queuePosition: 3,
      userEmail: "jane.smith@ocado.com",
      instanceId: "OC-WRO-B-0103",
      kind: "waiting",
    },
    {
      id: "w2",
      catalogKey: "java-middle",
      title: "Effective Java",
      author: "Joshua Bloch",
      seed: "java-middle",
      description: BOOK_DESCRIPTION,
      borrowedOn: "",
      requestedOn: "8 Mar 2026",
      queuePosition: 7,
      userEmail: "jane.smith@ocado.com",
      instanceId: "OC-WRO-B-0104",
      kind: "waiting",
    },
    {
      id: "w3",
      catalogKey: "c-junior",
      title: "Modern C",
      author: "Jens Gustedt",
      seed: "c-junior",
      description: BOOK_DESCRIPTION,
      borrowedOn: "",
      requestedOn: "15 Mar 2026",
      queuePosition: 12,
      userEmail: "jane.smith@ocado.com",
      instanceId: "OC-WRO-B-0108",
      kind: "waiting",
    },
  ],
  history: [
    {
      id: "h1",
      catalogKey: "go-junior",
      title: "The Go Programming Language",
      author: "Alan Donovan",
      seed: "go-junior",
      description: BOOK_DESCRIPTION,
      borrowedOn: "3 Jan 2026",
      returnedOn: "1 Mar 2026",
      userEmail: "jane.smith@ocado.com",
      instanceId: "OC-WRO-B-0103",
      kind: "history",
    },
    {
      id: "h2",
      catalogKey: "ts-senior",
      title: "TypeScript Deep Dive",
      author: "Basarat Ali Syed",
      seed: "ts-senior",
      description: BOOK_DESCRIPTION,
      borrowedOn: "12 Dec 2025",
      returnedOn: "14 Feb 2026",
      userEmail: "jane.smith@ocado.com",
      instanceId: "OC-WRO-B-0101",
      kind: "history",
    },
    {
      id: "h3",
      catalogKey: "py-middle",
      title: "Fluent Python",
      author: "Luciano Ramalho",
      seed: "py-middle",
      description: BOOK_DESCRIPTION,
      borrowedOn: "2 Nov 2025",
      returnedOn: "8 Jan 2026",
      userEmail: "jane.smith@ocado.com",
      instanceId: "OC-WRO-B-0102",
      kind: "history",
    },
    {
      id: "h4",
      catalogKey: "rust-senior",
      title: "The Rust Programming Language",
      author: "Steve Klabnik",
      seed: "rust-senior",
      description: BOOK_DESCRIPTION,
      borrowedOn: "18 Oct 2025",
      returnedOn: "20 Dec 2025",
      userEmail: "jane.smith@ocado.com",
      instanceId: "OC-WRO-B-0105",
      kind: "history",
    },
  ],
};

const ADMIN_EXTRA_ROWS: UserOrderRow[] = [
  {
    id: "ax1",
    catalogKey: "ddia-senior",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    seed: "ddia-senior",
    description: BOOK_DESCRIPTION,
    borrowedOn: "2 Apr 2026",
    dueOn: "4 May 2026",
    userEmail: "adam.nowak@ocado.com",
    instanceId: "OC-WRO-B-0107",
    kind: "borrowed",
  },
  {
    id: "ax2",
    catalogKey: "java-middle",
    title: "Effective Java",
    author: "Joshua Bloch",
    seed: "java-middle",
    description: BOOK_DESCRIPTION,
    borrowedOn: "15 Jan 2026",
    returnedOn: "20 Mar 2026",
    userEmail: "monika.kowalska@ocado.com",
    instanceId: "OC-WRO-B-0104",
    kind: "history",
  },
  {
    id: "ax3",
    catalogKey: "py-middle",
    title: "Fluent Python",
    author: "Luciano Ramalho",
    seed: "py-middle",
    description: BOOK_DESCRIPTION,
    borrowedOn: "",
    requestedOn: "7 Apr 2026",
    queuePosition: 2,
    userEmail: "piotr.wisniewski@ocado.com",
    instanceId: "OC-WRO-B-0102",
    kind: "waiting",
  },
];

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function OrderDateLines({ row }: { row: UserOrderRow }) {
  const lineClass =
    "mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#5c6378] sm:mt-3 sm:gap-x-6 sm:text-sm";
  if (row.kind === "history") {
    return (
      <p className={lineClass}>
        <span>
          <span className="font-semibold text-[#43485e]">Borrowed:</span>{" "}
          {row.borrowedOn}
        </span>
        <span>
          <span className="font-semibold text-[#43485e]">Returned:</span>{" "}
          {row.returnedOn}
        </span>
      </p>
    );
  }
  if (row.kind === "borrowed") {
    return (
      <p className={lineClass}>
        <span>
          <span className="font-semibold text-[#43485e]">Borrowed:</span>{" "}
          {row.borrowedOn}
        </span>
        <span>
          <span className="font-semibold text-[#43485e]">Due:</span> {row.dueOn}
        </span>
      </p>
    );
  }
  return (
    <p className={lineClass}>
      <span>
        <span className="font-semibold text-[#43485e]">Reserved:</span>{" "}
        {row.requestedOn}
      </span>
      <span>
        <span className="font-semibold text-[#43485e]">Queue:</span> #
        {row.queuePosition}
      </span>
    </p>
  );
}

function OrderListRow({
  row,
  onOpenBookDetail,
  showUserMeta = false,
}: {
  row: UserOrderRow;
  onOpenBookDetail?: (catalogKey: string) => void;
  showUserMeta?: boolean;
}) {
  const coverSrc = `https://picsum.photos/seed/${row.seed}/272/181`;
  const interactive = onOpenBookDetail != null;

  const inner = (
    <>
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
        {showUserMeta && (
          <p className="mt-1 text-xs text-[#5c6378]">
            <span className="font-semibold text-[#43485e]">
              {row.userEmail}
            </span>
            {row.instanceId ? <> · {row.instanceId}</> : null}
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
    </>
  );

  return (
    <li className="list-none">
      {interactive ? (
        <button
          type="button"
          className="flex w-full gap-4 rounded-xl border border-[#b1b2b5]/80 bg-white/95 p-2.5 text-left shadow-sm transition hover:brightness-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e] sm:gap-5 sm:p-3"
          onClick={() => onOpenBookDetail!(row.catalogKey)}
        >
          {inner}
        </button>
      ) : (
        <div className="flex w-full gap-4 rounded-xl border border-[#b1b2b5]/80 bg-white/95 p-2.5 shadow-sm sm:gap-5 sm:p-3">
          {inner}
        </div>
      )}
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
  const navigate = useNavigate();
  const titleId = useId();
  const searchId = useId();
  const { setNotificationsOpen } = useAppChrome();
  const { user, logout, isAdmin } = useAuth();
  const [section, setSection] = useState<AccountSectionId>("borrowed");
  const [findQuery, setFindQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  // Admin filter state
  const [personFilter, setPersonFilter] = useState("");
  const [bookFilter, setBookFilter] = useState("");
  const [instanceFilter, setInstanceFilter] = useState("");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [adminStatus, setAdminStatus] = useState<AdminStatusFilter>("all");
  const [adminBookStatuses, setAdminBookStatuses] = useState<
    Record<string, BookStatus>
  >({});
  const [hiddenCatalogKeys, setHiddenCatalogKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [instanceTargetKey, setInstanceTargetKey] = useState<string | null>(
    null,
  );
  const [instanceInput, setInstanceInput] = useState("");

  const allRows = useMemo(() => {
    return [
      ...DEMO_ORDERS.borrowed,
      ...DEMO_ORDERS.waiting,
      ...DEMO_ORDERS.history,
      ...ADMIN_EXTRA_ROWS,
    ];
  }, []);

  const counts = useMemo(() => {
    const source = isAdmin
      ? allRows
      : [
          ...DEMO_ORDERS.borrowed,
          ...DEMO_ORDERS.waiting,
          ...DEMO_ORDERS.history,
        ];
    return {
      borrowed: source.filter((r) => r.kind === "borrowed").length,
      waiting: source.filter((r) => r.kind === "waiting").length,
      history: source.filter((r) => r.kind === "history").length,
      totalUsers: new Set(source.map((r) => r.userEmail).filter(Boolean)).size,
    };
  }, [isAdmin, allRows]);

  const rows = useMemo(() => {
    const q = findQuery.trim().toLowerCase();
    if (!isAdmin) {
      const all = DEMO_ORDERS[section];
      if (q.length === 0) return all;
      return all.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.author.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q),
      );
    }

    return allRows.filter((r) => {
      if (hiddenCatalogKeys.has(r.catalogKey)) return false;
      if (q.length > 0) {
        const text =
          `${r.title} ${r.author} ${r.description} ${r.userEmail ?? ""} ${r.instanceId ?? ""}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      if (
        personFilter.trim() &&
        !(r.userEmail ?? "")
          .toLowerCase()
          .includes(personFilter.trim().toLowerCase())
      )
        return false;
      if (
        bookFilter.trim() &&
        !r.title.toLowerCase().includes(bookFilter.trim().toLowerCase())
      )
        return false;
      if (
        instanceFilter.trim() &&
        !(r.instanceId ?? "")
          .toLowerCase()
          .includes(instanceFilter.trim().toLowerCase())
      )
        return false;

      if (adminStatus === "not-returned" && r.kind === "history") return false;
      if (adminStatus === "returned" && r.kind !== "history") return false;
      if (adminStatus === "borrowed" && r.kind !== "borrowed") return false;
      if (adminStatus === "waiting" && r.kind !== "waiting") return false;

      const fromDate = parseDate(periodFrom || undefined);
      const toDate = parseDate(periodTo || undefined);
      const rowDate = parseDate(r.borrowedOn || r.requestedOn);
      if (fromDate && rowDate && rowDate < fromDate) return false;
      if (toDate && rowDate && rowDate > toDate) return false;
      return true;
    });
  }, [
    isAdmin,
    section,
    findQuery,
    allRows,
    personFilter,
    bookFilter,
    instanceFilter,
    adminStatus,
    periodFrom,
    periodTo,
    hiddenCatalogKeys,
  ]);

  const onNav = useCallback((id: AccountSectionId) => setSection(id), []);

  const openBookDetail = useCallback(
    (catalogKey: string) => {
      setNotificationsOpen(false);
      setOpenKey(catalogKey);
    },
    [setNotificationsOpen],
  );

  const closeBook = useCallback(() => setOpenKey(null), []);
  const selected = openKey != null ? findCatalogBook(openKey) : undefined;
  const selectedStatus = selected
    ? (adminBookStatuses[selected.key] ?? selected.status)
    : "free";

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
                <option value="all">All</option>
                <option value="not-returned">Not returned</option>
                <option value="returned">Returned</option>
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
      user?.email,
      section,
      onNav,
      setNotificationsOpen,
      logout,
      isAdmin,
      personFilter,
      bookFilter,
      instanceFilter,
      periodFrom,
      periodTo,
      adminStatus,
    ],
  );

  return (
    <>
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
                ? "All users history"
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
          {rows.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#b1b2b5] bg-white/60 px-4 py-14 text-center text-base text-[#6b7289]">
              {findQuery.trim().length > 0
                ? "No matches — try another word."
                : "Nothing here yet."}
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {rows.map((row) => (
                <OrderListRow
                  key={row.id}
                  row={row}
                  onOpenBookDetail={openBookDetail}
                  showUserMeta={isAdmin}
                />
              ))}
            </ul>
          )}
        </div>
      </Layout>
      {selected != null && (
        <BookClientWindow onBackdropClick={closeBook}>
          <BookFullView
            coverSrc={`https://picsum.photos/seed/${selected.seed}/272/181`}
            coverSrcLarge={`https://picsum.photos/seed/${selected.seed}/640/960`}
            title={selected.title}
            author={selected.author}
            description={BOOK_DESCRIPTION}
            bookId={selected.bookId}
            tags={selected.tags}
            status={selectedStatus}
            newArrival={selected.newArrival}
            onClose={closeBook}
            onBorrow={() => {}}
            onPing={() => {}}
            onReturn={() => {}}
            onEditTags={() => {}}
            showPrimaryAction={!isAdmin}
            footerExtraActions={
              isAdmin ? (
                <>
                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setAdminBookStatuses((prev) => ({
                        ...prev,
                        [selected.key]: e.target.value as BookStatus,
                      }))
                    }
                    className="w-44 rounded-2xl border border-[#43485e]/35 bg-[#eef0f6] px-4 py-3.5 text-base font-semibold text-[#3f465c] shadow-sm"
                  >
                    <option value="free">Available</option>
                    <option value="borrowed">Borrowed</option>
                    <option value="borrowed-by-me">Borrowed by me</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => navigate("/")}
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
                    onClick={() => {
                      if (
                        !window.confirm(
                          "Delete this book from admin history view?",
                        )
                      )
                        return;
                      setHiddenCatalogKeys((prev) =>
                        new Set(prev).add(selected.key),
                      );
                      setOpenKey(null);
                    }}
                    className="w-44 rounded-2xl border border-[#dc2626]/35 bg-[#fbe7e9] px-6 py-3.5 text-base font-semibold text-[#b4232a] shadow-sm transition hover:bg-[#fee2e2]"
                  >
                    Delete
                  </button>
                </>
              ) : null
            }
            className="w-full"
          />
        </BookClientWindow>
      )}
      {instanceTargetKey != null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[#b1b2b5]/80 bg-white p-4 shadow-lg">
            <h3 className="text-base font-semibold text-[#43485e]">
              Add instance
            </h3>
            <p className="mt-1 text-xs text-[#6b7289]">
              Use format: OC-WRO-B-num
            </p>
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
                onClick={() => {
                  setInstanceTargetKey(null);
                  setInstanceInput("");
                }}
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

export default Account;
