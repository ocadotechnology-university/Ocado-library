import Layout from "../components/Layout";
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

const Home = () => {
  return (
    <Layout topBar={<TopBar />} leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
      <div>Main Content</div>
    </Layout>
  );
};

export default Home;
