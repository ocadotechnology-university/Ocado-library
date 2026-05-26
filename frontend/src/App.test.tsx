import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AppRoutes } from "./App";
import { AppChromeProvider } from "./context/AppChromeContext";
import { AuthProvider } from "./context/AuthContext";

describe("App", () => {
  it("renders login page for guests", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <AppChromeProvider>
            <AppRoutes />
          </AppChromeProvider>
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText("Sign in to Ocado Library")).toBeInTheDocument();
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });

  it("renders the home template", async () => {
    localStorage.setItem("ocado.library.auth.persistent.token", "test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo) => {
        if (String(input).endsWith("/api/me")) {
          return new Response(
            JSON.stringify({
              email: "user@example.com",
              roles: ["USER"],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
        if (String(input).endsWith("/api/descriptions/Book/all")) {
          return new Response(
            JSON.stringify([
              {
                id: 1,
                internalId: null,
                type: "Book",
                title: "TypeScript Deep Dive",
                author: "Basarat Ali Syed",
                isbn: "9780000000001",
                image: "https://example.com/cover.jpg",
                description: "Practical TypeScript guidance.",
                tags: ["typescript"],
                descriptionStatus: "AVAILABLE",
              },
            ]),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
        return new Response(null, { status: 404 });
      }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <AppChromeProvider>
            <AppRoutes />
          </AppChromeProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Ocado Library")).toBeInTheDocument();
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(await screen.findByText("TypeScript Deep Dive")).toBeInTheDocument();

    localStorage.removeItem("ocado.library.auth.persistent.token");
    vi.unstubAllGlobals();
  });
});
