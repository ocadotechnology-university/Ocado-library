import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppRoutes } from "./App";
import { AppChromeProvider } from "./context/AppChromeContext";

describe("App", () => {
  it("renders the home template", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppChromeProvider>
          <AppRoutes />
        </AppChromeProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText("Ocado Library")).toBeInTheDocument();
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("TypeScript Deep Dive")).toBeInTheDocument();
  });
});
