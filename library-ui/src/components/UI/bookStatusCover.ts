export type BookStatus = "free" | "borrowed" | "borrowed-by-me";

/** Labels on the cover image (full view + preview). */
export const BOOK_STATUS_COVER_LABEL: Record<BookStatus, string> = {
  free: "Free",
  borrowed: "Borrowed",
  "borrowed-by-me": "Borrowed by me",
};

/** High-contrast status chip on the cover — shared by BookPreview and BookFullView. */
export const BOOK_STATUS_COVER_CLASS: Record<BookStatus, string> = {
  free: "border-2 border-emerald-800 bg-emerald-600 text-white shadow-[0_2px_12px_rgb(0_0_0_/0.35)]",
  borrowed: "border-2 border-amber-900 bg-amber-500 text-amber-950 shadow-[0_2px_12px_rgb(0_0_0_/0.35)]",
  "borrowed-by-me":
    "border-2 border-[#1a1f2e] bg-[#43485e] text-[#eeeef0] shadow-[0_2px_12px_rgb(0_0_0_/0.35)]",
};

/** “New arrival” badge (position with absolute + offsets in each component). */
export const NEW_ARRIVAL_COVER_CLASS =
  "rounded-lg border-2 border-[#43485e] bg-[#eeeef0] px-2.5 py-1.5 text-[10px] font-extrabold uppercase leading-tight tracking-wider text-[#43485e] shadow-[0_2px_10px_rgb(0_0_0_/0.25)]";
