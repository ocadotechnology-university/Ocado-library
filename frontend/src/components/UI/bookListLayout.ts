/**
 * Shared list-row cover: same frame in catalogue (BookPreview list) and the same
 * proportions we aim for beside detail content (BookClientWindow / BookFullView).
 */
export const BOOK_LIST_COVER_FRAME_CLASS =
  "relative aspect-[3/4] w-[9rem] shrink-0 overflow-hidden bg-[#dcdfe6] sm:w-[10rem] md:w-[11rem]";

/** Inner padding for list text column (no status chip). */
export const BOOK_LIST_TEXT_CELL_CLASS =
  "flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0.5 p-2.5 sm:p-3";

/** Extra right padding when a status chip sits in the card corner (catalogue list). */
export const BOOK_LIST_TEXT_CELL_WITH_STATUS_CLASS = `${BOOK_LIST_TEXT_CELL_CLASS} pr-[min(42%,11rem)] sm:pr-[12rem]`;
