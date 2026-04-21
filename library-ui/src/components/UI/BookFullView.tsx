import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  BOOK_FULL_CARD_OUTER_CLASS,
  BOOK_FULL_CARD_RADIAL_CLASS,
  BOOK_FULL_COVER_INNER_WRAP_CLASS,
} from "./bookFullViewCardShell";
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
  onContextMenu?: (e: import("react").MouseEvent<HTMLElement>) => void;
  footerExtraActions?: ReactNode;
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
  onContextMenu,
  footerExtraActions,
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
      onContextMenu={onContextMenu}
      style={{
        transitionDuration: `${ANIM_MS}ms`,
        transitionProperty: "opacity, transform",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: panelIn ? "auto" : "transform, opacity",
      }}
      className={[
        BOOK_FULL_CARD_OUTER_CLASS,
        "translate-z-0 transform-gpu backface-hidden",
        panelIn
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-[10px] scale-[0.992] opacity-0",
        className ?? "",
      ]
        .join(" ")
        .trim()}
    >
      <div className={BOOK_FULL_CARD_RADIAL_CLASS} />

      <div className="relative flex min-h-[min(72vh,36rem)] flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-stretch lg:gap-8 lg:p-6">
        <div className="relative mx-auto w-full max-w-[min(92vw,260px)] shrink-0 sm:max-w-[min(88vw,300px)] lg:mx-0 lg:max-w-[min(44%,380px)]">
          <div className={BOOK_FULL_COVER_INNER_WRAP_CLASS}>
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
              <p className="mt-4 text-sm leading-relaxed text-[#3d4659] sm:text-base">{description}</p>
            </div>
            <button
              type="button"
              onClick={requestClose}
              className="shrink-0 rounded-xl border border-[#c5c9d6] bg-white/90 px-4 py-2 text-sm font-medium text-[#43485e] shadow-sm backdrop-blur-sm transition hover:border-[#43485e]/25 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#43485e]"
            >
              Close
            </button>
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
            <div className="flex flex-col items-center gap-2 px-2 pt-6 pb-1">
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
              {footerExtraActions ? <div className="flex flex-wrap justify-center gap-2">{footerExtraActions}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookFullView;
