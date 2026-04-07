import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Scrolls inside the column only (marketplace-style side panel). */
const shellInner = [
  "relative flex min-h-0 w-full flex-1 flex-col gap-3 overflow-y-auto overscroll-y-contain p-4",
  "scroll-smooth text-[#43485e]",
].join(" ");

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export type SidebarTemplateProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Reusable sidebar shell for the left column.
 * Background and outer border come from `Layout`.
 */
export function SidebarTemplate({ children, className }: SidebarTemplateProps) {
  return (
    <div className={`flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden ${className ?? ""}`.trim()}>
      <div className={shellInner}>{children}</div>
    </div>
  );
}

export type SidebarAccentTitleProps = {
  children: ReactNode;
  className?: string;
};

/** Section heading inside a scrolling sidebar (filters / sort groups). */
export function SidebarSectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3
      className={`text-[10px] font-bold uppercase tracking-[0.14em] text-[#4a5060] ${className ?? ""}`.trim()}
    >
      {children}
    </h3>
  );
}

/** Dark strip with lime accent — e.g. “Categories”. */
export function SidebarAccentTitle({ children, className }: SidebarAccentTitleProps) {
  return (
    <div
      className={`rounded-lg bg-[#43485e] px-3 py-2.5 text-center shadow-sm ${className ?? ""}`.trim()}
    >
      <span className="text-sm font-semibold tracking-wide text-[#d4e157]">{children}</span>
    </div>
  );
}

export type SidebarFilterRowProps = {
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/** Category / filter row: light pill, chevron, # chip (left sidebar). */
export function SidebarFilterRow({ label, className, type = "button", ...props }: SidebarFilterRowProps) {
  return (
    <button
      type={type}
      className={[
        "flex w-full items-center justify-between gap-2 rounded-lg border border-[#b1b2b5]/80",
        "bg-[#dcdfe6] px-3 py-2.5 text-left text-sm font-medium text-[#43485e]",
        "shadow-sm transition hover:bg-[#e8eaf0]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e]",
        className ?? "",
      ]
        .join(" ")
        .trim()}
      {...props}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        <ChevronDown className="text-[#43485e] opacity-80" />
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#43485e] text-[11px] font-semibold text-[#eeeef0]"
          aria-hidden
        >
          #
        </span>
      </span>
    </button>
  );
}

export type SidebarSortRowProps = {
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/** Sort / single-choice row (chevron only, no # chip). */
export function SidebarSortRow({ label, className, type = "button", ...props }: SidebarSortRowProps) {
  return (
    <button
      type={type}
      className={[
        "flex w-full items-center justify-between gap-2 rounded-lg border border-[#b1b2b5]/80",
        "bg-[#e8eaf4] px-3 py-2 text-left text-sm font-medium text-[#43485e]",
        "shadow-sm transition hover:bg-[#f0f2f8]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e]",
        className ?? "",
      ]
        .join(" ")
        .trim()}
      {...props}
    >
      <span className="min-w-0 truncate">{label}</span>
      <ChevronDown className="shrink-0 text-[#43485e] opacity-80" />
    </button>
  );
}

export type SidebarUserBlockProps = {
  /** Shown to the right of “User:” (e.g. work email as display name). */
  email: string;
  className?: string;
};

/** Single row: “User:” + email — light strip on sidebar for readable contrast. */
export function SidebarUserBlock({ email, className }: SidebarUserBlockProps) {
  return (
    <div
      className={`rounded-lg border border-[#43485e]/35 bg-[#eeeef0] px-2.5 py-2 shadow-[inset_0_1px_0_0_rgb(255_255_255_/0.65)] ${className ?? ""}`.trim()}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
        <span className="shrink-0 font-semibold text-[#43485e]">User:</span>
        <span className="min-w-0 break-all font-medium leading-snug text-[#1a1f2e]">{email}</span>
      </div>
    </div>
  );
}

export type SidebarMenuRowProps = {
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/** Large light rows with chevron (right sidebar: In use, Waiting list, …). */
export function SidebarMenuRow({ label, className, type = "button", ...props }: SidebarMenuRowProps) {
  return (
    <button
      type={type}
      className={[
        "flex w-full items-center justify-between gap-2 rounded-lg border border-[#b1b2b5]/80",
        "bg-[#dcdfe6] px-3 py-3.5 text-left text-sm font-medium text-[#43485e]",
        "shadow-sm transition hover:bg-[#e8eaf0]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e]",
        className ?? "",
      ]
        .join(" ")
        .trim()}
      {...props}
    >
      <span className="min-w-0 truncate">{label}</span>
      <ChevronDown className="shrink-0 text-[#43485e] opacity-80" />
    </button>
  );
}
