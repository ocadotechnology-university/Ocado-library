import type { ReactNode } from "react";

/** Matches fixed header height (Tailwind spacing scale). */
const TOP_BAR_HEIGHT = "h-28";

type LayoutProps = {
  topBar: ReactNode;
  leftSidebar: ReactNode;
  rightSidebar: ReactNode;
  children: ReactNode;
};

const asideClass =
  "flex h-full min-h-0 w-[min(24vw,380px)] min-w-[240px] max-w-[380px] shrink-0 flex-col overflow-hidden border-[#9e9eae]/70 bg-[#b8bac7]";

/**
 * Three-pane layout: fixed top bar, then left / main / right each scroll independently
 * (marketplace-style), no full-page scroll.
 */
const Layout = ({ topBar, leftSidebar, rightSidebar, children }: LayoutProps) => {
  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#eeeef0]">
      <header
        className={`fixed top-0 right-0 left-0 z-50 shrink-0 ${TOP_BAR_HEIGHT} border-b border-[#b1b2b5]/50 bg-[#43485e] shadow-[0_4px_20px_-2px_rgb(0_0_0_/0.25)]`}
      >
        {topBar}
      </header>

      <div className={`${TOP_BAR_HEIGHT} shrink-0`} aria-hidden />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className={`${asideClass} border-r`}>{leftSidebar}</aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain bg-[#eeeef0] p-6 lg:p-8">
          {children}
        </main>

        <aside className={`relative ${asideClass} border-l`}>{rightSidebar}</aside>
      </div>
    </div>
  );
};

export default Layout;
