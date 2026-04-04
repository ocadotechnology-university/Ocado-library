import type { ReactNode } from "react";

type LayoutProps = {
  topBar: ReactNode;
  leftSidebar: ReactNode;
  rightSidebar: ReactNode;
  children: ReactNode;
};

const Layout = ({ topBar, leftSidebar, rightSidebar, children }: LayoutProps) => {
  return (
    <div className="layout">
      <header className="layout-header">{topBar}</header>
      <div className="main-content">
        <aside className="left-sidebar">{leftSidebar}</aside>
        <main className="content">{children}</main>
        <aside className="right-sidebar">{rightSidebar}</aside>
      </div>
    </div>
  );
};

export default Layout;
