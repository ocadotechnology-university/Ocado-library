/**
 * Shared visual shell for BookFullView and catalogue list rows that mirror it.
 * Keeps client-window and main-window list cards aligned.
 */
export const BOOK_FULL_CARD_OUTER_CLASS = [
  "relative w-full overflow-hidden rounded-[1.35rem]",
  "border border-white/70",
  "bg-gradient-to-br from-[#fafbfd] via-[#f3f5fa] to-[#e9edf6]",
  "shadow-[0_4px_6px_-1px_rgb(67_72_94_/0.06),0_22px_45px_-12px_rgb(67_72_94_/0.22),inset_0_1px_0_0_rgb(255_255_255_/0.9)]",
  "ring-1 ring-[#43485e]/[0.07]",
].join(" ");

export const BOOK_FULL_CARD_RADIAL_CLASS =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_60%_at_100%_-10%,rgb(147_160_190_/0.12),transparent_55%)]";

/** Cover image frame (matches BookFullView inner ring). */
export const BOOK_FULL_COVER_INNER_WRAP_CLASS =
  "h-full w-full overflow-hidden rounded-[1.05rem] bg-gradient-to-b from-white/50 to-[#dce1eb]/80 shadow-[0_12px_28px_-8px_rgb(67_72_94_/0.35)] ring-2 ring-white/90";
