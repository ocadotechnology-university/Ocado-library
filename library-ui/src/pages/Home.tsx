import Layout from "../components/Layout";
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

const previewVariants: {
  status: BookStatus;
  newArrival: boolean;
  caption: string;
  seed: string;
}[] = [
  { status: "free", newArrival: false, caption: "Free", seed: "free-a" },
  { status: "free", newArrival: true, caption: "Free · New arrival", seed: "free-b" },
  { status: "borrowed", newArrival: false, caption: "Borrowed", seed: "bor-a" },
  { status: "borrowed", newArrival: true, caption: "Borrowed · New arrival", seed: "bor-b" },
  { status: "borrowed-by-me", newArrival: false, caption: "Borrowed by me", seed: "me-a" },
  { status: "borrowed-by-me", newArrival: true, caption: "Borrowed by me · New arrival", seed: "me-b" },
];

const Home = () => {
  return (
    <Layout topBar={<TopBar />} leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-[#43485e]">Book preview variants</h2>
        <ul className="grid list-none grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {previewVariants.map(({ status, newArrival, caption, seed }) => (
            <li key={`${status}-${newArrival}`} className="flex flex-col gap-2">
              <BookPreview
                coverSrc={`https://picsum.photos/seed/${seed}/272/181`}
                title="The Midnight Library"
                author="Matt Haig"
                status={status}
                newArrival={newArrival}
              />
              <p className="text-xs text-[#9e9eae]">{caption}</p>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default Home;
