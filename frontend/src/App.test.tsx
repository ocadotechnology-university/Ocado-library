import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppRoutes } from "./App";
import { AppChromeProvider } from "./context/AppChromeContext";
import { AuthProvider } from "./context/AuthContext";

const AUTH_TOKEN_KEY = "ocado.library.auth.persistent.token";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function createCatalogFetchMock(): typeof fetch {
  return vi.fn(async (input: RequestInfo) => {
    const url = String(input);

    if (url.endsWith("/api/me")) {
      return jsonResponse({
        email: "user@example.com",
        roles: ["USER"],
      });
    }

    if (url.includes("/api/admin/journal")) {
      return jsonResponse([]);
    }

    if (url.endsWith("/api/descriptions/Book/all")) {
      return jsonResponse([
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
      ]);
    }

    if (url.endsWith("/api/descriptions/BoardGame/all")) {
      return jsonResponse([]);
    }

    if (url.endsWith("/api/descriptions/PSGame/all")) {
      return jsonResponse([]);
    }

    if (
      url.endsWith("/api/descriptions/Book/tags") ||
      url.endsWith("/api/descriptions/BoardGame/tags") ||
      url.endsWith("/api/descriptions/PSGame/tags")
    ) {
      return jsonResponse({ tags: [] });
    }

    return new Response(null, { status: 404 });
  }) as typeof fetch;
}

function renderAppAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppChromeProvider>
          <AppRoutes />
        </AppChromeProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("renders login page for guests", () => {
    renderAppAt("/login");
    expect(screen.getByText("Sign in to Ocado Library")).toBeInTheDocument();
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });

  it("renders the home catalog for signed-in users", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "test-token");
    vi.stubGlobal("fetch", createCatalogFetchMock());

    renderAppAt("/");

    expect(await screen.findByText("Ocado Library")).toBeInTheDocument();
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(await screen.findByText("Books(1)")).toBeInTheDocument();
    expect(await screen.findByText("TypeScript Deep Dive")).toBeInTheDocument();
    expect(screen.getAllByText("typescript").length).toBeGreaterThan(0);
  });

  it("redirects guests from account to login", async () => {
    renderAppAt("/account");

    expect(await screen.findByText("Sign in to Ocado Library")).toBeInTheDocument();
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });

  it("renders account page with log out for signed-in users", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "test-token");
    vi.stubGlobal("fetch", createCatalogFetchMock());

    renderAppAt("/account");

    expect(await screen.findByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Account sections" })).toBeInTheDocument();
  });
});
