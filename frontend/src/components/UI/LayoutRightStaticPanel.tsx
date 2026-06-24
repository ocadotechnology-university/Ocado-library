import booksIcon from "../../assets/books.png";
import borrowIcon from "../../assets/borrow.png";
import learningIcon from "../../assets/learning.png";
import trendIcon from "../../assets/trend.png";
import { SidebarTemplate } from "./SidebarTemplate";

function StatCard({
  iconSrc,
  value,
  label,
}: {
  iconSrc: string;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#b1b2b5]/60 bg-[#eeeef0]/90 px-3 py-2.5 shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#43485e]/10">
        <img
          src={iconSrc}
          alt=""
          className="h-6 w-6 object-contain"
          aria-hidden
        />
      </span>
      <div className="min-w-0">
        <p className="text-lg font-semibold tabular-nums text-[#43485e]">
          {value}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-wide text-[#6b7289]">
          {label}
        </p>
      </div>
    </div>
  );
}

/**
 * Decorative right rail — balances the layout with live catalogue pulse tiles.
 */
export type LibraryStats = {
  totalRecords: number;
  borrowedRecords: number;
  borrowedThisWeek: number;
};

export default function LayoutRightStaticPanel({
  stats,
}: {
  stats: LibraryStats;
}) {
  return (
    <SidebarTemplate>
      <div className="rounded-xl border border-[#b1b2b5]/60 bg-[#eeeef0]/90 p-4 shadow-sm">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#43485e]">
          Library pulse
        </p>
        <div
          className="mx-auto mt-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#43485e]/10"
          aria-hidden
        >
          <img src={learningIcon} alt="" className="h-9 w-9 object-contain" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <StatCard
          iconSrc={booksIcon}
          value={String(stats.totalRecords)}
          label="Records"
        />
        <StatCard
          iconSrc={trendIcon}
          value={String(stats.borrowedThisWeek)}
          label="Out this week"
        />
        <StatCard
          iconSrc={borrowIcon}
          value={String(stats.borrowedRecords)}
          label="Borrowed"
        />
      </div>
    </SidebarTemplate>
  );
}
