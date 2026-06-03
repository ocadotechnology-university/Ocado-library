import { useEffect, useRef, useState } from "react";

const previewTagPillClass =
  "inline-flex max-w-full shrink-0 items-center rounded-full border border-[#43485e]/25 bg-[#43485e]/12 px-2.5 py-1 text-xs font-semibold leading-none text-[#2f3a52] shadow-sm";

const ELLIPSIS_CLASS =
  "inline-flex shrink-0 items-center text-xs font-bold leading-none text-[#43485e]/80";

type PreviewTagsRowProps = {
  tags: string[];
  compact?: boolean;
  className?: string;
  /** How many lines of tag pills to show before "..." */
  maxLines?: 1 | 2;
};

/**
 * Renders only full tag pills that fit; never clips a pill mid-text.
 * Appends "..." when additional tags are hidden.
 */
export default function PreviewTagsRow({
  tags,
  compact,
  className = "",
  maxLines = 1,
}: PreviewTagsRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const calc = () => {
      if (tags.length === 0) {
        setVisibleCount(0);
        return;
      }

      const available = container.clientWidth;
      if (available <= 0) return;

      const pills = Array.from(measure.children) as HTMLElement[];

      if (maxLines === 2) {
        const lineTops = [
          ...new Set(pills.map((pill) => pill.offsetTop)),
        ].sort((a, b) => a - b);

        if (lineTops.length <= 2) {
          setVisibleCount(tags.length);
          return;
        }

        const secondLineTop = lineTops[1];
        let count = 0;
        for (const pill of pills) {
          if (pill.offsetTop > secondLineTop) break;
          count++;
        }
        setVisibleCount(count);
        return;
      }

      const gap = 6;
      const ellipsisReserve = 16;
      let used = 0;
      let count = 0;

      for (let i = 0; i < pills.length; i++) {
        const pillWidth = pills[i].offsetWidth;
        const gapBefore = count > 0 ? gap : 0;
        const moreAfter = i < pills.length - 1;
        const reserve = moreAfter ? gap + ellipsisReserve : 0;
        const nextTotal = used + gapBefore + pillWidth + reserve;

        if (nextTotal > available) {
          break;
        }

        used += gapBefore + pillWidth;
        count++;
      }

      setVisibleCount(count);
    };

    calc();
    const observer = new ResizeObserver(calc);
    observer.observe(container);
    return () => observer.disconnect();
  }, [tags, maxLines]);

  if (tags.length === 0) return null;

  const showEllipsis = visibleCount < tags.length;
  const wrapClass =
    maxLines === 2
      ? "flex-wrap content-start gap-x-1.5 gap-y-1"
      : "flex-nowrap items-center gap-1.5";

  return (
    <div
      className={[
        "relative min-w-0 w-full",
        compact ? "h-full" : "mt-1.5 h-7 shrink-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      title={tags.join(", ")}
    >
      <div
        ref={measureRef}
        className={[
          "pointer-events-none absolute top-0 left-0 z-[-1] flex w-full gap-x-1.5 gap-y-1 opacity-0",
          maxLines === 2 ? "flex-wrap" : "flex-nowrap",
        ].join(" ")}
        aria-hidden
      >
        {tags.map((tag) => (
          <span key={tag} className={previewTagPillClass}>
            {tag}
          </span>
        ))}
      </div>
      <div
        ref={containerRef}
        className={`flex h-full min-w-0 overflow-hidden ${wrapClass}`}
      >
        {tags.slice(0, visibleCount).map((tag) => (
          <span key={tag} className={`${previewTagPillClass} max-w-full truncate`}>
            {tag}
          </span>
        ))}
        {showEllipsis ? <span className={ELLIPSIS_CLASS}>...</span> : null}
      </div>
    </div>
  );
}
