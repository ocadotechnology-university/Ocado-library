import type { ReactNode } from "react";

export type BookStatus = "free" | "borrowed" | "borrowed-by-me";

const statusLabel: Record<BookStatus, string> = {
  free: "Free",
  borrowed: "Borrowed",
  "borrowed-by-me": "Borrowed by me",
};

const statusBadgeClass: Record<BookStatus, string> = {
  free: "border-[#9e9eae]/80 bg-[#eeeef0] text-[#43485e]",
  borrowed: "border-[#6b6d78]/90 bg-[#8f919c] text-[#f4f4f6]",
  "borrowed-by-me": "border-[#43485e]/50 bg-[#43485e] text-[#eeeef0]",
};

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
  className,
  footer,
}: BookPreviewProps) => {
  const shell = cardShellByStatus[status];
  const borderClass = newArrival
    ? "border-[3px] border-[#43485e] shadow-[0_0_0_1px_rgb(67_72_94_/0.25),0_8px_24px_-8px_rgb(0_0_0_/0.25)]"
    : "border";

  return (
    <article
      className={`flex w-full max-w-[272px] flex-col overflow-hidden rounded-xl ${borderClass} ${shell} ${className ?? ""}`.trim()}
    >
      {/* Wider, shorter cover than portrait 2/3 — status top-right, new arrival bottom-left */}
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
        <span
          className={`absolute top-2 right-2 max-w-[min(58%,11rem)] rounded-md border px-1.5 py-0.5 text-left text-[10px] font-semibold uppercase leading-tight tracking-wide shadow-sm sm:max-w-[65%] ${statusBadgeClass[status]}`}
        >
          {statusLabel[status]}
        </span>
        {newArrival && (
          <span className="absolute top-2 left-2 rounded-md border-2 border-[#43485e] bg-[#eeeef0] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#43485e] shadow-sm">
            New arrival
          </span>
        )}
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
