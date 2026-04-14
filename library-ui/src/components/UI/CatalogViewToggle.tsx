export type CatalogViewMode = "cards" | "list";

export type CatalogViewToggleProps = {
  mode: CatalogViewMode;
  onModeChange: (mode: CatalogViewMode) => void;
  className?: string;
};

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
    </svg>
  );
}

const btnBase =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e]";

/**
 * Switches catalogue between card grid and full-width list rows.
 */
export default function CatalogViewToggle({ mode, onModeChange, className }: CatalogViewToggleProps) {
  return (
    <div
      className={`inline-flex rounded-xl border border-[#b1b2b5]/80 bg-white/90 p-1 shadow-sm ${className ?? ""}`.trim()}
      role="group"
      aria-label="Catalog layout"
    >
      <button
        type="button"
        className={`${btnBase} ${mode === "cards" ? "bg-[#43485e] text-[#eeeef0] shadow-sm" : "text-[#5c6378] hover:bg-[#eeeef0]"}`}
        aria-pressed={mode === "cards"}
        onClick={() => onModeChange("cards")}
      >
        <GridIcon />
        <span className="hidden sm:inline">Cards</span>
      </button>
      <button
        type="button"
        className={`${btnBase} ${mode === "list" ? "bg-[#43485e] text-[#eeeef0] shadow-sm" : "text-[#5c6378] hover:bg-[#eeeef0]"}`}
        aria-pressed={mode === "list"}
        onClick={() => onModeChange("list")}
      >
        <ListIcon />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
}
