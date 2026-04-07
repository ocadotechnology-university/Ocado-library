import { useCallback, useEffect, useId, useState } from "react";
import { SidebarUserBlock } from "./SidebarTemplate";

export type UserInfoPanelProps = {
  open: boolean;
  onClose: () => void;
  email?: string;
};

type SectionId = "borrowed" | "waiting" | "history";

const DEMO: Record<SectionId, string[]> = {
  borrowed: [
    "The Midnight Library — due Apr 18",
    "Project Hail Mary — due May 2",
    "Klara and the Sun — due Apr 25",
  ],
  waiting: [
    "Dune (position 3)",
    "1984 (position 7)",
    "Sapiens (position 12)",
  ],
  history: [
    "Animal Farm — returned Mar 1, 2026",
    "The Hobbit — returned Feb 14, 2026",
    "Educated — returned Jan 8, 2026",
    "Norwegian Wood — returned Dec 20, 2025",
    "The Road — returned Nov 3, 2025",
  ],
};

const SECTIONS: { id: SectionId; title: string }[] = [
  { id: "borrowed", title: "Borrowed by me" },
  { id: "waiting", title: "Waiting for" },
  { id: "history", title: "History" },
];

function Chevron({ expanded, className }: { expanded: boolean; className?: string }) {
  return (
    <svg
      className={`shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""} ${className ?? ""}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/**
 * Slides in from the right (below the app header). Arrow on the left edge closes the panel.
 * Sections are expandable lists with independent scroll areas.
 */
export default function UserInfoPanel({ open, onClose, email = "jane.smith@ocado.com" }: UserInfoPanelProps) {
  const titleId = useId();
  const [expanded, setExpanded] = useState<Partial<Record<SectionId, boolean>>>({
    borrowed: true,
    waiting: false,
    history: false,
  });

  const toggle = useCallback((id: SectionId) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

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
        className={`fixed top-24 right-0 bottom-0 z-[45] w-[min(92vw,380px)] max-w-full transition-transform duration-300 ease-out will-change-transform ${
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
            aria-label="Close user panel"
            onClick={onClose}
          >
            ‹
          </button>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4 pt-5">
            <h2 id={titleId} className="sr-only">
              Account
            </h2>
            <SidebarUserBlock email={email} />

            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pr-0.5">
              {SECTIONS.map(({ id, title }) => {
                const isOpen = expanded[id] ?? false;
                const items = DEMO[id];
                return (
                  <div
                    key={id}
                    className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-[#b1b2b5]/80 bg-[#dcdfe6]/90 shadow-sm"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left text-sm font-semibold text-[#43485e] transition hover:bg-[#e8eaf0]"
                      aria-expanded={isOpen}
                      onClick={() => toggle(id)}
                    >
                      <span className="min-w-0 truncate">{title}</span>
                      <Chevron expanded={isOpen} className="text-[#43485e]" />
                    </button>
                    {isOpen && (
                      <ul
                        className="max-h-48 list-none overflow-y-auto overscroll-contain border-t border-[#b1b2b5]/60 bg-[#eeeef0]/85 px-2 py-2 text-sm text-[#1a1f2e]"
                        role="list"
                      >
                        {items.map((line) => (
                          <li
                            key={line}
                            className="rounded-md px-2 py-2 leading-snug hover:bg-[#dcdfe6]/80"
                            role="listitem"
                          >
                            {line}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
