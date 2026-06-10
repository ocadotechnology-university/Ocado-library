import type { BackendItemStatus } from "./api";

export type MigrationDescriptionType = "Book" | "BoardGame" | "PSGame";

export type MigrationInstance = {
  internalId: string;
  status: Extract<BackendItemStatus, "AVAILABLE" | "BORROWED">;
};

type MigrationDescriptionBase = {
  type: MigrationDescriptionType;
  title: string;
  description?: string | null;
  tags?: string[] | null;
  instances: MigrationInstance[];
};

export type MigrationBookEntry = MigrationDescriptionBase & {
  type: "Book";
  author: string;
  isbn?: string | null;
  image?: string | null;
};

export type MigrationBoardGameEntry = MigrationDescriptionBase & {
  type: "BoardGame";
  numberOfPlayers?: number | null;
};

export type MigrationPSGameEntry = MigrationDescriptionBase & {
  type: "PSGame";
};

export type MigrationDescription =
  | MigrationBookEntry
  | MigrationBoardGameEntry
  | MigrationPSGameEntry;

export type CatalogImportValidationError = {
  path: string;
  message: string;
  rowIndex?: number;
};

export type CatalogImportValidationResult = {
  descriptions: MigrationDescription[] | null;
  errors: CatalogImportValidationError[];
};

export const INTERNAL_ID_REGEX: Record<MigrationDescriptionType, RegExp> = {
  Book: /^OC-WRO-B-[A-Z0-9]+$/,
  BoardGame: /^OC-WRO-G-[A-Z0-9]+$/,
  PSGame: /^OC-WRO-PS-[A-Z0-9]+$/,
};

export const INTERNAL_ID_HINT: Record<MigrationDescriptionType, string> = {
  Book: "OC-WRO-B-<ID> (e.g. OC-WRO-B-0109)",
  BoardGame: "OC-WRO-G-<ID> (e.g. OC-WRO-G-0101)",
  PSGame: "OC-WRO-PS-<ID> (e.g. OC-WRO-PS-0001)",
};

const ALLOWED_TYPES = new Set<MigrationDescriptionType>([
  "Book",
  "BoardGame",
  "PSGame",
]);

const ALLOWED_INSTANCE_STATUSES = new Set<MigrationInstance["status"]>([
  "AVAILABLE",
  "BORROWED",
]);

export function parseMigrationJson(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new SyntaxError("JSON input is empty");
  }
  return JSON.parse(trimmed) as unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pushError(
  errors: CatalogImportValidationError[],
  path: string,
  message: string,
  rowIndex?: number,
) {
  errors.push({ path, message, rowIndex });
}

function normalizeInternalId(value: string): string {
  return value.trim().toUpperCase();
}

function validateOptionalString(
  value: unknown,
  path: string,
  errors: CatalogImportValidationError[],
  rowIndex: number,
) {
  if (value !== null && value !== undefined && typeof value !== "string") {
    pushError(errors, path, "must be a string or null", rowIndex);
  }
}

function validateTags(
  value: unknown,
  path: string,
  errors: CatalogImportValidationError[],
  rowIndex: number,
): string[] | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (!Array.isArray(value)) {
    pushError(errors, path, "must be an array of strings or null", rowIndex);
    return null;
  }
  if (value.some((tag) => typeof tag !== "string")) {
    pushError(errors, path, "every tag must be a string", rowIndex);
    return null;
  }
  return value.map((tag) => String(tag).trim()).filter(Boolean);
}

function validateInstance(
  value: unknown,
  path: string,
  type: MigrationDescriptionType,
  errors: CatalogImportValidationError[],
  rowIndex: number,
  seenInternalIds: Set<string>,
): MigrationInstance | null {
  if (!isRecord(value)) {
    pushError(errors, path, "must be an object", rowIndex);
    return null;
  }

  const internalIdRaw = value.internalId;
  if (typeof internalIdRaw !== "string" || internalIdRaw.trim() === "") {
    pushError(
      errors,
      `${path}.internalId`,
      "required non-empty string",
      rowIndex,
    );
    return null;
  }

  const internalId = normalizeInternalId(internalIdRaw);
  if (!INTERNAL_ID_REGEX[type].test(internalId)) {
    pushError(
      errors,
      `${path}.internalId`,
      `must match ${INTERNAL_ID_HINT[type]}`,
      rowIndex,
    );
  }
  if (seenInternalIds.has(internalId)) {
    pushError(
      errors,
      `${path}.internalId`,
      `duplicate internalId in file: ${internalId}`,
      rowIndex,
    );
  } else {
    seenInternalIds.add(internalId);
  }

  const statusRaw = value.status;
  if (typeof statusRaw !== "string") {
    pushError(
      errors,
      `${path}.status`,
      "required (AVAILABLE or BORROWED)",
      rowIndex,
    );
    return null;
  }

  if (
    !ALLOWED_INSTANCE_STATUSES.has(statusRaw as MigrationInstance["status"])
  ) {
    pushError(
      errors,
      `${path}.status`,
      "must be AVAILABLE or BORROWED",
      rowIndex,
    );
    return null;
  }

  return {
    internalId,
    status: statusRaw as MigrationInstance["status"],
  };
}

function validateDescription(
  value: unknown,
  rowIndex: number,
  errors: CatalogImportValidationError[],
  seenInternalIds: Set<string>,
): MigrationDescription | null {
  const path = `[${rowIndex}]`;
  if (!isRecord(value)) {
    pushError(errors, path, "must be an object", rowIndex);
    return null;
  }

  const typeRaw = value.type;
  if (
    typeof typeRaw !== "string" ||
    !ALLOWED_TYPES.has(typeRaw as MigrationDescriptionType)
  ) {
    pushError(
      errors,
      `${path}.type`,
      "required (Book, BoardGame, or PSGame)",
      rowIndex,
    );
    return null;
  }
  const type = typeRaw as MigrationDescriptionType;

  const title = value.title;
  if (typeof title !== "string" || title.trim() === "") {
    pushError(errors, `${path}.title`, "required non-empty string", rowIndex);
  }

  validateOptionalString(
    value.description,
    `${path}.description`,
    errors,
    rowIndex,
  );
  const tags = validateTags(value.tags, `${path}.tags`, errors, rowIndex);

  if (!("instances" in value)) {
    pushError(errors, `${path}.instances`, "required array", rowIndex);
    return null;
  }
  if (!Array.isArray(value.instances)) {
    pushError(errors, `${path}.instances`, "must be an array", rowIndex);
    return null;
  }

  if (type === "PSGame" && value.instances.length > 1) {
    pushError(
      errors,
      `${path}.instances`,
      "PSGame can have at most one physical instance",
      rowIndex,
    );
  }

  const instances: MigrationInstance[] = [];
  value.instances.forEach((instance, index) => {
    const parsed = validateInstance(
      instance,
      `${path}.instances[${index}]`,
      type,
      errors,
      rowIndex,
      seenInternalIds,
    );
    if (parsed != null) {
      instances.push(parsed);
    }
  });

  if (typeof title !== "string" || title.trim() === "") {
    return null;
  }

  const base = {
    type,
    title: title.trim(),
    description:
      typeof value.description === "string" ? value.description : null,
    tags,
    instances,
  };

  if (type === "Book") {
    if (!("author" in value)) {
      pushError(
        errors,
        `${path}.author`,
        "required for Book (use empty string for unknown authors)",
        rowIndex,
      );
      return null;
    }
    if (typeof value.author !== "string") {
      pushError(errors, `${path}.author`, "must be a string", rowIndex);
      return null;
    }
    validateOptionalString(value.isbn, `${path}.isbn`, errors, rowIndex);
    validateOptionalString(value.image, `${path}.image`, errors, rowIndex);

    return {
      ...base,
      type: "Book",
      author: value.author,
      isbn: typeof value.isbn === "string" ? value.isbn : null,
      image: typeof value.image === "string" ? value.image : null,
    };
  }

  if (type === "BoardGame") {
    if (
      "numberOfPlayers" in value &&
      value.numberOfPlayers !== null &&
      value.numberOfPlayers !== undefined
    ) {
      if (
        typeof value.numberOfPlayers !== "number" ||
        !Number.isInteger(value.numberOfPlayers) ||
        value.numberOfPlayers < 1
      ) {
        pushError(
          errors,
          `${path}.numberOfPlayers`,
          "must be a positive integer when provided",
          rowIndex,
        );
      }
    }

    return {
      ...base,
      type: "BoardGame",
      numberOfPlayers:
        typeof value.numberOfPlayers === "number"
          ? value.numberOfPlayers
          : null,
    };
  }

  return {
    ...base,
    type: "PSGame",
  };
}

export function validateMigrationDescriptions(
  input: unknown,
): CatalogImportValidationResult {
  const errors: CatalogImportValidationError[] = [];

  if (!Array.isArray(input)) {
    return {
      descriptions: null,
      errors: [
        { path: "", message: "root must be a JSON array of descriptions" },
      ],
    };
  }

  if (input.length === 0) {
    return {
      descriptions: null,
      errors: [
        { path: "", message: "import file must contain at least one entry" },
      ],
    };
  }

  const seenInternalIds = new Set<string>();
  const descriptions: MigrationDescription[] = [];

  input.forEach((entry, rowIndex) => {
    const description = validateDescription(
      entry,
      rowIndex,
      errors,
      seenInternalIds,
    );
    if (description != null) {
      descriptions.push(description);
    }
  });

  if (errors.length > 0) {
    return { descriptions: null, errors };
  }

  return { descriptions, errors: [] };
}

export function validateMigrationDescriptionsText(
  text: string,
): CatalogImportValidationResult {
  try {
    const parsed = parseMigrationJson(text);
    return validateMigrationDescriptions(parsed);
  } catch (error) {
    const message =
      error instanceof SyntaxError
        ? `Invalid JSON: ${error.message}`
        : "Invalid JSON input";
    return {
      descriptions: null,
      errors: [{ path: "", message }],
    };
  }
}
