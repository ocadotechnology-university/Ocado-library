import { act, renderHook } from "@testing-library/react";
import type { UIEvent } from "react";
import { describe, expect, it } from "vitest";
import { useIncrementalList } from "./useIncrementalList";

describe("useIncrementalList", () => {
  it("reveals items in pages and resets when the reset key changes", () => {
    const items = Array.from({ length: 120 }, (_, index) => index + 1);
    const { result, rerender } = renderHook(
      ({ resetKey }) => useIncrementalList(items, 50, resetKey),
      { initialProps: { resetKey: "books" } },
    );

    expect(result.current.visibleItems).toHaveLength(50);
    expect(result.current.hasMore).toBe(true);

    act(() => {
      result.current.onMainScroll({
        currentTarget: {
          scrollHeight: 1000,
          scrollTop: 800,
          clientHeight: 200,
        },
      } as unknown as UIEvent<HTMLElement>);
    });

    expect(result.current.visibleItems).toHaveLength(100);

    rerender({ resetKey: "books|typescript" });

    expect(result.current.visibleItems).toHaveLength(50);
  });
});
