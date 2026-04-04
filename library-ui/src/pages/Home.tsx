import Layout from "../components/Layout";
import TopBar from "../components/UI/TopBar";
import Sidebar from "../components/UI/Sidebar";

const Home = () => {
  return (
    <Layout
      topBar={<TopBar />}
      leftSidebar={<Sidebar />}
      rightSidebar={<Sidebar />}
    >
      <div>Main Content</div>
    </Layout>
  );
};

export default Home;
