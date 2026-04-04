import { useCallback, useState } from "react";
import Layout from "../components/Layout";
import BookFullView from "../components/UI/BookFullView";
import BookPreview from "../components/UI/BookPreview";
import type { BookStatus } from "../components/UI/BookPreview";
import TopBar from "../components/UI/TopBar";
import {
  SidebarAccentTitle,
  SidebarFilterRow,
  SidebarMenuRow,
  SidebarTemplate,
  SidebarUserBlock,
} from "../components/UI/SidebarTemplate";

const leftSidebar = (
  <SidebarTemplate side="left">
    <SidebarAccentTitle>Categories</SidebarAccentTitle>
    <div className="flex flex-col gap-2">
      <SidebarFilterRow label="Fiction literature" />
      <SidebarFilterRow label="Genre literature" />
      <SidebarFilterRow label="Non-fiction" />
    </div>
  </SidebarTemplate>
);

const rightSidebar = (
  <SidebarTemplate side="right">
    <SidebarUserBlock email="jane.smith@ocado.com" />
    <div className="flex flex-col gap-2 pt-1">
      <SidebarMenuRow label="In use" />
      <SidebarMenuRow label="Waiting list" />
      <SidebarMenuRow label="History" />
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

const Home = () => {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const selected = openKey != null ? previewVariants.find((b) => b.key === openKey) : undefined;

  const close = useCallback(() => setOpenKey(null), []);

  return (
    <Layout topBar={<TopBar />} leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
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

        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-[#43485e]">Book preview variants</h2>
          <ul className="grid list-none grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {previewVariants.map((row) => (
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
        </div>
      </div>
    </Layout>
  );
};

export default Home;
