import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useAppChrome } from "../../context/AppChromeContext";
import { useAuth } from "../../context/AuthContext";
import {
  ApiError,
  fetchNotifications,
  markNotificationRead,
  type NotificationLogEntry,
} from "../../lib/api";
import RightSlideInPanel from "../shell/RightSlideInPanel";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
};

export type NotificationPanelProps = {
  open: boolean;
  onClose: () => void;
  items?: NotificationItem[];
};

function formatNotificationTime(sentAt: string): string {
  const date = new Date(sentAt);
  if (Number.isNaN(date.getTime())) return sentAt;

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function toNotificationItem(entry: NotificationLogEntry): NotificationItem {
  const titleLabel = entry.itemTitle ?? `Copy ${entry.itemInternalId}`;
  const copyLabel = `copy ${entry.itemInternalId}`;

  let title = "Library notification";
  let body = `Update for “${titleLabel}” (${copyLabel}).`;

  switch (entry.notificationType) {
    case "OVERDUE_REMINDER":
      title = "Overdue reminder";
      body = `Please return “${titleLabel}” (${copyLabel}). It has been out past the loan period.`;
      break;
    case "USER_PING":
      title = "Return request";
      body = entry.senderEmail
        ? `${entry.senderEmail} asked you to return “${titleLabel}” (${copyLabel}).`
        : `Someone asked you to return “${titleLabel}” (${copyLabel}).`;
      break;
    case "MANUAL_REMINDER":
      title = "Reminder";
      body = `Reminder to return “${titleLabel}” (${copyLabel}).`;
      break;
  }

  return {
    id: String(entry.id),
    title,
    body,
    time: formatNotificationTime(entry.sentAt),
    unread: !entry.read,
  };
}

/**
 * Notifications “page” as a global right slide-in — mounted once in the app shell so it behaves the same on every route.
 */
export default function NotificationPanel({
  open,
  onClose,
  items: itemsOverride,
}: NotificationPanelProps) {
  const titleId = useId();
  const { isAuthenticated } = useAuth();
  const { refreshNotificationUnreadStatus } = useAppChrome();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const entries = await fetchNotifications();
      setItems(entries.map(toNotificationItem));
      await refreshNotificationUnreadStatus();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setItems([]);
        setError("Please sign in to view your notifications.");
        return;
      }
      setItems([]);
      setError("We could not load your notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [refreshNotificationUnreadStatus]);

  useEffect(() => {
    if (!open || itemsOverride != null || !isAuthenticated) {
      return;
    }

    void loadNotifications();
  }, [open, itemsOverride, isAuthenticated, loadNotifications]);

  const displayItems = useMemo(
    () => itemsOverride ?? items,
    [itemsOverride, items],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      const notificationId = Number(id);
      if (Number.isNaN(notificationId)) return;

      const item = displayItems.find((entry) => entry.id === id);
      if (item?.unread !== true) return;

      setItems((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, unread: false } : entry,
        ),
      );

      try {
        await markNotificationRead(notificationId);
        await refreshNotificationUnreadStatus();
      } catch {
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === id ? { ...entry, unread: true } : entry,
          ),
        );
      }
    },
    [displayItems, refreshNotificationUnreadStatus],
  );

  return (
    <RightSlideInPanel
      open={open}
      onClose={onClose}
      title="Notifications"
      titleId={titleId}
    >
      {loading ? (
        <p className="text-sm text-[#9e9eae]">Loading notifications…</p>
      ) : error ? (
        <p className="text-sm text-[#9e9eae]">{error}</p>
      ) : displayItems.length === 0 ? (
        <p className="text-sm text-[#9e9eae]">No notifications yet.</p>
      ) : (
        <ul
          className="flex min-h-0 flex-1 list-none flex-col gap-3 overflow-y-auto overscroll-contain pr-0.5"
          aria-label="Notification list"
        >
          {displayItems.map((n) => {
            const showUnreadDot = n.unread === true;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => void markAsRead(n.id)}
                  className={`w-full rounded-lg border border-[#b1b2b5]/80 bg-[#eeeef0]/95 px-3 py-3 text-left shadow-sm transition hover:bg-[#eeeef0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e] ${
                    showUnreadDot ? "ring-2 ring-[#43485e]/25" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-[#43485e]">
                      {n.title}
                    </span>
                    {showUnreadDot ? (
                      <span
                        className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#43485e]"
                        aria-label="Unread"
                      />
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-snug text-[#1a1f2e]">
                    {n.body}
                  </p>
                  <p className="mt-2 text-xs font-medium text-[#9e9eae]">
                    {n.time}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </RightSlideInPanel>
  );
}
