import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
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
  });

  it("renders the home template", () => {
    localStorage.setItem(
      "ocado.library.auth.persistent",
      "jane.smith@ocado.com",
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
    expect(screen.getByText("Ocado Library")).toBeInTheDocument();
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("TypeScript Deep Dive")).toBeInTheDocument();
    localStorage.removeItem("ocado.library.auth.persistent");
  });
});
