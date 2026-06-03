import type { MediaSection } from "./CatalogHomeHeader";
import CatalogViewToggle, { type CatalogViewMode } from "./CatalogViewToggle";
import {
  CATALOG_SECTION_THEME,
  catalogSectionHeading,
} from "./catalogSectionTheme";

export type CatalogSectionHeadingProps = {
  section: MediaSection;
  count: number;
  catalogView: CatalogViewMode;
  onCatalogViewChange: (mode: CatalogViewMode) => void;
};

export default function CatalogSectionHeading({
  section,
  count,
  catalogView,
  onCatalogViewChange,
}: CatalogSectionHeadingProps) {
  const theme = CATALOG_SECTION_THEME[section];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2
        className={`text-2xl font-bold tracking-tight sm:text-3xl ${theme.headingClass}`}
      >
        {catalogSectionHeading(theme.label, count)}
      </h2>
      <CatalogViewToggle mode={catalogView} onModeChange={onCatalogViewChange} />
    </div>
  );
}
