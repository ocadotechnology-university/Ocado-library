import { useCallback, useEffect, useId, useState } from "react";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  /** When true, shows a dot until the user clicks the notification (mark as read). */
  unread?: boolean;
};

export type NotificationPanelProps = {
  open: boolean;
  onClose: () => void;
  items?: NotificationItem[];
};

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Due soon",
    body: "“Project Hail Mary” is due back in 3 days. Renew or return to avoid a late notice.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "2",
    title: "Waitlist update",
    body: "“Dune” is now available — you have 48 hours to pick it up at the Wrocław shelf.",
    time: "Yesterday",
    unread: true,
  },
  {
    id: "3",
    title: "Return confirmed",
    body: "“Animal Farm” was checked in. Thanks for keeping the catalogue tidy.",
    time: "Mar 2",
  },
  {
    id: "4",
    title: "New arrival",
    body: "“The Thursday Murder Club” was added to Fiction. Matches your tag “Book club”.",
    time: "Mar 1",
  },
  {
    id: "5",
    title: "Ping on a book",
    body: "Alex asked to be notified when “1984” is returned. (Demo — no action required.)",
    time: "Feb 28",
  },
  {
    id: "6",
    title: "Library hours",
    body: "Spring schedule: Mon–Fri 08:00–20:00. Self-service returns stay open 24/7.",
    time: "Feb 20",
  },
  {
    id: "7",
    title: "Reservation expiring",
    body: "Your hold on “Klara and the Sun” expires tomorrow if not collected.",
    time: "Feb 18",
  },
  {
    id: "8",
    title: "Team shout-out",
    body: "Ocado Library hit 500 active borrowers this quarter. Thank you for participating.",
    time: "Feb 10",
  },
];

/**
 * Same slide-over shell as the account panel: from the right, below the header, ‹ to close.
 * Body is a single scrollable list of notification blocks.
 */
export default function NotificationPanel({
  open,
  onClose,
  items = DEMO_NOTIFICATIONS,
}: NotificationPanelProps) {
  const titleId = useId();
  /** IDs the user has opened — unread dot and ring are hidden for these. */
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
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
            aria-label="Close notifications"
            onClick={onClose}
          >
            ‹
          </button>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4 pt-5">
            <div className="shrink-0 rounded-lg bg-[#43485e] px-3 py-2.5 text-center shadow-sm">
              <h2 id={titleId} className="text-sm font-semibold tracking-wide text-[#d4e157]">
                Notifications
              </h2>
            </div>

            <ul
              className="flex min-h-0 flex-1 list-none flex-col gap-3 overflow-y-auto overscroll-contain pr-0.5"
              aria-label="Notification list"
            >
              {items.map((n) => {
                const unread = n.unread === true;
                const showUnreadDot = unread && !readIds.has(n.id);
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => markAsRead(n.id)}
                      className={`w-full rounded-lg border border-[#b1b2b5]/80 bg-[#eeeef0]/95 px-3 py-3 text-left shadow-sm transition hover:bg-[#eeeef0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e] ${
                        showUnreadDot ? "ring-2 ring-[#43485e]/25" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-[#43485e]">{n.title}</span>
                        {showUnreadDot ? (
                          <span
                            className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#43485e]"
                            aria-label="Unread"
                          />
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-snug text-[#1a1f2e]">{n.body}</p>
                      <p className="mt-2 text-xs font-medium text-[#9e9eae]">{n.time}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
