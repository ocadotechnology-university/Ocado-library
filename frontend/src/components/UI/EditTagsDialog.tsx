import { useEffect, useState } from "react";
import { ApiError } from "../../lib/api";
import TagsInput from "./TagsInput";

export type EditTagsDialogProps = {
  title: string;
  initialTags: string[];
  allTagSuggestions: string[];
  onClose: () => void;
  onSave: (tags: string[]) => Promise<void>;
};

export default function EditTagsDialog({
  title,
  initialTags,
  allTagSuggestions,
  onClose,
  onSave,
}: EditTagsDialogProps) {
  const [tags, setTags] = useState(initialTags);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/25 px-4">
      <div className="w-full max-w-md rounded-xl border border-[#b1b2b5]/80 bg-white p-4 shadow-lg">
        <h3 className="text-base font-semibold text-[#43485e]">Edit tags</h3>
        <p className="mt-1 text-sm text-[#6b7289]">{title}</p>
        <div className="mt-3">
          <TagsInput
            value={tags}
            onChange={setTags}
            suggestions={allTagSuggestions}
            placeholder="Type to search or add a new tag…"
          />
        </div>
        {error ? (
          <p className="mt-2 text-sm text-[#b91c1c]">{error}</p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-[#43485e]/30 bg-[#eeeef0] px-3 py-1.5 text-sm text-[#43485e]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              setSaving(true);
              setError(null);
              void onSave(tags)
                .then(() => onClose())
                .catch((err) => {
                  if (err instanceof ApiError && err.status === 403) {
                    setError("You do not have permission to edit tags.");
                  } else if (err instanceof ApiError && err.status === 401) {
                    setError("Session expired. Please sign in again.");
                  } else if (err instanceof ApiError) {
                    setError(err.message);
                  } else {
                    setError("Could not save tags. Try again.");
                  }
                })
                .finally(() => setSaving(false));
            }}
            className="rounded-md bg-[#43485e] px-3 py-1.5 text-sm text-[#eeeef0] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
