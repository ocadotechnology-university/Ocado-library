import type { KeyboardEvent, ReactNode } from "react";
import {
  BOOK_LIST_COVER_FRAME_CLASS,
  BOOK_LIST_TEXT_CELL_WITH_STATUS_CLASS,
} from "./bookListLayout";
import {
  BOOK_FULL_CARD_OUTER_CLASS,
  BOOK_FULL_CARD_RADIAL_CLASS,
  BOOK_FULL_COVER_INNER_WRAP_CLASS,
} from "./bookFullViewCardShell";
import {
  BOOK_STATUS_COVER_LABEL,
  BOOK_STATUS_PREVIEW_COMPACT_CLASS,
  NEW_ARRIVAL_COVER_CLASS,
  NEW_ARRIVAL_PREVIEW_COMPACT_CLASS,
  type BookStatus,
} from "./bookStatusCover";

export type { BookStatus };

/** Card grid: status-tinted shells (compact tiles). */
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
  coverSrc: string;
  title: string;
  author: string;
  status: BookStatus;
  newArrival?: boolean;
  onOpen?: () => void;
  className?: string;
  footer?: ReactNode;
  variant?: "card" | "list";
  caption?: string;
  description?: string;
  /** List view — shown under author (same pattern as BookFullView). */
  bookId?: string;
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
  description,
  bookId,
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

  const listOuter = [
    BOOK_FULL_CARD_OUTER_CLASS,
    layoutClass,
    "flex",
    newArrival ? "ring-2 ring-[#43485e]" : "",
    interactive ? "cursor-pointer transition hover:brightness-[1.02]" : "",
    interactive
      ? "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e]"
      : "",
    className ?? "",
  ]
    .join(" ")
    .trim();

  if (isList) {
    return (
      <article
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? `Open details: ${title}` : undefined}
        onClick={interactive ? onOpen : undefined}
        onKeyDown={interactive ? keyActivate : undefined}
        className={listOuter}
      >
        <div className={BOOK_FULL_CARD_RADIAL_CLASS} />
        <div className="relative flex w-full flex-row items-stretch gap-4 p-4 sm:gap-6 sm:p-5">
          <div className={`relative shrink-0 ${BOOK_LIST_COVER_FRAME_CLASS}`}>
            <div className={BOOK_FULL_COVER_INNER_WRAP_CLASS}>
              <img
                src={coverSrc}
                alt=""
                width={272}
                height={181}
                loading="lazy"
                decoding="async"
                className={`h-full w-full object-cover ${coverFilterByStatus[status]}`}
              />
            </div>
            {newArrival && (
              <span
                className={`absolute top-1 left-1 z-10 max-w-[calc(100%-3rem)] sm:top-2 sm:left-2 ${NEW_ARRIVAL_PREVIEW_COMPACT_CLASS}`}
              >
                New arrival
              </span>
            )}
          </div>
          <span
            className={`absolute top-4 right-4 z-10 max-w-[8rem] whitespace-normal text-right leading-tight sm:top-5 sm:right-5 ${BOOK_STATUS_PREVIEW_COMPACT_CLASS[status]}`}
          >
            {BOOK_STATUS_COVER_LABEL[status]}
          </span>
          <div
            className={`flex min-w-0 flex-1 flex-col justify-center ${BOOK_LIST_TEXT_CELL_WITH_STATUS_CLASS} min-h-[6.5rem] py-1 sm:min-h-[7rem]`}
          >
            <h2 className="line-clamp-2 text-[1.15rem] font-semibold tracking-tight text-[#2a3142] sm:text-lg md:text-xl">
              {title}
            </h2>
            <p className="mt-1 line-clamp-1 text-sm text-[#6b7289] sm:text-base">
              {author}
            </p>
            {bookId != null && bookId.length > 0 && (
              <p className="mt-2 inline-flex w-fit rounded-lg bg-[#43485e]/[0.06] px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-[#43485e] ring-1 ring-[#43485e]/10 sm:text-xs">
                {bookId}
              </p>
            )}
            {description != null && description.length > 0 && (
              <div className="mt-3 rounded-2xl border border-white/60 bg-white/55 p-3 shadow-[inset_0_1px_0_0_rgb(255_255_255_/0.8)] backdrop-blur-[2px] sm:mt-4 sm:p-4">
                <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b92a8] sm:text-[11px]">
                  Description
                </h3>
                <p className="line-clamp-4 text-sm leading-relaxed text-[#3d4659] sm:line-clamp-5 sm:text-[0.9375rem]">
                  {description}
                </p>
              </div>
            )}
            {footer != null && (
              <div className="mt-3 border-t border-[#c5c9d6]/60 pt-3">
                {footer}
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Open details: ${title}` : undefined}
      onClick={interactive ? onOpen : undefined}
      onKeyDown={interactive ? keyActivate : undefined}
      className={`flex w-full overflow-hidden rounded-xl ${borderClass} ${shell} ${layoutClass} ${interactive ? "cursor-pointer transition hover:brightness-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e]" : ""} ${className ?? ""}`.trim()}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#dcdfe6]">
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
            className={`absolute top-1 left-1 z-10 max-w-[calc(100%-3rem)] sm:top-1.5 sm:left-1.5 ${NEW_ARRIVAL_COVER_CLASS}`}
          >
            New arrival
          </span>
        )}
        <span
          className={`absolute top-1 right-1 z-10 max-w-[min(62%,10rem)] text-center sm:top-1.5 sm:right-1.5 ${BOOK_STATUS_PREVIEW_COMPACT_CLASS[status]}`}
        >
          {BOOK_STATUS_COVER_LABEL[status]}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 p-2.5">
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-[#43485e] sm:text-[0.95rem]">
          {title}
        </h2>
        <p className="line-clamp-1 text-xs text-[#9e9eae]">{author}</p>
        {footer != null && (
          <div className="mt-1.5 border-t border-[#b1b2b5]/50 pt-1.5">
            {footer}
          </div>
        )}
      </div>
    </article>
  );
};

export default BookPreview;
