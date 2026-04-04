import type { KeyboardEvent, ReactNode } from "react";
import {
  BOOK_STATUS_COVER_CLASS,
  BOOK_STATUS_COVER_LABEL,
  NEW_ARRIVAL_COVER_CLASS,
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

  return (
    <article
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Open details: ${title}` : undefined}
      onClick={interactive ? onOpen : undefined}
      onKeyDown={interactive ? keyActivate : undefined}
      className={`flex w-full max-w-[272px] flex-col overflow-hidden rounded-xl ${borderClass} ${shell} ${interactive ? "cursor-pointer transition hover:brightness-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e]" : ""} ${className ?? ""}`.trim()}
    >
      {/* Cover: same status / new-arrival chips as BookFullView (top-left / top-right). */}
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
            className={`absolute top-2 left-2 z-10 max-w-[calc(100%-5.5rem)] ${NEW_ARRIVAL_COVER_CLASS}`}
          >
            New arrival
          </span>
        )}
        <span
          className={`absolute top-2 right-2 z-10 max-w-[min(58%,11rem)] rounded-lg px-2.5 py-1.5 text-center text-[10px] font-extrabold uppercase leading-tight tracking-wide sm:max-w-[65%] ${BOOK_STATUS_COVER_CLASS[status]}`}
        >
          {BOOK_STATUS_COVER_LABEL[status]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-2.5">
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-[#43485e]">{title}</h2>
        <p className="line-clamp-1 text-xs text-[#9e9eae]">{author}</p>
        {footer != null && <div className="mt-1.5 border-t border-[#b1b2b5]/50 pt-2">{footer}</div>}
      </div>
    </article>
  );
};

export default BookPreview;
