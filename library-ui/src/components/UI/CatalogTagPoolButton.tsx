import { useEffect, useId, useMemo, useRef, useState } from "react";

function TagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2H2v10l9.29 9.29a1 1 0 001.41 0l6.59-6.59a1 1 0 000-1.41L12 2z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

export type CatalogTagPoolButtonProps = {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  /** Icon-only control for the header toolbar. */
  variant?: "icon" | "block";
  /** Popover alignment under the trigger. */
  popoverAlign?: "end" | "stretch";
  /** Called when the tag list opens (e.g. close other popovers). */
  onPopoverOpen?: () => void;
  className?: string;
};

function tagIsSelected(selectedTags: string[], tag: string): boolean {
  const t = tag.toLowerCase();
  return selectedTags.some((s) => s.toLowerCase() === t);
}

export function CatalogTagPoolButton({
  allTags,
  selectedTags,
  onToggleTag,
  variant = "icon",
  popoverAlign = "end",
  onPopoverOpen,
  className,
}: CatalogTagPoolButtonProps) {
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const sortedTags = useMemo(
    () => [...new Set(allTags)].sort((a, b) => a.localeCompare(b)),
    [allTags],
  );

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current && !wrapRef.current.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const hasSelection = selectedTags.length > 0;

  return (
    <div className={`relative ${className ?? ""}`.trim()} ref={wrapRef}>
      {variant === "icon" ? (
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-labelledby={labelId}
          onClick={() =>
            setOpen((o) => {
              if (!o) onPopoverOpen?.();
              return !o;
            })
          }
          className={[
            "inline-flex h-11 w-11 items-center justify-center rounded-xl border shadow-sm transition",
            open || hasSelection
              ? "border-[#43485e] bg-[#43485e] text-[#eeeef0]"
              : "border-[#b1b2b5] bg-white text-[#43485e] hover:bg-[#eeeef0]",
          ].join(" ")}
        >
          <span id={labelId} className="sr-only">
            Browse all tags
          </span>
          <TagIcon className="h-[18px] w-[18px]" />
        </button>
      ) : (
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-labelledby={labelId}
          onClick={() =>
            setOpen((o) => {
              if (!o) onPopoverOpen?.();
              return !o;
            })
          }
          className={[
            "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium shadow-sm transition",
            open || hasSelection
              ? "border-[#43485e] bg-[#43485e] text-[#eeeef0]"
              : "border-[#b1b2b5] bg-white text-[#43485e] hover:bg-[#eeeef0]",
          ].join(" ")}
        >
          <span className="flex min-w-0 items-center gap-2">
            <TagIcon className="h-[18px] w-[18px] shrink-0" />
            <span id={labelId} className="truncate">
              Choose tags
            </span>
          </span>
          {hasSelection ? (
            <span className="shrink-0 rounded-full bg-[#eeeef0]/20 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#eeeef0]">
              {selectedTags.length}
            </span>
          ) : null}
        </button>
      )}

      {open && (
        <div
          className={[
            "absolute top-full z-40 mt-1.5 rounded-xl border border-[#d8dce8] bg-white p-2 shadow-[0_12px_32px_-8px_rgb(67_72_94_/0.28)]",
            popoverAlign === "stretch"
              ? "right-0 left-0 w-full"
              : "right-0 w-[min(calc(100vw-2rem),18rem)]",
          ].join(" ")}
          role="dialog"
          aria-label="All tags"
        >
          <p className="border-b border-[#eeeef0] px-2 pb-2 text-[11px] font-bold uppercase tracking-wide text-[#9e9eae]">
            All tags
          </p>
          <div className="max-h-52 overflow-y-auto py-2">
            {sortedTags.length === 0 ? (
              <p className="px-2 text-xs text-[#9e9eae]">
                No tags in the catalogue yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {sortedTags.map((tag) => {
                  const on = tagIsSelected(selectedTags, tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onToggleTag(tag)}
                      className={[
                        "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                        on
                          ? "border-[#43485e] bg-[#43485e] text-[#eeeef0]"
                          : "border-[#b1b2b5] bg-[#eeeef0] text-[#43485e] hover:border-[#43485e]/40",
                      ].join(" ")}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
