import type { MigrationDescriptionType } from "../lib/catalogImportValidation";

export type CatalogImportTemplateType = MigrationDescriptionType;

export type CatalogImportTemplate = {
  label: string;
  empty: unknown;
  example: unknown;
};

export const CATALOG_IMPORT_TEMPLATES: Record<
  CatalogImportTemplateType,
  CatalogImportTemplate
> = {
  Book: {
    label: "Book",
    empty: [
      {
        type: "Book",
        title: "",
        author: "",
        isbn: null,
        description: null,
        image: null,
        tags: [],
        instances: [{ internalId: "", status: "AVAILABLE" }],
      },
    ],
    example: [
      {
        type: "Book",
        title: "Effective Java",
        author: "Joshua Bloch",
        isbn: "978-0134685991",
        description: null,
        tags: ["java"],
        instances: [{ internalId: "OC-B-WR-104", status: "AVAILABLE" }],
      },
    ],
  },
  BoardGame: {
    label: "Board game",
    empty: [
      {
        type: "BoardGame",
        title: "",
        description: null,
        numberOfPlayers: null,
        tags: [],
        instances: [{ internalId: "", status: "AVAILABLE" }],
      },
    ],
    example: [
      {
        type: "BoardGame",
        title: "Catan",
        description: "Classic resource-trading board game.",
        numberOfPlayers: 4,
        tags: ["strategy", "family"],
        instances: [
          { internalId: "OC-G-WR-101", status: "AVAILABLE" },
          { internalId: "OC-G-WR-102", status: "BORROWED" },
        ],
      },
    ],
  },
  PSGame: {
    label: "PS game",
    empty: [
      {
        type: "PSGame",
        title: "",
        description: null,
        tags: [],
        instances: [{ internalId: "", status: "AVAILABLE" }],
      },
    ],
    example: [
      {
        type: "PSGame",
        title: "Gran Turismo 7",
        description: "Racing simulation for PlayStation.",
        tags: ["racing", "ps5"],
        instances: [{ internalId: "OC-PS-WR-001", status: "AVAILABLE" }],
      },
    ],
  },
};

export const CATALOG_IMPORT_TEMPLATE_TYPES: CatalogImportTemplateType[] = [
  "Book",
  "BoardGame",
  "PSGame",
];
