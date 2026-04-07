import { useCallback, useMemo, useState } from "react";
import Layout from "../components/Layout";
import BookFullView from "../components/UI/BookFullView";
import BookPreview from "../components/UI/BookPreview";
import type { BookStatus } from "../components/UI/BookPreview";
import CatalogHomeHeader from "../components/UI/CatalogHomeHeader";
import type { MediaSection } from "../components/UI/CatalogHomeHeader";
import TopBar from "../components/UI/TopBar";
import UserInfoPanel from "../components/UI/UserInfoPanel";
import { SidebarAccentTitle, SidebarFilterRow, SidebarTemplate } from "../components/UI/SidebarTemplate";

const leftSidebar = (
  <SidebarTemplate>
    <SidebarAccentTitle>Categories</SidebarAccentTitle>
    <div className="flex flex-col gap-2">
      <SidebarFilterRow label="Fiction literature" />
      <SidebarFilterRow label="Genre literature" />
      <SidebarFilterRow label="Non-fiction" />
    </div>
  </SidebarTemplate>
);

const DESCRIPTION =
  "Between life and death there is a library, and within that library, the shelves go on for ever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices. Would you have done anything differently, if you had the chance to undo your regrets?";

type BookRow = {
  key: string;
  status: BookStatus;
  newArrival: boolean;
  caption: string;
  seed: string;
  bookId: string;
  tags: string[];
};

const previewVariants: BookRow[] = [
  {
    key: "free-a",
    status: "free",
    newArrival: false,
    caption: "Free",
    seed: "free-a",
    bookId: "OC-WRO-B-0001",
    tags: ["Fiction", "Literary", "Book club"],
  },
  {
    key: "free-b",
    status: "free",
    newArrival: true,
    caption: "Free · New arrival",
    seed: "free-b",
    bookId: "OC-WRO-B-0002",
    tags: ["Fiction", "New"],
  },
  {
    key: "bor-a",
    status: "borrowed",
    newArrival: false,
    caption: "Borrowed",
    seed: "bor-a",
    bookId: "OC-WRO-B-0003",
    tags: ["Fiction", "Popular"],
  },
  {
    key: "bor-b",
    status: "borrowed",
    newArrival: true,
    caption: "Borrowed · New arrival",
    seed: "bor-b",
    bookId: "OC-WRO-B-0004",
    tags: ["Fiction", "New", "Waitlist"],
  },
  {
    key: "me-a",
    status: "borrowed-by-me",
    newArrival: false,
    caption: "Borrowed by me",
    seed: "me-a",
    bookId: "OC-WRO-B-0005",
    tags: ["Fiction", "Due soon"],
  },
  {
    key: "me-b",
    status: "borrowed-by-me",
    newArrival: true,
    caption: "Borrowed by me · New arrival",
    seed: "me-b",
    bookId: "OC-WRO-B-0006",
    tags: ["Fiction", "New", "Checked out"],
  },
];

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

const Home = () => {
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [section, setSection] = useState<MediaSection>("books");
  const [activeCategory, setActiveCategory] = useState("All");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const selected = openKey != null ? previewVariants.find((b) => b.key === openKey) : undefined;

  const close = useCallback(() => setOpenKey(null), []);

  const allTags = useMemo(
    () => Array.from(new Set(previewVariants.flatMap((b) => b.tags))).sort((a, b) => a.localeCompare(b)),
    [],
  );

  const filteredRows = useMemo(() => {
    return previewVariants.filter((row) => {
      if (tagFilter != null && !row.tags.includes(tagFilter)) return false;
      return matchesCategory(row, activeCategory);
    });
  }, [activeCategory, tagFilter]);

  return (
    <>
      <Layout
        topBar={
          <TopBar
            accountPanelOpen={userPanelOpen}
            onAccountClick={() => setUserPanelOpen((open) => !open)}
          />
        }
        leftSidebar={leftSidebar}
      >
        <div className="flex w-full flex-col gap-8">
        {selected != null && (
          <BookFullView
            coverSrc={`https://picsum.photos/seed/${selected.seed}/272/181`}
            coverSrcLarge={`https://picsum.photos/seed/${selected.seed}/640/960`}
            title="The Midnight Library"
            author="Matt Haig"
            description={DESCRIPTION}
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
        )}

        <CatalogHomeHeader
          allTags={allTags}
          section={section}
          onSectionChange={setSection}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeTagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
        />

        {section === "books" ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-[#43485e]">Browse</h2>
            {filteredRows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#b1b2b5] bg-[#eeeef0]/60 px-4 py-8 text-center text-sm text-[#6b7289]">
                No items match these filters. Try another category or clear the tag filter.
              </p>
            ) : (
              <ul className="grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredRows.map((row) => (
                  <li key={row.key} className="flex flex-col gap-2">
                    <BookPreview
                      coverSrc={`https://picsum.photos/seed/${row.seed}/272/181`}
                      title="The Midnight Library"
                      author="Matt Haig"
                      status={row.status}
                      newArrival={row.newArrival}
                      onOpen={() => setOpenKey(row.key)}
                    />
                    <p className="text-xs text-[#9e9eae]">{row.caption}</p>
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
      <UserInfoPanel open={userPanelOpen} onClose={() => setUserPanelOpen(false)} />
    </>
  );
};

export default Home;
