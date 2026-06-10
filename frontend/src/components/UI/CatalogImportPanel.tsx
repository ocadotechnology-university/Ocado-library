import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  importCatalog,
  type CatalogImportResponse,
} from "../../lib/api";
import {
  validateMigrationDescriptionsText,
  type CatalogImportValidationError,
  type MigrationDescription,
} from "../../lib/catalogImportValidation";
import examplePayload from "../../data/catalog-import-example.json";

export type CatalogImportPanelProps = {
  onClose: () => void;
  onImported: () => void | Promise<void>;
};

type PanelPhase = "edit" | "validated" | "imported";

export default function CatalogImportPanel({
  onClose,
  onImported,
}: CatalogImportPanelProps) {
  const [jsonText, setJsonText] = useState("");
  const [phase, setPhase] = useState<PanelPhase>("edit");
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
    setPhase(
      result.errors.length === 0 && result.descriptions != null
        ? "validated"
        : "edit",
    );
    setImportResult(null);
    setImportError(null);
    return result;
  }, []);

  useEffect(() => {
    if (!jsonText.trim()) {
      setValidationErrors([]);
      setValidatedDescriptions(null);
      setPhase("edit");
      return;
    }

    const handle = window.setTimeout(() => {
      runValidation(jsonText);
    }, 350);

    return () => window.clearTimeout(handle);
  }, [jsonText, runValidation]);

  const loadExample = () => {
    setJsonText(JSON.stringify(examplePayload, null, 2));
  };

  const handleFileUpload = async (file: File | null) => {
    if (file == null) {
      return;
    }
    const text = await file.text();
    setJsonText(text);
  };

  const handleImport = async () => {
    const result = runValidation(jsonText);
    if (result.descriptions == null) {
      return;
    }

    setImporting(true);
    setImportError(null);
    try {
      const response = await importCatalog(result.descriptions);
      setImportResult(response);
      setPhase("imported");
      if (response.imported > 0) {
        await onImported();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setImportError(error.message);
      } else {
        setImportError("Import failed. Try again.");
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/25 px-4 py-6">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#b1b2b5]/80 bg-white shadow-lg">
        <div className="border-b border-[#e5e7eb] px-5 py-4">
          <h3 className="text-lg font-semibold text-[#43485e]">
            Import catalog
          </h3>
          <p className="mt-1 text-sm text-[#6b7289]">
            Paste or upload a JSON array. Each entry needs a{" "}
            <span className="font-mono text-xs">type</span> (
            <span className="font-mono text-xs">Book</span>,{" "}
            <span className="font-mono text-xs">BoardGame</span>, or{" "}
            <span className="font-mono text-xs">PSGame</span>) and type-specific
            fields. Physical copies use{" "}
            <span className="font-mono text-xs">OC-WRO-B/G/PS-…</span> IDs.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-md border border-[#43485e]/30 bg-[#eeeef0] px-3 py-1.5 text-sm font-medium text-[#43485e] transition hover:bg-white">
              Upload JSON
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) =>
                  void handleFileUpload(event.target.files?.[0] ?? null)
                }
              />
            </label>
            <button
              type="button"
              onClick={loadExample}
              className="rounded-md border border-[#43485e]/30 bg-[#eeeef0] px-3 py-1.5 text-sm font-medium text-[#43485e] transition hover:bg-white"
            >
              Load example
            </button>
            {summary ? (
              <span className="text-sm text-[#6b7289]">
                Ready: {summary.total} entries ({summary.byType.Book} books,{" "}
                {summary.byType.BoardGame} board games, {summary.byType.PSGame}{" "}
                PS games), {summary.instances} copies
              </span>
            ) : null}
          </div>

          <textarea
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
            placeholder='[{"type":"Book","title":"Effective Java","author":"Joshua Bloch","isbn":"978-0134685991","description":null,"tags":["java"],"instances":[{"internalId":"OC-WRO-B-0104","status":"AVAILABLE"}]},{"type":"BoardGame","title":"Catan","description":"Classic strategy game.","numberOfPlayers":4,"tags":["strategy"],"instances":[{"internalId":"OC-WRO-G-0101","status":"AVAILABLE"}]}]'
            spellCheck={false}
            className="min-h-[240px] w-full rounded-lg border border-[#b1b2b5] px-3 py-2 font-mono text-xs leading-5 text-[#43485e] focus:border-[#43485e] focus:outline-none"
          />

          {validationErrors.length > 0 ? (
            <div className="rounded-lg border border-[#f3b4b4] bg-[#fef2f2] px-3 py-2">
              <p className="text-sm font-medium text-[#b91c1c]">
                Validation issues ({validationErrors.length})
              </p>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-[#991b1b]">
                {validationErrors.map((error, index) => (
                  <li key={`${error.path}-${index}`}>
                    <span className="font-mono">{error.path || "root"}</span>:{" "}
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : phase === "validated" ? (
            <p className="rounded-lg border border-[#b7d9bc] bg-[#eefbf0] px-3 py-2 text-sm text-[#166534]">
              JSON is valid and ready to import.
            </p>
          ) : null}

          {importError ? (
            <p className="rounded-lg border border-[#f3b4b4] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
              {importError}
            </p>
          ) : null}

          {importResult ? (
            <div className="rounded-lg border border-[#b1b2b5]/80 bg-[#f8f9fb] px-3 py-2">
              <p className="text-sm font-medium text-[#43485e]">
                Import finished: {importResult.imported} imported,{" "}
                {importResult.failed} failed (of {importResult.totalRows})
              </p>
              <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-xs text-[#6b7289]">
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
        </div>

        <div className="flex justify-end gap-2 border-t border-[#e5e7eb] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className="rounded-md border border-[#43485e]/30 bg-[#eeeef0] px-3 py-1.5 text-sm text-[#43485e]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => void handleImport()}
            disabled={
              importing ||
              phase !== "validated" ||
              validatedDescriptions == null ||
              validationErrors.length > 0
            }
            className="rounded-md bg-[#43485e] px-3 py-1.5 text-sm text-[#eeeef0] disabled:opacity-60"
          >
            {importing ? "Importing…" : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
