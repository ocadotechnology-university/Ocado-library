import type { ReactNode } from "react";

type LayoutProps = {
  topBar: ReactNode;
  leftSidebar: ReactNode;
  rightSidebar: ReactNode;
  children: ReactNode;
};

const Layout = ({ topBar, leftSidebar, rightSidebar, children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="shrink-0 border-b border-black/10">{topBar}</header>
      <div className="flex min-h-0 min-w-0 flex-1">
        <aside className="shrink-0 border-r border-black/10">{leftSidebar}</aside>
        <main className="min-h-0 min-w-0 flex-1 overflow-auto p-6">{children}</main>
        <aside className="shrink-0 border-l border-black/10">{rightSidebar}</aside>
      </div>
    </div>
  );
};

export default Layout;
