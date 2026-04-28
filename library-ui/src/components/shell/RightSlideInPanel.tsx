import { useEffect, type ReactNode } from "react";

export type RightSlideInPanelProps = {
  open: boolean;
  onClose: () => void;
  /** Shown in the panel header strip. */
  title: string;
  /** Optional stable id for `aria-labelledby` (caller may use `useId()`). */
  titleId?: string;
  children: ReactNode;
  /** Panel width — default matches notifications. */
  panelClassName?: string;
};

/**
 * Shared right-hand slide-in surface below the fixed app header (`top-24`),
 * with backdrop and tab close control — use for notifications and similar “page” drawers.
 */
export default function RightSlideInPanel({
  open,
  onClose,
  title,
  titleId,
  children,
  panelClassName = "w-[min(92vw,380px)]",
}: RightSlideInPanelProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        className={`fixed top-24 right-0 bottom-0 left-0 z-40 cursor-default border-0 bg-[#1a1f2e]/35 p-0 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />

      <div
        className={`fixed top-24 right-0 bottom-0 z-[45] max-w-full transition-transform duration-300 ease-out will-change-transform ${panelClassName} ${
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
      >
        <div className="relative flex h-full flex-col border-l border-[#9e9eae]/80 bg-[#b8bac7] shadow-[-12px_0_28px_-8px_rgb(0_0_0_/0.35)]">
          <button
            type="button"
            className="absolute top-1/2 left-0 z-10 flex -translate-x-full -translate-y-1/2 items-center justify-center rounded-l-lg border border-r-0 border-[#9e9eae]/80 bg-[#b8bac7] px-1.5 py-5 text-lg font-semibold leading-none text-[#43485e] shadow-md transition hover:bg-[#a8aab7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e]"
            aria-label="Close panel"
            onClick={onClose}
          >
            ‹
          </button>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4 pt-5">
            <div className="shrink-0 rounded-lg bg-[#43485e] px-3 py-2.5 text-center shadow-sm">
              {titleId != null ? (
                <h2
                  id={titleId}
                  className="text-sm font-semibold tracking-wide text-[#d4e157]"
                >
                  {title}
                </h2>
              ) : (
                <h2 className="text-sm font-semibold tracking-wide text-[#d4e157]">
                  {title}
                </h2>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
