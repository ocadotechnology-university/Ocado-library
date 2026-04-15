import { useCallback, useId, useMemo, useState } from "react";
import Layout from "../components/Layout";
import BookClientWindow from "../components/UI/BookClientWindow";
import BookFullView from "../components/UI/BookFullView";
import { BOOK_DESCRIPTION, findCatalogBook } from "../catalogue/demoCatalog";
import { BOOK_LIST_COVER_FRAME_CLASS, BOOK_LIST_TEXT_CELL_CLASS } from "../components/UI/bookListLayout";
import CatalogAppTopBar from "../components/UI/CatalogAppTopBar";
import { SidebarAccentTitle, SidebarUserBlock, SidebarTemplate } from "../components/UI/SidebarTemplate";
import { useAppChrome } from "../context/AppChromeContext";

export type AccountSectionId = "history" | "borrowed" | "waiting";

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
    },
  ],
};

function OrderDateLines({ row, section }: { row: UserOrderRow; section: AccountSectionId }) {
  const lineClass = "mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#5c6378] sm:mt-3 sm:gap-x-6 sm:text-sm";
  if (section === "history") {
    return (
      <p className={lineClass}>
        <span>
          <span className="font-semibold text-[#43485e]">Borrowed:</span> {row.borrowedOn}
        </span>
        <span>
          <span className="font-semibold text-[#43485e]">Returned:</span> {row.returnedOn}
        </span>
      </p>
    );
  }
  if (section === "borrowed") {
    return (
      <p className={lineClass}>
        <span>
          <span className="font-semibold text-[#43485e]">Borrowed:</span> {row.borrowedOn}
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
        <span className="font-semibold text-[#43485e]">Reserved:</span> {row.requestedOn}
      </span>
      <span>
        <span className="font-semibold text-[#43485e]">Queue:</span> #{row.queuePosition}
      </span>
    </p>
  );
}

function OrderListRow({
  row,
  section,
  onOpenBookDetail,
}: {
  row: UserOrderRow;
  section: AccountSectionId;
  onOpenBookDetail?: (catalogKey: string) => void;
}) {
  const coverSrc = `https://picsum.photos/seed/${row.seed}/272/181`;
  const interactive = onOpenBookDetail != null;

  const inner = (
    <>
      <div className={`${BOOK_LIST_COVER_FRAME_CLASS} rounded-lg`}>
        <img src={coverSrc} alt="" className="h-full w-full object-cover" width={272} height={181} loading="lazy" />
      </div>
      <div className={`${BOOK_LIST_TEXT_CELL_CLASS} min-h-[5rem] py-0.5 sm:min-h-[6rem]`}>
        <h3 className="line-clamp-2 text-base font-semibold text-[#43485e] sm:text-lg">{row.title}</h3>
        <p className="line-clamp-1 text-sm text-[#9e9eae]">{row.author}</p>
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
        <OrderDateLines row={row} section={section} />
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

function AccountStatsSidebar({ counts }: { counts: Record<AccountSectionId, number> }) {
  const items: { id: AccountSectionId; label: string; sub: string }[] = [
    { id: "borrowed", label: String(counts.borrowed), sub: "Borrowed now" },
    { id: "waiting", label: String(counts.waiting), sub: "Waiting for" },
    { id: "history", label: String(counts.history), sub: "In history" },
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
            <p className="text-3xl font-bold tabular-nums text-[#43485e] sm:text-4xl">{label}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#6b7289]">{sub}</p>
          </div>
        ))}
      </div>
    </SidebarTemplate>
  );
}

const Account = ({ email = "jane.smith@ocado.com" }: { email?: string }) => {
  const titleId = useId();
  const searchId = useId();
  const { setNotificationsOpen } = useAppChrome();
  const [section, setSection] = useState<AccountSectionId>("borrowed");
  const [findQuery, setFindQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      borrowed: DEMO_ORDERS.borrowed.length,
      waiting: DEMO_ORDERS.waiting.length,
      history: DEMO_ORDERS.history.length,
    }),
    [],
  );

  const rows = useMemo(() => {
    const all = DEMO_ORDERS[section];
    const q = findQuery.trim().toLowerCase();
    if (q.length === 0) return all;
    return all.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q),
    );
  }, [section, findQuery]);

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

  const leftSidebar = useMemo(
    () => (
      <SidebarTemplate>
        <div className="flex flex-col gap-3">
          <SidebarUserBlock email={email} />
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4a5060]">Categories</p>
          <nav className="flex flex-col gap-2.5" aria-label="Account sections">
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
        </div>
      </SidebarTemplate>
    ),
    [email, section, onNav],
  );

  return (
    <>
      <Layout
        topBar={<CatalogAppTopBar />}
        leftSidebar={leftSidebar}
        rightSidebar={<AccountStatsSidebar counts={counts} />}
      >
        <h1 id={titleId} className="sr-only">
          My loans and holds
        </h1>
        <div className="flex w-full flex-col gap-6">
          <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#6b7289] sm:text-base">
              {NAV.find((n) => n.id === section)?.label}
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
                placeholder="Find title or author…"
                autoComplete="off"
                className="w-full rounded-xl border border-[#b1b2b5] bg-white px-4 py-3 text-base text-[#43485e] shadow-sm outline-none ring-[#43485e]/20 placeholder:text-[#9e9eae] focus:border-[#43485e]/50 focus:ring-2"
              />
            </div>
          </div>
          {rows.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#b1b2b5] bg-white/60 px-4 py-14 text-center text-base text-[#6b7289]">
              {findQuery.trim().length > 0 ? "No matches — try another word." : "Nothing here yet."}
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {rows.map((row) => (
                <OrderListRow key={row.id} row={row} section={section} onOpenBookDetail={openBookDetail} />
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
            status={selected.status}
            newArrival={selected.newArrival}
            onClose={closeBook}
            onBorrow={() => {}}
            onPing={() => {}}
            onReturn={() => {}}
            onEditTags={() => {}}
            className="w-full"
          />
        </BookClientWindow>
      )}
    </>
  );
};

export default Account;
