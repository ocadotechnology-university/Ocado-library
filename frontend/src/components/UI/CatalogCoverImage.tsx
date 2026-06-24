import { useEffect, useMemo, useState } from "react";
import {
  CATALOG_COVER_PLACEHOLDER_CLASS,
  normalizeIsbn,
  resolveCoverSrc,
  resolveInitialCoverMode,
  type CoverImageSize,
} from "../../lib/catalogCoverImage";

type CatalogCoverImageProps = {
  imageUrl?: string | null;
  isbn?: string | null;
  size?: CoverImageSize;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
};

export default function CatalogCoverImage({
  imageUrl,
  isbn,
  size = "preview",
  className = "",
  width,
  height,
  loading = "lazy",
  decoding = "async",
}: CatalogCoverImageProps) {
  const normalizedIsbn = useMemo(() => normalizeIsbn(isbn), [isbn]);
  const [mode, setMode] = useState<"stored" | "isbn" | "none">(() =>
    resolveInitialCoverMode(imageUrl, isbn),
  );

  useEffect(() => {
    setMode(resolveInitialCoverMode(imageUrl, isbn));
  }, [imageUrl, isbn]);

  const src = resolveCoverSrc(mode, imageUrl, normalizedIsbn, size);

  const handleError = () => {
    if (mode === "stored" && normalizedIsbn) {
      setMode("isbn");
      return;
    }
    setMode("none");
  };

  if (src == null) {
    return (
      <div
        className={`${CATALOG_COVER_PLACEHOLDER_CLASS} ${className}`.trim()}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      onError={handleError}
      className={className}
    />
  );
}
