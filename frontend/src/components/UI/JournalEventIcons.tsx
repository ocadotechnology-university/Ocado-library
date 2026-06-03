import type { CatalogItemType } from "../../lib/journalEventTheme";
import type { JournalOperationType } from "../../lib/api";

const iconBase = "h-4 w-4 shrink-0";

export function OperationIcon({
  operation,
  className = "",
}: {
  operation: JournalOperationType | null | undefined;
  className?: string;
}) {
  const cls = `${iconBase} ${className}`.trim();

  switch (operation) {
    case "BORROW":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 7h10v10H7zM4 4v4M20 4v4M4 20v-4M20 20v-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 11v6M9.5 13.5 12 11l2.5 2.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "RETURN":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 7h10v10H7zM4 4v4M20 4v4M4 20v-4M20 20v-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 17v-6M9.5 14.5 12 17l2.5-2.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "ADD":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 8v8M8 12h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "UPDATE":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 20h4l9.5-9.5a2.12 2.12 0 0 0 0-3L14 3.5a2.12 2.12 0 0 0-3 0L4 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m13.5 5.5 3 3M7 17l2 2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "DELETE":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 7h16M9 7V5h6v2M10 11v6M14 11v6M6 7l1 12h10l1-12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 8v5M12 16h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export function ItemTypeIcon({
  itemType,
  className = "",
}: {
  itemType: CatalogItemType;
  className?: string;
}) {
  const cls = `${iconBase} ${className}`.trim();

  switch (itemType) {
    case "board":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="9" cy="9" r="1.25" fill="currentColor" />
          <circle cx="15" cy="9" r="1.25" fill="currentColor" />
          <circle cx="12" cy="15" r="1.25" fill="currentColor" />
        </svg>
      );
    case "ps":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M8 14h8a4 4 0 0 0 0-8H9a3 3 0 0 0 0 6h6a2 2 0 0 1 0 4H8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="16.5" cy="11.5" r="1" fill="currentColor" />
          <circle cx="18" cy="14.5" r="1" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 4h9l3 3v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M15 4v4h4M8 10h8M8 14h6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
