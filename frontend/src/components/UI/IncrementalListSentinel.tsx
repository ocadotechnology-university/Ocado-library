type IncrementalListSentinelProps = {
  hasMore: boolean;
  label?: string;
};

export default function IncrementalListSentinel({
  hasMore,
  label = "Loading more…",
}: IncrementalListSentinelProps) {
  if (!hasMore) return null;

  return (
    <div className="py-6 text-center text-sm text-[#6b7289]" aria-live="polite">
      {label}
    </div>
  );
}
