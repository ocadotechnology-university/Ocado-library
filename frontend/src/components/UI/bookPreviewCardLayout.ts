/** Card grid tile — width follows column; same caps as before. */
export const BOOK_PREVIEW_CARD_CLASS =
  "flex w-full max-w-[288px] flex-col overflow-hidden sm:max-w-[304px]";

export const BOOK_PREVIEW_COVER_CLASS =
  "relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-[#dcdfe6]";

/** Fixed text block — title/author/tags never change card height. */
export const BOOK_PREVIEW_BODY_CLASS =
  "box-border flex h-[6.5rem] shrink-0 flex-col overflow-hidden p-2";

export const BOOK_PREVIEW_TITLE_CLASS =
  "h-5 shrink-0 truncate text-base font-semibold leading-5 text-[#43485e]";

export const BOOK_PREVIEW_AUTHOR_CLASS =
  "h-4 shrink-0 truncate text-sm leading-4 text-[#9e9eae]";

/** Reserved two-line tag area on book cards (empty when no tags). */
export const BOOK_PREVIEW_TAGS_SLOT_CLASS = "h-12 w-full shrink-0";
