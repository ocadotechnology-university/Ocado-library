import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  formatUserFacingErrorMessage,
  importCatalog,
  validateCatalogImport,
  type CatalogImportResponse,
} from "../../lib/api";
import {
  validateMigrationDescriptionsText,
  type CatalogImportValidationError,
  type MigrationDescription,
} from "../../lib/catalogImportValidation";
import {
  CATALOG_IMPORT_TEMPLATE_TYPES,
  CATALOG_IMPORT_TEMPLATES,
  type CatalogImportTemplateType,
} from "../../data/catalog-import-templates";

export type CatalogImportPanelProps = {
  onClose: () => void;
  onImported: () => void | Promise<void>;
};


function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-[#43485e] transition-transform duration-200 ${
        expanded ? "rotate-180" : ""
      }`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="rounded border border-[#43485e]/25 bg-[#eeeef0] px-2 py-0.5 text-[11px] font-medium text-[#43485e] transition hover:bg-white"
      aria-label="Copy JSON to clipboard"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function CatalogImportPanel({
  onClose,
  onImported,
}: CatalogImportPanelProps) {
  const [jsonText, setJsonText] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    CatalogImportValidationError[]
  >([]);
  const [validatedDescriptions, setValidatedDescriptions] = useState<
    MigrationDescription[] | null
  >(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] =
    useState<CatalogImportResponse | null>(null);
  const [selectedTemplateType, setSelectedTemplateType] =
    useState<CatalogImportTemplateType>("Book");
  const [templatesVisible, setTemplatesVisible] = useState(true);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [serverChecking, setServerChecking] = useState(false);

  const selectedTemplate = CATALOG_IMPORT_TEMPLATES[selectedTemplateType];
  const emptyTemplateText = useMemo(
    () => formatJson(selectedTemplate.empty),
    [selectedTemplate.empty],
  );
  const exampleTemplateText = useMemo(
    () => formatJson(selectedTemplate.example),
    [selectedTemplate.example],
  );

  const blockingIssues = useMemo(
    () => [
      ...validationErrors,
      ...serverErrors.map((message) => ({ path: "", message })),
    ],
    [validationErrors, serverErrors],
  );

  const readyToImport =
    validatedDescriptions != null &&
    blockingIssues.length === 0 &&
    !serverChecking;

  const summary = useMemo(() => {
    if (validatedDescriptions == null) {
      return null;
    }
    const instanceCount = validatedDescriptions.reduce(
      (total, entry) => total + entry.instances.length,
      0,
    );
    const byType = validatedDescriptions.reduce(
      (counts, entry) => {
        counts[entry.type] += 1;
        return counts;
      },
      { Book: 0, BoardGame: 0, PSGame: 0 },
    );
    return {
      total: validatedDescriptions.length,
      instances: instanceCount,
      byType,
    };
  }, [validatedDescriptions]);

  const runValidation = useCallback((text: string) => {
    const result = validateMigrationDescriptionsText(text);
    setValidationErrors(result.errors);
    setValidatedDescriptions(result.descriptions);
    setServerErrors([]);
    setImportResult(null);
    setImportError(null);
    return result;
  }, []);

  useEffect(() => {
    if (!jsonText.trim()) {
      setValidationErrors([]);
      setValidatedDescriptions(null);
      setServerErrors([]);
      setServerChecking(false);
      return;
    }

    const handle = window.setTimeout(() => {
      runValidation(jsonText);
    }, 350);

    return () => window.clearTimeout(handle);
  }, [jsonText, runValidation]);

  useEffect(() => {
    if (validatedDescriptions == null || validationErrors.length > 0) {
      setServerErrors([]);
      setServerChecking(false);
      return;
    }

    let cancelled = false;
    setServerChecking(true);
    setServerErrors([]);

    const handle = window.setTimeout(() => {
      void validateCatalogImport(validatedDescriptions)
        .then((response) => {
          if (cancelled) {
            return;
          }
          setServerErrors(response.valid ? [] : response.errors);
          setServerChecking(false);
        })
        .catch((error) => {
          if (cancelled) {
            return;
          }
          if (error instanceof ApiError) {
            setServerErrors([
              formatUserFacingErrorMessage(error.message),
            ]);
          } else {
            setServerErrors([
              "Could not verify import against the catalog. Try again.",
            ]);
          }
          setServerChecking(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [validatedDescriptions, validationErrors]);

  const handleFileImport = async (file: File | null) => {
    if (file == null) {
      return;
    }
    const text = await file.text();
    setJsonText(text);
  };

  const handleImport = async () => {
    if (validatedDescriptions == null || !readyToImport) {
      return;
    }

    setImporting(true);
    setImportError(null);
    try {
      const response = await importCatalog(validatedDescriptions);
      setImportResult(response);
      if (response.imported > 0) {
        await onImported();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setImportError(formatUserFacingErrorMessage(error.message));
      } else {
        setImportError("Import failed. Try again.");
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] w-full flex-col rounded-2xl border border-[#b1b2b5]/80 bg-white shadow-sm">
      <div className="relative border-b border-[#e5e7eb] px-6 py-5 pr-14">
        <button
          type="button"
          onClick={onClose}
          disabled={importing}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-[#43485e]/20 bg-[#eeeef0] text-lg leading-none text-[#43485e] transition hover:bg-white disabled:opacity-60"
          aria-label="Close import"
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold text-[#43485e]">
          Import catalog
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-[#6b7289]">
          Edit JSON manually in the editor below, or use{" "}
          <span className="font-medium text-[#43485e]">Import from json</span> to
          load a file into the editor. Each entry needs a{" "}
          <span className="font-mono text-xs">type</span> (
          <span className="font-mono text-xs">Book</span>,{" "}
          <span className="font-mono text-xs">BoardGame</span>, or{" "}
          <span className="font-mono text-xs">PSGame</span>) and type-specific
          fields. Physical copies use{" "}
          <span className="font-mono text-xs">OC-B/G/PS-WR-000</span> IDs.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
        <textarea
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          placeholder="Paste or type your JSON array here…"
          spellCheck={false}
          className="min-h-[360px] w-full flex-1 rounded-lg border border-[#b1b2b5] px-4 py-3 font-mono text-sm leading-6 text-[#43485e] focus:border-[#43485e] focus:outline-none lg:min-h-[420px]"
        />

        {blockingIssues.length > 0 ? (
          <div className="rounded-lg border border-[#f3b4b4] bg-[#fef2f2] px-4 py-3">
            <p className="text-sm font-medium text-[#b91c1c]">
              Import blocked ({blockingIssues.length})
            </p>
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-[#991b1b]">
              {blockingIssues.map((error, index) => (
                <li key={`${error.path}-${index}`}>
                  {error.path ? (
                    <>
                      <span className="font-mono">{error.path}</span>:{" "}
                    </>
                  ) : null}
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        ) : serverChecking ? (
          <p className="rounded-lg border border-[#b1b2b5]/80 bg-[#f8f9fb] px-4 py-3 text-sm text-[#6b7289]">
            Checking instance IDs against the catalog…
          </p>
        ) : readyToImport ? (
          <p className="rounded-lg border border-[#b7d9bc] bg-[#eefbf0] px-4 py-3 text-sm text-[#166534]">
            JSON is valid and ready to import.
          </p>
        ) : null}

        {importError ? (
          <p className="rounded-lg border border-[#f3b4b4] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
            {importError}
          </p>
        ) : null}

        {importResult ? (
          <div className="rounded-lg border border-[#b1b2b5]/80 bg-[#f8f9fb] px-4 py-3">
            <p className="text-sm font-medium text-[#43485e]">
              Import finished: {importResult.imported} imported,{" "}
              {importResult.failed} failed (of {importResult.totalRows})
            </p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-[#6b7289]">
              {importResult.results.map((row) => (
                <li key={row.rowIndex}>
                  Row {row.rowIndex} ({row.type}): {row.status}
                  {row.descriptionId != null
                    ? ` · description #${row.descriptionId}`
                    : ""}
                  {row.instancesCreated > 0
                    ? ` · ${row.instancesCreated} copies`
                    : ""}
                  {row.errors.length > 0 ? ` · ${row.errors.join("; ")}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="cursor-pointer rounded-lg border border-[#43485e]/30 bg-[#eeeef0] px-4 py-2 text-sm font-medium text-[#43485e] transition hover:bg-white">
            Import from json
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) =>
                void handleFileImport(event.target.files?.[0] ?? null)
              }
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={importing}
              className="rounded-lg border border-[#43485e]/30 bg-[#eeeef0] px-4 py-2 text-sm text-[#43485e]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleImport()}
              disabled={
                importing ||
                !readyToImport ||
                validatedDescriptions == null
              }
              className="rounded-lg bg-[#43485e] px-4 py-2 text-sm text-[#eeeef0] disabled:opacity-60"
            >
              {importing ? "Importing…" : "Import"}
            </button>
          </div>
        </div>

        {summary ? (
          <p className="text-sm text-[#6b7289]">
            Ready: {summary.total} entries ({summary.byType.Book} books,{" "}
            {summary.byType.BoardGame} board games, {summary.byType.PSGame} PS
            games), {summary.instances} copies
          </p>
        ) : null}

        <div className="mt-2 border-t border-[#e5e7eb] pt-5">
          <button
            type="button"
            onClick={() => setTemplatesVisible((visible) => !visible)}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-1 text-left transition hover:bg-[#f8f9fb]"
            aria-expanded={templatesVisible}
          >
            <h3 className="text-sm font-semibold text-[#43485e]">
              JSON templates
            </h3>
            <ChevronIcon expanded={templatesVisible} />
          </button>

          {templatesVisible ? (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {CATALOG_IMPORT_TEMPLATE_TYPES.map((type) => {
                  const active = selectedTemplateType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedTemplateType(type)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-[#43485e] text-[#eeeef0]"
                          : "border border-[#43485e]/30 bg-[#eeeef0] text-[#43485e] hover:bg-white"
                      }`}
                    >
                      {CATALOG_IMPORT_TEMPLATES[type].label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="flex min-h-[220px] flex-col rounded-lg border border-[#b1b2b5]/80 bg-[#f8f9fb]">
                  <div className="flex items-center justify-between border-b border-[#e5e7eb] px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#6b7289]">
                      Template
                    </span>
                    <CopyButton text={emptyTemplateText} />
                  </div>
                  <pre className="overflow-auto px-3 py-2 font-mono text-xs leading-5 text-[#43485e]">
                    {emptyTemplateText}
                  </pre>
                </div>

                <div className="flex min-h-[220px] flex-col rounded-lg border border-[#b1b2b5]/80 bg-[#f8f9fb]">
                  <div className="flex items-center justify-between border-b border-[#e5e7eb] px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#6b7289]">
                      Example
                    </span>
                    <CopyButton text={exampleTemplateText} />
                  </div>
                  <pre className="overflow-auto px-3 py-2 font-mono text-xs leading-5 text-[#43485e]">
                    {exampleTemplateText}
                  </pre>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
