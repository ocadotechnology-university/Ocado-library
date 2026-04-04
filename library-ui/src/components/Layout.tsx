import type { ReactNode } from "react";

/** Matches fixed header height (Tailwind spacing scale). */
const TOP_BAR_HEIGHT = "h-28";

type LayoutProps = {
  topBar: ReactNode;
  leftSidebar: ReactNode;
  rightSidebar: ReactNode;
  children: ReactNode;
};

const Layout = ({ topBar, leftSidebar, rightSidebar, children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-[#eeeef0]">
      <header
        className={`fixed top-0 left-0 right-0 z-50 ${TOP_BAR_HEIGHT} border-b border-[#b1b2b5]/50 bg-[#43485e] shadow-[0_4px_20px_-2px_rgb(0_0_0_/0.25)]`}
      >
        {topBar}
      </header>

      <div className={`${TOP_BAR_HEIGHT} shrink-0`} aria-hidden />

      <div className="flex min-h-0 min-w-0 flex-1">
        <aside className="flex min-h-0 shrink-0 flex-col border-r border-[#9e9eae]/70 bg-[#b8bac7]">
          {leftSidebar}
        </aside>
        <main className="min-h-0 min-w-0 flex-1 overflow-auto p-6 lg:p-8">{children}</main>
        <aside className="relative flex min-h-0 shrink-0 flex-col border-l border-[#9e9eae]/70 bg-[#b8bac7]">
          {rightSidebar}
        </aside>
      </div>
    </div>
  );
};

export default Layout;
