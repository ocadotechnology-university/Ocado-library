import type { ReactNode } from "react";

export type BookClientWindowProps = {
  children: ReactNode;
  /** Called when the dimmed backdrop is clicked (closes immediately). */
  onBackdropClick: () => void;
};

/**
 * Full-viewport (below header) overlay for a single book: dimmed backdrop + scrollable content.
 * Place `BookFullView` (or similar) as children.
 */
export default function BookClientWindow({ children, onBackdropClick }: BookClientWindowProps) {
  return (
    <div
      className="fixed top-24 right-0 bottom-0 left-0 z-[42] flex flex-col"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default border-0 bg-[#1a1f2e]/40 p-0"
        aria-label="Close book details"
        onClick={onBackdropClick}
      />
      <div className="relative z-10 mx-auto min-h-0 w-full max-w-6xl flex-1 overflow-y-auto overscroll-contain bg-[#eeeef0] px-2 py-3 sm:px-3 sm:py-4 lg:px-4 lg:py-5">
        {children}
      </div>
    </div>
  );
}
