import type { KeyboardEvent, ReactNode } from "react";
import {
  BOOK_STATUS_COVER_LABEL,
  BOOK_STATUS_PREVIEW_COMPACT_CLASS,
  NEW_ARRIVAL_COVER_CLASS,
  NEW_ARRIVAL_PREVIEW_COMPACT_CLASS,
  type BookStatus,
} from "./bookStatusCover";

export type { BookStatus };

/** Card shell: background + default border (overridden when `newArrival`). */
const cardShellByStatus: Record<BookStatus, string> = {
  free: "bg-white border-[#b1b2b5] shadow-[0_2px_12px_-4px_rgb(67_72_94_/0.2)]",
  borrowed:
    "bg-[#b9bac4] border-[#9a9ca8] shadow-[inset_0_1px_0_0_rgb(255_255_255_/0.15)] text-[#43485e]",
  "borrowed-by-me":
    "bg-[#e4eaf4] border-[#7d8fb0] shadow-[0_2px_14px_-4px_rgb(67_72_94_/0.18)] text-[#43485e]",
};

const coverFilterByStatus: Record<BookStatus, string> = {
  free: "",
  borrowed: "grayscale",
  "borrowed-by-me": "",
};

export type BookPreviewProps = {
  /** Small cover URL; keep dimensions modest for a low-res thumbnail. */
  coverSrc: string;
  title: string;
  author: string;
  status: BookStatus;
  /** High-contrast frame + “New arrival” label on the cover (bottom-left; status stays top-right). */
  newArrival?: boolean;
  /** Opens full book view when set. */
  onOpen?: () => void;
  className?: string;
  /** Optional footer slot (e.g. actions). */
  footer?: ReactNode;
  /** Card grid vs full-width row (catalogue list view). */
  variant?: "card" | "list";
  /** List view only — line under the author (e.g. “Borrowed · New arrival”). Hidden in card view (status is on the cover). */
  caption?: string;
  /** List view only — book blurb; truncated with ellipsis when it does not fit. */
  description?: string;
};

const BookPreview = ({
  coverSrc,
  title,
  author,
  status,
  newArrival = false,
  onOpen,
  className,
  footer,
  variant = "card",
  caption,
  description,
}: BookPreviewProps) => {
  const shell = cardShellByStatus[status];
  const borderClass = newArrival
    ? "border-[3px] border-[#43485e] shadow-[0_0_0_1px_rgb(67_72_94_/0.25),0_8px_24px_-8px_rgb(0_0_0_/0.25)]"
    : "border";

  const interactive = onOpen != null;
  const keyActivate = (e: KeyboardEvent) => {
    if (!interactive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  const isList = variant === "list";
  const layoutClass = isList
    ? "relative max-w-none w-full flex-row items-stretch"
    : "max-w-[288px] flex-col sm:max-w-[304px]";

  return (
    <article
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Open details: ${title}` : undefined}
      onClick={interactive ? onOpen : undefined}
      onKeyDown={interactive ? keyActivate : undefined}
      className={`flex w-full overflow-hidden rounded-xl ${borderClass} ${shell} ${layoutClass} ${interactive ? "cursor-pointer transition hover:brightness-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e]" : ""} ${className ?? ""}`.trim()}
    >
      {/* Cover: list = new-arrival chip only; card = compact status + new arrival on cover. */}
      <div
        className={`relative shrink-0 overflow-hidden bg-[#dcdfe6] ${isList ? "aspect-[3/4] w-[7.75rem] sm:w-36 md:w-44" : "aspect-[3/4] w-full"}`}
      >
        <img
          src={coverSrc}
          alt=""
          width={272}
          height={181}
          loading="lazy"
          decoding="async"
          className={`h-full w-full object-cover ${coverFilterByStatus[status]}`}
        />
        {newArrival && (
          <span
            className={`absolute top-1 left-1 z-10 max-w-[calc(100%-3rem)] sm:top-1.5 sm:left-1.5 ${isList ? NEW_ARRIVAL_PREVIEW_COMPACT_CLASS : NEW_ARRIVAL_COVER_CLASS}`}
          >
            New arrival
          </span>
        )}
        {!isList && (
          <span
            className={`absolute top-1 right-1 z-10 max-w-[min(62%,10rem)] text-center sm:top-1.5 sm:right-1.5 ${BOOK_STATUS_PREVIEW_COMPACT_CLASS[status]}`}
          >
            {BOOK_STATUS_COVER_LABEL[status]}
          </span>
        )}
      </div>
      {isList && (
        <span
          className={`absolute top-3 right-3 z-10 max-w-[8rem] whitespace-normal text-right leading-tight sm:top-3.5 sm:right-3.5 ${BOOK_STATUS_PREVIEW_COMPACT_CLASS[status]}`}
        >
          {BOOK_STATUS_COVER_LABEL[status]}
        </span>
      )}
      <div
        className={`flex min-w-0 flex-1 flex-col justify-center gap-0.5 ${isList ? "min-h-[6.5rem] p-3 pr-[min(42%,11rem)] sm:p-4 sm:pr-[12rem]" : "p-2.5"}`}
      >
        <h2
          className={`font-semibold leading-snug text-[#43485e] ${isList ? "line-clamp-2 text-base sm:text-lg" : "line-clamp-2 text-sm sm:text-[0.95rem]"}`}
        >
          {title}
        </h2>
        <p className={`text-[#9e9eae] ${isList ? "line-clamp-1 text-sm" : "line-clamp-1 text-xs"}`}>{author}</p>
        {isList && caption != null && caption.length > 0 && (
          <p className="text-xs text-[#9e9eae] sm:text-sm">{caption}</p>
        )}
        {isList && description != null && description.length > 0 && (
          <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-[#5c6378] sm:line-clamp-5">{description}</p>
        )}
        {footer != null && (
          <div className={`border-[#b1b2b5]/50 ${isList ? "mt-2 border-t pt-2" : "mt-1.5 border-t pt-1.5"}`}>
            {footer}
          </div>
        )}
      </div>
    </article>
  );
};

export default BookPreview;
