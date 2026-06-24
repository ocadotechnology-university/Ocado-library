import type { UIEvent } from "react";
import { useCallback, useMemo, useState } from "react";

const SCROLL_LOAD_THRESHOLD_PX = 240;

function distanceFromBottom(element: HTMLElement): number {
  return element.scrollHeight - element.scrollTop - element.clientHeight;
}

export function useIncrementalList<T>(
  items: T[],
  pageSize: number,
  resetKey: string,
) {
  const [pageCount, setPageCount] = useState(1);
  const [resetSnapshot, setResetSnapshot] = useState(resetKey);

  if (resetKey !== resetSnapshot) {
    setResetSnapshot(resetKey);
    setPageCount(1);
  }

  const visibleCount = Math.min(pageCount * pageSize, items.length);
  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );
  const hasMore = visibleCount < items.length;
  const maxPages = Math.max(1, Math.ceil(items.length / pageSize));

  const loadNextPage = useCallback(() => {
    setPageCount((current) => {
      const currentVisible = Math.min(current * pageSize, items.length);
      if (currentVisible >= items.length) return current;
      return Math.min(current + 1, maxPages);
    });
  }, [items.length, maxPages, pageSize]);

  const onMainScroll = useCallback(
    (event: UIEvent<HTMLElement>) => {
      if (!hasMore) return;
      if (distanceFromBottom(event.currentTarget) <= SCROLL_LOAD_THRESHOLD_PX) {
        loadNextPage();
      }
    },
    [hasMore, loadNextPage],
  );

  return { visibleItems, hasMore, onMainScroll, totalCount: items.length };
}
