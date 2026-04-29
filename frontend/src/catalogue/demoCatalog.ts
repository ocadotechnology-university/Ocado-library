import type { BookStatus } from "../components/UI/BookPreview";

export type ContentLevel = "junior" | "middle" | "senior";

export type BookRow = {
  key: string;
  title: string;
  author: string;
  language: string;
  level: ContentLevel;
  status: BookStatus;
  newArrival: boolean;
  caption: string;
  seed: string;
  bookId: string;
  tags: string[];
};

export const BOOK_DESCRIPTION =
  "Between life and death there is a library, and within that library, the shelves go on for ever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices. Would you have done anything differently, if you had the chance to undo your regrets?";

export const previewVariants: BookRow[] = [
  {
    key: "ts-senior",
    title: "TypeScript Deep Dive",
    author: "Basarat Ali Syed",
    language: "TypeScript",
    level: "senior",
    status: "free",
    newArrival: false,
    caption: "Free",
    seed: "ts-senior",
    bookId: "OC-WRO-B-0101",
    tags: ["typescript", "types", "Popular", "web"],
  },
  {
    key: "py-middle",
    title: "Fluent Python",
    author: "Luciano Ramalho",
    language: "Python",
    level: "middle",
    status: "free",
    newArrival: true,
    caption: "Free · New arrival",
    seed: "py-middle",
    bookId: "OC-WRO-B-0102",
    tags: ["python", "idioms", "New", "Popular"],
  },
  {
    key: "go-junior",
    title: "The Go Programming Language",
    author: "Alan Donovan",
    language: "Go",
    level: "junior",
    status: "borrowed",
    newArrival: false,
    caption: "Borrowed",
    seed: "go-junior",
    bookId: "OC-WRO-B-0103",
    tags: ["go", "systems", "reference"],
  },
  {
    key: "java-middle",
    title: "Effective Java",
    author: "Joshua Bloch",
    language: "Java",
    level: "middle",
    status: "borrowed",
    newArrival: true,
    caption: "Borrowed · New arrival",
    seed: "java-middle",
    bookId: "OC-WRO-B-0104",
    tags: ["java", "patterns", "New", "Waitlist"],
  },
  {
    key: "rust-senior",
    title: "The Rust Programming Language",
    author: "Steve Klabnik",
    language: "Rust",
    level: "senior",
    status: "borrowed-by-me",
    newArrival: false,
    caption: "Borrowed by me",
    seed: "rust-senior",
    bookId: "OC-WRO-B-0105",
    tags: ["rust", "ownership", "Due soon"],
  },
  {
    key: "js-junior",
    title: "You Don't Know JS Yet",
    author: "Kyle Simpson",
    language: "JavaScript",
    level: "junior",
    status: "borrowed-by-me",
    newArrival: true,
    caption: "Borrowed by me · New arrival",
    seed: "js-junior",
    bookId: "OC-WRO-B-0106",
    tags: ["javascript", "New", "Checked out", "Popular"],
  },
  {
    key: "ddia-senior",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    language: "Mixed",
    level: "senior",
    status: "free",
    newArrival: false,
    caption: "Free",
    seed: "ddia-senior",
    bookId: "OC-WRO-B-0107",
    tags: ["distributed", "databases", "architecture"],
  },
  {
    key: "c-junior",
    title: "Modern C",
    author: "Jens Gustedt",
    language: "C",
    level: "junior",
    status: "borrowed",
    newArrival: false,
    caption: "Borrowed",
    seed: "c-junior",
    bookId: "OC-WRO-B-0108",
    tags: ["c", "systems", "Non-fiction"],
  },
];

export function findCatalogBook(key: string): BookRow | undefined {
  return previewVariants.find((b) => b.key === key);
}
