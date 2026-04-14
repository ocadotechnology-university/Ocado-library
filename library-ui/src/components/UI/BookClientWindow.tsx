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
      <div className="relative z-10 mx-auto min-h-0 w-full max-w-5xl flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {children}
      </div>
    </div>
  );
}
