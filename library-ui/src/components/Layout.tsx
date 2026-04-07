import type { ReactNode } from "react";

/** Matches fixed header height (Tailwind spacing scale). */
const TOP_BAR_HEIGHT = "h-24";

type LayoutProps = {
  topBar: ReactNode;
  leftSidebar: ReactNode;
  /** Omit or pass null to use full width for main content (e.g. user panel is a slide-over). */
  rightSidebar?: ReactNode | null;
  children: ReactNode;
};

const asideClass =
  "flex h-full min-h-0 w-[min(18vw,280px)] min-w-[200px] max-w-[280px] shrink-0 flex-col overflow-hidden border-[#9e9eae]/70 bg-[#b8bac7]";

/**
 * Three-pane layout: fixed top bar, then left / main / right each scroll independently
 * (marketplace-style), no full-page scroll.
 */
const Layout = ({ topBar, leftSidebar, rightSidebar = null, children }: LayoutProps) => {
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

        {rightSidebar != null ? (
          <aside className={`relative ${asideClass} border-l`}>{rightSidebar}</aside>
        ) : null}
      </div>
    </div>
  );
};

export default Layout;
