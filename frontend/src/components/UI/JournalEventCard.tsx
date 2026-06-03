import type { JournalOperationType } from "../../lib/api";
import {
  ITEM_TYPE_THEME,
  operationThemeFor,
  resolveItemType,
  showsLoanDetails,
  type CatalogItemType,
} from "../../lib/journalEventTheme";
import { ItemTypeIcon, OperationIcon } from "./JournalEventIcons";

export type JournalEventCardRow = {
  id: string;
  title: string;
  author: string;
  seed: string;
  eventDate: string;
  userEmail?: string;
  instanceId?: string;
  operationType?: JournalOperationType | null;
};

export type JournalEventCardProps = {
  row: JournalEventCardRow;
  formattedWhen: string;
  showUserInMeta?: boolean;
  onClick?: () => void;
};

export default function JournalEventCard({
  row,
  formattedWhen,
  showUserInMeta = false,
  onClick,
}: JournalEventCardProps) {
  const operation = operationThemeFor(row.operationType);
  const itemType: CatalogItemType = resolveItemType({
    seed: row.seed,
    instanceId: row.instanceId,
  });
  const item = ITEM_TYPE_THEME[itemType];
  const loanDetails = showsLoanDetails(row.operationType);
  const interactive = onClick != null;

  return (
    <li className="list-none">
      <article
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        className={[
          "relative overflow-hidden rounded-xl border-2 p-4 shadow-sm sm:p-5",
          operation.cardClass,
          interactive
            ? "cursor-pointer transition hover:brightness-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e]"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={`absolute top-3 right-3 flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${operation.badgeClass}`}
          title={operation.label}
        >
          <OperationIcon
            operation={row.operationType}
            className="h-3.5 w-3.5"
          />
          <span>{operation.shortLabel}</span>
        </div>

        <div
          className={`absolute bottom-3 right-3 flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${item.badgeClass}`}
          title={item.label}
        >
          <ItemTypeIcon itemType={itemType} className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{item.label}</span>
        </div>

        <div className="pr-24">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7289]">
            {operation.label}
          </p>
          <time
            dateTime={row.eventDate}
            className="mt-0.5 block text-sm font-semibold text-[#43485e] sm:text-base"
          >
            {formattedWhen}
          </time>
        </div>

        <div className="mt-4 flex min-w-0 items-start gap-2.5 pr-20">
          <span
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white/80 shadow-sm ${item.badgeClass}`}
            title={item.label}
          >
            <ItemTypeIcon
              itemType={itemType}
              className={`h-5 w-5 ${item.iconClass}`}
            />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[#2a3142] sm:text-lg">
              {row.title}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-sm text-[#6b7289]">
              {row.author}
            </p>
          </div>
        </div>

        {loanDetails && (showUserInMeta || row.userEmail || row.instanceId) ? (
          <dl className="mt-3 flex flex-col gap-1.5 border-t border-black/10 pt-3 text-sm text-[#43485e] sm:flex-row sm:flex-wrap sm:gap-x-6">
            {showUserInMeta && row.userEmail ? (
              <div className="min-w-0">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#8b92a8]">
                  Person
                </dt>
                <dd className="truncate font-medium">{row.userEmail}</dd>
              </div>
            ) : null}
            {row.instanceId ? (
              <div className="min-w-0">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#8b92a8]">
                  Instance
                </dt>
                <dd className="truncate font-mono text-xs font-semibold sm:text-sm">
                  {row.instanceId}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </article>
    </li>
  );
}
