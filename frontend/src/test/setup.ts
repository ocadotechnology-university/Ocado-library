import "@testing-library/jest-dom/vitest";

/** jsdom does not provide ResizeObserver (used by PreviewTagsRow). */
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
