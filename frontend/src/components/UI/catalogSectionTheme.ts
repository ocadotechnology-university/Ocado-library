import type { MediaSection } from "./CatalogHomeHeader";

export type CatalogSectionTheme = {
  label: string;
  headingClass: string;
  /** Background for the Home page main (center) column. */
  mainBgClass: string;
};

export const CATALOG_SECTION_THEME: Record<MediaSection, CatalogSectionTheme> =
  {
    books: {
      label: "Books",
      headingClass: "text-[#43485e]",
      mainBgClass: "bg-[#eeeef0]",
    },
    board: {
      label: "Board Games",
      headingClass: "text-[#7c5c1e]",
      mainBgClass: "bg-[#faf6ed]",
    },
    ps: {
      label: "PS Games",
      headingClass: "text-[#1f6b42]",
      mainBgClass: "bg-[#eef8f1]",
    },
  };

export function catalogSectionHeading(label: string, count: number): string {
  return `${label}(${count})`;
}
