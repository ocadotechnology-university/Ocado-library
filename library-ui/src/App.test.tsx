import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the home template", () => {
    render(<App />);
    expect(screen.getByText("Ocado Library")).toBeInTheDocument();
    expect(screen.getByText("Main Content")).toBeInTheDocument();
  });
});
