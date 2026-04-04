import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  BOOK_STATUS_COVER_CLASS,
  BOOK_STATUS_COVER_LABEL,
  NEW_ARRIVAL_COVER_CLASS,
  type BookStatus,
} from "./bookStatusCover";

/** Long enough for smooth interpolation; only transform + opacity animate (GPU-friendly). */
const ANIM_MS = 300;

export type BookFullViewProps = {
  coverSrc: string;
  /** Larger cover; defaults to `coverSrc` if omitted. */
  coverSrcLarge?: string;
  title: string;
  author: string;
  description: string;
  /** e.g. OC-WRO-B-0001 */
  bookId: string;
  tags: string[];
  status: BookStatus;
  newArrival?: boolean;
  onClose: () => void;
  onBorrow?: () => void;
  onPing?: () => void;
  onReturn?: () => void;
  /** Three-dots menu — e.g. open tag editor. */
  onEditTags?: () => void;
  className?: string;
};

const actionLabel: Record<BookStatus, string> = {
  free: "Borrow",
  borrowed: "Ping",
  "borrowed-by-me": "Return",
};

const BookFullView = ({
  coverSrc,
  coverSrcLarge,
  title,
  author,
  description,
  bookId,
  tags,
  status,
  newArrival = false,
  onClose,
  onBorrow,
  onPing,
  onReturn,
  onEditTags,
  className,
}: BookFullViewProps) => {
  const largeSrc = coverSrcLarge ?? coverSrc;
  const [tagsMenuOpen, setTagsMenuOpen] = useState(false);
  const [panelIn, setPanelIn] = useState(false);
  const tagsMenuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  const primaryAction =
    status === "free" ? onBorrow : status === "borrowed" ? onPing : onReturn;

  const finishClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const requestClose = useCallback(() => {
    setPanelIn(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      finishClose();
    }, ANIM_MS);
  }, [finishClose]);

  useEffect(() => {
    let cancelled = false;
    const id1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setPanelIn(true);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id1);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tagsMenuRef.current && !tagsMenuRef.current.contains(e.target as Node)) {
        setTagsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (tagsMenuOpen) {
        setTagsMenuOpen(false);
        return;
      }
      requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose, tagsMenuOpen]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

  return (
    <section
      aria-labelledby={`${menuId}-title`}
      style={{
        transitionDuration: `${ANIM_MS}ms`,
        transitionProperty: "opacity, transform",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: panelIn ? "auto" : "transform, opacity",
      }}
      className={[
        "relative w-full overflow-hidden rounded-[1.35rem]",
        "border border-white/70",
        "bg-gradient-to-br from-[#fafbfd] via-[#f3f5fa] to-[#e9edf6]",
        /* Static shadow — do not animate box-shadow (causes jank / visible stepped frames). */
        "shadow-[0_4px_6px_-1px_rgb(67_72_94_/0.06),0_22px_45px_-12px_rgb(67_72_94_/0.22),inset_0_1px_0_0_rgb(255_255_255_/0.9)]",
        "ring-1 ring-[#43485e]/[0.07]",
        "translate-z-0 transform-gpu backface-hidden",
        panelIn
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-[10px] scale-[0.992] opacity-0",
        className ?? "",
      ]
        .join(" ")
        .trim()}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_60%_at_100%_-10%,rgb(147_160_190_/0.12),transparent_55%)]" />

      <div className="relative flex min-h-[min(72vh,36rem)] flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-stretch lg:gap-10 lg:p-9">
        <div className="relative mx-auto w-full max-w-[200px] shrink-0 sm:max-w-[240px] lg:mx-0 lg:max-w-[min(38%,300px)]">
          <div className="overflow-hidden rounded-[1.05rem] bg-gradient-to-b from-white/50 to-[#dce1eb]/80 shadow-[0_12px_28px_-8px_rgb(67_72_94_/0.35)] ring-2 ring-white/90">
            <img
              src={largeSrc}
              alt=""
              width={640}
              height={960}
              loading="eager"
              decoding="async"
              className={`h-auto w-full object-cover ${status === "borrowed" ? "grayscale-[0.35]" : ""}`}
            />
          </div>
          {newArrival && (
            <span
              className={`absolute top-3 left-3 z-10 max-w-[calc(100%-5.5rem)] ${NEW_ARRIVAL_COVER_CLASS}`}
            >
              New arrival
            </span>
          )}
          <span
            className={`absolute top-3 right-3 z-10 max-w-[min(58%,11rem)] rounded-lg px-2.5 py-1.5 text-center text-[10px] font-extrabold uppercase leading-tight tracking-wide sm:text-[11px] ${BOOK_STATUS_COVER_CLASS[status]}`}
          >
            {BOOK_STATUS_COVER_LABEL[status]}
          </span>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:min-h-[min(72vh,36rem)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2
                id={`${menuId}-title`}
                className="text-[1.35rem] font-semibold tracking-tight text-[#2a3142] sm:text-2xl"
              >
                {title}
              </h2>
              <p className="mt-1.5 text-base text-[#6b7289]">{author}</p>
              <p className="mt-3 inline-flex rounded-lg bg-[#43485e]/[0.06] px-2.5 py-1 font-mono text-xs font-semibold tracking-wider text-[#43485e] ring-1 ring-[#43485e]/10">
                {bookId}
              </p>
            </div>
            <button
              type="button"
              onClick={requestClose}
              className="shrink-0 rounded-xl border border-[#c5c9d6] bg-white/90 px-4 py-2 text-sm font-medium text-[#43485e] shadow-sm backdrop-blur-sm transition hover:border-[#43485e]/25 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e]"
            >
              Close
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-white/60 bg-white/55 p-4 shadow-[inset_0_1px_0_0_rgb(255_255_255_/0.8)] backdrop-blur-[2px] sm:p-5">
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b92a8]">
              Description
            </h3>
            <p className="max-h-44 overflow-y-auto text-sm leading-relaxed text-[#3d4659] sm:max-h-none sm:overflow-visible">
              {description}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <h3 className="w-full text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b92a8]">Tags</h3>
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#43485e]/12 bg-[#43485e]/[0.07] px-3 py-1 text-xs font-medium text-[#3d4a63] shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="relative shrink-0" ref={tagsMenuRef}>
              <button
                type="button"
                aria-expanded={tagsMenuOpen}
                aria-haspopup="menu"
                aria-label="Tag options"
                onClick={() => setTagsMenuOpen((o) => !o)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c5c9d6] bg-white/90 text-lg font-bold leading-none text-[#43485e] shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e]"
              >
                ⋮
              </button>
              {tagsMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-20 mt-1.5 min-w-[11rem] overflow-hidden rounded-xl border border-[#e2e5ee] bg-white/95 py-1 shadow-[0_12px_30px_-8px_rgb(67_72_94_/0.25)] backdrop-blur-md"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full px-3 py-2.5 text-left text-sm text-[#43485e] transition hover:bg-[#43485e]/[0.06]"
                    onClick={() => {
                      setTagsMenuOpen(false);
                      onEditTags?.();
                    }}
                  >
                    Edit tags
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto flex min-h-[7.5rem] flex-1 flex-col justify-center sm:min-h-[9rem]">
            <div className="flex justify-center px-2 pt-6 pb-1">
              <button
                type="button"
                disabled={!primaryAction}
                onClick={() => primaryAction?.()}
                className={[
                  "min-w-[min(100%,16rem)] rounded-2xl px-12 py-4 text-lg font-semibold tracking-wide",
                  "bg-gradient-to-b from-[#4f566d] to-[#3a4154] text-[#f4f5f8]",
                  "shadow-[0_4px_14px_-2px_rgb(67_72_94_/0.45),inset_0_1px_0_0_rgb(255_255_255_/0.12)]",
                  "ring-1 ring-[#43485e]/40",
                  "transition-[transform,box-shadow,filter] duration-200 ease-out",
                  "hover:-translate-y-0.5 hover:shadow-[0_8px_22px_-4px_rgb(67_72_94_/0.4)] hover:brightness-[1.03]",
                  "active:translate-y-0 active:brightness-95",
                  "enabled:focus-visible:outline enabled:focus-visible:outline-2 enabled:focus-visible:outline-offset-2 enabled:focus-visible:outline-[#43485e]",
                  "disabled:cursor-not-allowed disabled:opacity-45",
                ].join(" ")}
              >
                {actionLabel[status]}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookFullView;
