import type { JournalOperationType } from "./api";

export type CatalogItemType = "book" | "board" | "ps";

export type OperationTheme = {
  label: string;
  shortLabel: string;
  cardClass: string;
  badgeClass: string;
  iconClass: string;
};

export type ItemTypeTheme = {
  label: string;
  badgeClass: string;
  iconClass: string;
};

export const OPERATION_THEME: Record<
  JournalOperationType,
  OperationTheme
> = {
  BORROW: {
    label: "Borrowed",
    shortLabel: "Borrow",
    cardClass: "border-[#86bfa3] bg-[#edf7f1]",
    badgeClass: "border-emerald-700/30 bg-emerald-600 text-white",
    iconClass: "text-emerald-700",
  },
  RETURN: {
    label: "Returned",
    shortLabel: "Return",
    cardClass: "border-[#e8c98a] bg-[#fdf8ed]",
    badgeClass: "border-amber-800/30 bg-amber-500 text-amber-950",
    iconClass: "text-amber-800",
  },
  ADD: {
    label: "Added",
    shortLabel: "Add",
    cardClass: "border-[#8eb8e8] bg-[#eef6fd]",
    badgeClass: "border-sky-800/25 bg-sky-600 text-white",
    iconClass: "text-sky-700",
  },
  UPDATE: {
    label: "Updated",
    shortLabel: "Update",
    cardClass: "border-[#b6a8e0] bg-[#f3f0fb]",
    badgeClass: "border-violet-800/25 bg-violet-600 text-white",
    iconClass: "text-violet-700",
  },
  DELETE: {
    label: "Deleted",
    shortLabel: "Delete",
    cardClass: "border-[#e8a8a8] bg-[#fdf0f0]",
    badgeClass: "border-red-800/25 bg-red-600 text-white",
    iconClass: "text-red-700",
  },
};

export const DEFAULT_OPERATION_THEME: OperationTheme = {
  label: "Activity",
  shortLabel: "Event",
  cardClass: "border-[#c5c9d6] bg-[#f3f4f8]",
  badgeClass: "border-[#43485e]/25 bg-[#43485e] text-[#eeeef0]",
  iconClass: "text-[#43485e]",
};

export const ITEM_TYPE_THEME: Record<CatalogItemType, ItemTypeTheme> = {
  book: {
    label: "Book",
    badgeClass: "border-[#43485e]/20 bg-[#43485e]/10 text-[#43485e]",
    iconClass: "text-[#43485e]",
  },
  board: {
    label: "Board game",
    badgeClass: "border-amber-800/25 bg-amber-100 text-amber-950",
    iconClass: "text-amber-900",
  },
  ps: {
    label: "PS game",
    badgeClass: "border-emerald-800/25 bg-emerald-100 text-emerald-950",
    iconClass: "text-emerald-900",
  },
};

export function operationThemeFor(
  operation: JournalOperationType | null | undefined,
): OperationTheme {
  if (operation == null) return DEFAULT_OPERATION_THEME;
  return OPERATION_THEME[operation] ?? DEFAULT_OPERATION_THEME;
}

export function itemTypeFromInstanceId(
  instanceId: string | undefined,
): CatalogItemType | null {
  if (!instanceId) return null;
  if (instanceId.includes("-PS-")) return "ps";
  if (instanceId.includes("-G-")) return "board";
  if (instanceId.includes("-B-")) return "book";
  return null;
}

export function itemTypeFromSeed(seed: string): CatalogItemType {
  if (seed.startsWith("ps-")) return "ps";
  if (seed.startsWith("board-")) return "board";
  return "book";
}

export function resolveItemType(input: {
  seed: string;
  instanceId?: string;
}): CatalogItemType {
  return itemTypeFromInstanceId(input.instanceId) ?? itemTypeFromSeed(input.seed);
}

export function showsLoanDetails(
  operation: JournalOperationType | null | undefined,
): boolean {
  return operation === "BORROW" || operation === "RETURN";
}
