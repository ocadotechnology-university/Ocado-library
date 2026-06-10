import { describe, expect, it } from "vitest";
import {
  validateMigrationDescriptions,
  validateMigrationDescriptionsText,
  type MigrationBookEntry,
  type MigrationBoardGameEntry,
  type MigrationPSGameEntry,
} from "./catalogImportValidation";

const validBook: MigrationBookEntry = {
  type: "Book",
  title: "Effective Java",
  author: "Joshua Bloch",
  isbn: "978-0134685991",
  description: "Best practices for the Java platform.",
  tags: ["java"],
  instances: [{ internalId: "OC-WRO-B-0104", status: "AVAILABLE" }],
};

const validBoardGame: MigrationBoardGameEntry = {
  type: "BoardGame",
  title: "Catan",
  description: "Resource-trading classic.",
  numberOfPlayers: 4,
  tags: ["strategy"],
  instances: [{ internalId: "OC-WRO-G-0101", status: "AVAILABLE" }],
};

const validPsGame: MigrationPSGameEntry = {
  type: "PSGame",
  title: "Gran Turismo 7",
  description: "Racing sim.",
  tags: ["racing"],
  instances: [{ internalId: "OC-WRO-PS-0001", status: "AVAILABLE" }],
};

describe("validateMigrationDescriptions", () => {
  it("accepts mixed catalog types", () => {
    const result = validateMigrationDescriptions([
      validBook,
      validBoardGame,
      validPsGame,
    ]);
    expect(result.errors).toEqual([]);
    expect(result.descriptions).toHaveLength(3);
  });

  it("requires type on each entry", () => {
    const result = validateMigrationDescriptions([{ ...validBook, type: undefined }]);
    expect(result.errors.some((e) => e.path.endsWith(".type"))).toBe(true);
  });

  it("enforces book author", () => {
    const { author: _author, ...withoutAuthor } = validBook;
    const result = validateMigrationDescriptions([withoutAuthor]);
    expect(result.errors.some((e) => e.path.endsWith(".author"))).toBe(true);
  });

  it("rejects board game internalId with book prefix", () => {
    const result = validateMigrationDescriptions([
      {
        ...validBoardGame,
        instances: [{ internalId: "OC-WRO-B-0101", status: "AVAILABLE" }],
      },
    ]);
    expect(result.errors.some((e) => e.path.includes("internalId"))).toBe(true);
  });

  it("rejects multiple PS game instances", () => {
    const result = validateMigrationDescriptions([
      {
        ...validPsGame,
        instances: [
          { internalId: "OC-WRO-PS-0001", status: "AVAILABLE" },
          { internalId: "OC-WRO-PS-0002", status: "AVAILABLE" },
        ],
      },
    ]);
    expect(result.errors.some((e) => e.path.endsWith(".instances"))).toBe(true);
  });

  it("rejects duplicate internalIds across types", () => {
    const result = validateMigrationDescriptions([
      validBook,
      {
        ...validBoardGame,
        instances: [{ internalId: "OC-WRO-B-0104", status: "AVAILABLE" }],
      },
    ]);
    expect(result.errors.some((e) => e.message.includes("duplicate"))).toBe(true);
  });
});

describe("validateMigrationDescriptionsText", () => {
  it("parses valid JSON text", () => {
    const result = validateMigrationDescriptionsText(
      JSON.stringify([validBook, validBoardGame], null, 2),
    );
    expect(result.errors).toEqual([]);
    expect(result.descriptions).toHaveLength(2);
  });

  it("reports JSON syntax errors", () => {
    const result = validateMigrationDescriptionsText("{ not-json");
    expect(result.errors[0]?.message).toMatch(/Invalid JSON/i);
  });
});
