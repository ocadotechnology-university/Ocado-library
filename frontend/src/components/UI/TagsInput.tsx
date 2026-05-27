import { useEffect, useId, useMemo, useRef, useState } from "react";

export type TagsInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
};

function normalizeTag(tag: string): string {
  return tag.trim();
}

function hasTag(tags: string[], tag: string): boolean {
  const key = tag.toLowerCase();
  return tags.some((t) => t.toLowerCase() === key);
}

export default function TagsInput({
  value,
  onChange,
  suggestions,
  placeholder = "Type a tag and press Enter…",
  className,
}: TagsInputProps) {
  const listId = useId();
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const matchingSuggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (q.length === 0) {
      return suggestions
        .filter((s) => !hasTag(value, s))
        .slice(0, 8);
    }
    return suggestions
      .filter(
        (s) =>
          !hasTag(value, s) &&
          s.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [input, suggestions, value]);

  const addTag = (raw: string) => {
    const tag = normalizeTag(raw);
    if (!tag || hasTag(value, tag)) return;
    onChange([...value, tag]);
    setInput("");
    setOpen(false);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current && !wrapRef.current.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className={`relative ${className ?? ""}`.trim()} ref={wrapRef}>
      <div className="flex min-h-[2.75rem] flex-wrap items-center gap-1.5 rounded-lg border border-[#b1b2b5] bg-white px-2 py-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-[#43485e]/20 bg-[#eeeef0] px-2 py-0.5 text-xs font-medium text-[#43485e]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full px-1 text-[#6b7289] hover:bg-[#dcdfe6] hover:text-[#43485e]"
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(input);
            } else if (e.key === "Backspace" && input.length === 0 && value.length > 0) {
              removeTag(value[value.length - 1]);
            }
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-[#43485e] outline-none placeholder:text-[#9e9eae]"
          aria-autocomplete="list"
          aria-controls={listId}
        />
      </div>
      {open && (matchingSuggestions.length > 0 || input.trim().length > 0) && (
        <ul
          id={listId}
          className="absolute top-full right-0 left-0 z-50 mt-1 max-h-44 overflow-y-auto rounded-xl border border-[#d8dce8] bg-white py-1 shadow-lg"
          role="listbox"
        >
          {matchingSuggestions.map((s) => (
            <li key={s} role="option">
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-[#43485e] hover:bg-[#eeeef0]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(s)}
              >
                {s}
              </button>
            </li>
          ))}
          {input.trim().length > 0 &&
            !hasTag(value, input.trim()) &&
            !matchingSuggestions.some(
              (s) => s.toLowerCase() === input.trim().toLowerCase(),
            ) && (
              <li role="option">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm font-medium text-[#43485e] hover:bg-[#eeeef0]"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addTag(input)}
                >
                  Add “{input.trim()}”
                </button>
              </li>
            )}
        </ul>
      )}
    </div>
  );
}
