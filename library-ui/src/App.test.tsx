// src/App.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renderuje nagłówek strony głównej", () => {
    render(<App />);

    // Tekst z HomePage.tsx, linie 34–36
    const heading = screen.getByText("Welcome to the Ocado Technology Library");

    expect(heading).toBeDefined();
  });

  it("renderuje pole wyszukiwania", () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(
      "Search by title, author, or ISBN...",
    );

    expect(searchInput).toBeDefined();
  });
});
