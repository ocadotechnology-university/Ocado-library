import { describe, expect, it } from "vitest";
import { parseApiErrorBody } from "./api";

describe("parseApiErrorBody", () => {
  it("extracts message from JSON error bodies", () => {
    expect(
      parseApiErrorBody(
        JSON.stringify({
          status: 400,
          error: "Bad Request",
          message: "Duplicate internalId in file: OC-WRO-B-0104",
        }),
        "Failed to import catalog",
      ),
    ).toBe("Duplicate internalId in file: OC-WRO-B-0104");
  });

  it("falls back when body is empty", () => {
    expect(parseApiErrorBody("", "Failed to import catalog")).toBe(
      "Failed to import catalog",
    );
  });

  it("uses plain text bodies when not JSON", () => {
    expect(parseApiErrorBody("Service unavailable", "Request failed")).toBe(
      "Service unavailable",
    );
  });
});
