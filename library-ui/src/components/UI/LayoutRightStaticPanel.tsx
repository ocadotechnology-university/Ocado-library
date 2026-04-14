import { SidebarTemplate } from "./SidebarTemplate";

function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#b1b2b5]/60 bg-[#eeeef0]/90 px-3 py-2.5 shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#43485e]/10 text-lg" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-lg font-semibold tabular-nums text-[#43485e]">{value}</p>
        <p className="text-[10px] font-medium uppercase tracking-wide text-[#6b7289]">{label}</p>
      </div>
    </div>
  );
}

/**
 * Decorative right rail — balances the layout; demo “pulse” tiles (not live data).
 */
export default function LayoutRightStaticPanel() {
  return (
    <SidebarTemplate>
      <div className="rounded-xl bg-gradient-to-br from-[#43485e] via-[#3d4258] to-[#323746] p-4 shadow-[inset_0_1px_0_0_rgb(255_255_255_/0.08)]">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4e157]">Library pulse</p>
        <div
          className="mx-auto mt-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeeef0]/10 text-3xl backdrop-blur-[2px]"
          aria-hidden
        >
          {String.fromCodePoint(0x1f4da)}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <StatCard icon={String.fromCodePoint(0x1f4da)} value="1.2k" label="Titles" />
        <StatCard icon={String.fromCodePoint(0x1f4c8)} value="48" label="Out this week" />
        <StatCard icon={String.fromCodePoint(0x2728)} value="12" label="New on shelf" />
      </div>

      <div className="mt-1 rounded-xl border border-dashed border-[#9e9eae]/55 bg-[#dcdfe6]/40 p-3">
        <div className="mx-auto flex h-20 w-full max-w-[140px] items-end justify-center gap-1 rounded-lg bg-[#43485e]/[0.07] px-2 pb-2 pt-4">
          {[40, 64, 52, 72, 48, 56].map((h, i) => (
            <div
              key={i}
              className="w-2 rounded-sm bg-[#43485e]/35"
              style={{ height: `${h}%` }}
              aria-hidden
            />
          ))}
        </div>
        <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[#6b7289]">
          Borrow rhythm
        </p>
      </div>
    </SidebarTemplate>
  );
}
