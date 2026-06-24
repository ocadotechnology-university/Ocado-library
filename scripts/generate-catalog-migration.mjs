#!/usr/bin/env node
/**
 * Generates catalog-migration.json for bulk import.
 * Books: real ISBNs + Open Library metadata/cover URLs.
 * Board games & PS games: spec seeds + generated filler titles.
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "../frontend/src/data/catalog-migration.json");

const BOOK_COUNT = 340;
const BOARD_COUNT = 160;
const PS_COUNT = 50;

const SPEC_BOOKS = [
  {
    title: "Building Microservices",
    author: "Sam Newman",
    isbn: "9781491950358",
    tags: ["Technology", "microservices", "architecture"],
    description: "Designing fine-grained systems. 1st edition, 2015.",
    status: "BORROWED",
  },
  {
    title: "#Workout: Games, Tools & Practices to Engage People, Improve Work, and Delight Clients",
    author: "Jurgen Appelo",
    isbn: "9781942788050",
    tags: ["Business", "agile", "management"],
    description: "Management 3.0 practices and games for modern teams. 2016.",
    status: "AVAILABLE",
  },
  {
    title: "User Friendly. Jak niewidoczne zasady projektowania zmieniają nasze życie, pracę i rozrywkę",
    author: "Robert Fabricant, Cliff Kuang",
    isbn: "9788382106442",
    tags: ["UX/UI", "design", "product"],
    description: "Polish edition on invisible design rules shaping everyday life.",
    status: "AVAILABLE",
  },
  {
    title: "Programming in Scala",
    author: "Martin Odersky",
    isbn: "9780981531649",
    tags: ["Technology", "scala", "programming"],
    description: "Comprehensive guide to the Scala programming language.",
    status: "AVAILABLE",
  },
  {
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    isbn: "9780596517748",
    tags: ["Technology", "javascript", "web"],
    description: "Classic guide to the good parts of JavaScript.",
    status: "AVAILABLE",
  },
];

const SPEC_BOARD_GAMES = [
  {
    title: "Barrage",
    description: "Heavy economic strategy about building dams. BoardGameGeek: boardgame/251247.",
    numberOfPlayers: 4,
    tags: ["strategy", "economic", "heavy"],
    status: "AVAILABLE",
  },
  {
    title: "Fantastyczne swiaty",
    description: "Fantasy Realms — fantasy card game of realm building. BoardGameGeek: boardgame/223040.",
    numberOfPlayers: 6,
    tags: ["card-game", "fantasy", "family"],
    status: "BORROWED",
  },
  {
    title: "Azul",
    description: "Abstract tile-placement game inspired by Portuguese azulejos.",
    numberOfPlayers: 4,
    tags: ["abstract", "family", "Popular"],
    status: "AVAILABLE",
  },
  {
    title: "Latajace burito",
    description: "Throw Throw Burrito — chaotic dodgeball card game.",
    numberOfPlayers: 6,
    tags: ["party", "action", "family"],
    status: "AVAILABLE",
  },
  {
    title: "Carcassonne",
    description: "Tile-laying classic set in the medieval French countryside.",
    numberOfPlayers: 5,
    tags: ["strategy", "family", "classic"],
    status: "AVAILABLE",
  },
  {
    title: "Catan",
    description: "Classic resource-trading board game.",
    numberOfPlayers: 4,
    tags: ["strategy", "family", "Popular"],
    status: "AVAILABLE",
  },
];

const SPEC_PS_GAMES = [
  { title: "Mortal Kombat Ultimate", tags: ["fighting", "ps5"], description: "For office use only." },
  { title: "FIFA 22", tags: ["sports", "football", "ps5"], description: "For office use only." },
  { title: "Gran Turismo 7", tags: ["racing", "simulation", "ps5"], description: "For office use only." },
  { title: "Horizon Forbidden West", tags: ["action", "adventure", "ps5"], description: "For office use only." },
  { title: "Worms Battlegrounds + W.M.D.", tags: ["strategy", "party", "ps5"], description: "For office use only." },
  { title: "Spiderman", tags: ["action", "adventure", "ps5"], description: "For office use only." },
  { title: "Tekken 7", tags: ["fighting", "ps5"], description: "For office use only." },
  { title: "UFC 4", tags: ["sports", "fighting", "ps5"], description: "For office use only." },
];

const EXTRA_BOARD_TITLES = [
  "Codenames", "Ticket to Ride", "Pandemic", "Splendor", "7 Wonders", "Dominion",
  "Wingspan", "Terraforming Mars", "Gloomhaven", "Scythe", "Root", "Everdell",
  "Spirit Island", "Brass: Birmingham", "Twilight Imperium", "Ark Nova", "Dune: Imperium",
  "Heat: Pedal to the Metal", "The Crew", "King of Tokyo", "Love Letter", "Sushi Go!",
  "Dixit", "Mysterium", "Betrayal at House on the Hill", "Dead of Winter", "Forbidden Island",
  "Hanabi", "Jaipur", "Patchwork", "Cascadia", "Quacks of Quedlinburg", "Wingspan: Oceania",
  "Race for the Galaxy", "Puerto Rico", "Agricola", "Power Grid", "El Grande", "Tigris & Euphrates",
  "Through the Ages", "Gaia Project", "Great Western Trail", "Concordia", "Orleans",
  "Lords of Waterdeep", "Stone Age", "Istanbul", "Viticulture", "Paladins of the West Kingdom",
  "Anno 1800", "Maracaibo", "Nemesis", "Frosthaven", "Arkham Horror", "Eldritch Horror",
  "Mansions of Madness", "Descent", "HeroQuest", "Zombicide", "Gloomhaven: Jaws of the Lion",
  "Star Realms", "Legendary", "Marvel Champions", "Arkham Horror LCG", "Netrunner",
  "Magic: The Gathering Commander", "KeyForge", "Smash Up", "Uno", "Monopoly", "Clue",
  "Risk", "Scrabble", "Chess", "Backgammon", "Connect Four", "Jenga", "Twister",
  "Pictionary", "Trivial Pursuit", "Taboo", "Balderdash", "Telestrations", "Just One",
  "Wavelength", "The Mind", "The Game", "No Thanks!", "For Sale", "Modern Art",
  "Ra", "Medici", "Tichu", "Skull", "Coup", "Resistance", "Avalon", "Secret Hitler",
  "One Night Ultimate Werewolf", "Werewolf", "Mafia", "Clank!", "Century: Spice Road",
  "Istanbul: Big Box", "Istanbul: Das Würfelspiel", "Photosynthesis", "Planet", "Blue Lagoon",
  "Kingdomino", "Queendomino", "Dragonwood", "Sagrada", "Azul: Summer Pavilion",
  "Azul: Stained Glass", "Calico", "Cascadia: Landmarks", "Arboretum", "Forest Shuffle",
  "Faraway", "Sky Team", "Sea Salt & Paper", "Scout", "Flip 7", "Bomb Busters",
  "Daybreak", "Forest Shuffle", "Harmonies", "Kelp", "Mind Bug", "Oath", "Paleo",
  "Revive", "Slay the Spire", "Stardew Valley", "Summoner Wars", "Tapestry", "Teotihuacan",
  "The Castles of Burgundy", "The Quest for El Dorado", "Ticket to Ride: Europe",
  "Tiny Towns", "Tokaido", "Trails", "Trekking Through History", "Unfathomable",
  "Verdant", "Vindication", "Watergate", "Welcome To", "Wingspan: Asia", "Wondrous Creatures",
  "Yellow & Yangtze", "Zombie Teenz", "Zoo Vadis",
];

const EXTRA_PS_TITLES = [
  "God of War Ragnarok", "The Last of Us Part I", "Ghost of Tsushima Director's Cut",
  "Ratchet & Clank: Rift Apart", "Returnal", "Demon's Souls", "Bloodborne",
  "Uncharted: Legacy of Thieves", "Marvel's Spider-Man 2", "Marvel's Spider-Man: Miles Morales",
  "Horizon Zero Dawn Remastered", "Death Stranding Director's Cut", "Final Fantasy XVI",
  "Final Fantasy VII Rebirth", "Persona 5 Royal", "Persona 3 Reload", "Yakuza: Like a Dragon",
  "Like a Dragon: Infinite Wealth", "Resident Evil 4", "Resident Evil Village",
  "Resident Evil 2", "Resident Evil 3", "Street Fighter 6", "Dragon Ball Z: Kakarot",
  "Elden Ring", "Dark Souls III", "Sekiro: Shadows Die Twice", "Armored Core VI",
  "Hogwarts Legacy", "Baldur's Gate 3", "Diablo IV", "Cyberpunk 2077", "The Witcher 3",
  "Assassin's Creed Valhalla", "Far Cry 6", "Watch Dogs: Legion", "NBA 2K24",
  "MLB The Show 24", "F1 23", "WRC Generations", "Dirt 5", "Need for Speed Unbound",
  "It Takes Two", "A Way Out", "Overcooked! All You Can Eat", "Moving Out 2",
  "Sackboy: A Big Adventure", "Astro's Playroom", "Destiny 2", "Warframe",
  "Fortnite", "Rocket League", "Fall Guys", "Minecraft", "Terraria", "Stardew Valley",
  "Civilization VI", "Cities: Skylines", "Planet Coaster", "Two Point Hospital",
  "Crash Bandicoot 4", "Spyro Reignited Trilogy", "Little Big Planet 3",
];

function padId(prefix, n) {
  return `${prefix}${String(n).padStart(3, "0")}`;
}

function normalizeIsbn(raw) {
  return raw.replace(/[\s-]/g, "").toUpperCase();
}

function coverUrlFromIsbn(isbn) {
  return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(normalizeIsbn(isbn))}-L.jpg?default=false`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOpenLibraryBooks(isbns) {
  const results = new Map();
  const batchSize = 25;

  for (let i = 0; i < isbns.length; i += batchSize) {
    const batch = isbns.slice(i, i + batchSize).map(normalizeIsbn);
    const bibkeys = batch.map((isbn) => `ISBN:${isbn}`).join(",");
    const url = `https://openlibrary.org/api/books?bibkeys=${bibkeys}&format=json&jscmd=data`;
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      for (const isbn of batch) {
        const node = data[`ISBN:${isbn}`];
        if (!node) continue;
        const title = node.title ?? null;
        const author =
          Array.isArray(node.authors) && node.authors.length > 0
            ? node.authors[0].name
            : null;
        let image = null;
        if (node.cover?.large) image = node.cover.large;
        else if (node.cover?.medium) image = node.cover.medium;
        else image = coverUrlFromIsbn(isbn);

        let description = null;
        if (typeof node.description === "string") description = node.description;
        else if (node.description?.value) description = node.description.value;
        else if (typeof node.notes === "string") description = node.notes;
        else if (node.notes?.value) description = node.notes.value;

        if (description && description.length > 1800) {
          description = `${description.slice(0, 1797)}...`;
        }

        results.set(isbn, { title, author, image, description });
      }
    } catch {
      // continue with next batch
    }
    await sleep(150);
  }

  return results;
}

async function searchOpenLibraryIsbns(targetCount) {
  const subjects = [
    "programming",
    "computer_science",
    "software_engineering",
    "business",
    "management",
    "design",
    "psychology",
    "science",
    "mathematics",
    "history",
    "fiction",
    "biography",
  ];
  const isbns = new Set();

  for (const subject of subjects) {
    if (isbns.size >= targetCount) break;
    for (let page = 0; page < 20 && isbns.size < targetCount; page++) {
      const url = `https://openlibrary.org/search.json?subject=${encodeURIComponent(subject)}&limit=100&offset=${page * 100}&fields=isbn,title,author_name`;
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        const data = await response.json();
        for (const doc of data.docs ?? []) {
          for (const raw of doc.isbn ?? []) {
            const normalized = normalizeIsbn(String(raw));
            if (/^(97[89])?\d{9}[\dX]$/.test(normalized)) {
              isbns.add(normalized);
              if (isbns.size >= targetCount) break;
            }
          }
          if (isbns.size >= targetCount) break;
        }
      } catch {
        // continue with next page
      }
      await sleep(120);
    }
  }

  return [...isbns];
}

async function buildBooks() {
  const books = [];
  const usedIsbns = new Set();
  const seeds = [];

  for (let i = 0; i < SPEC_BOOKS.length; i++) {
    const seed = SPEC_BOOKS[i];
    const isbn = normalizeIsbn(seed.isbn);
    usedIsbns.add(isbn);
    seeds.push({
      index: i + 1,
      isbn,
      seed,
    });
  }

  const needed = BOOK_COUNT - SPEC_BOOKS.length;
  console.log(`Fetching ISBN pool for ${needed} additional books...`);
  const isbnPool = await searchOpenLibraryIsbns(needed + 80);
  const extraIsbns = isbnPool.filter((isbn) => !usedIsbns.has(isbn)).slice(0, needed);

  let index = SPEC_BOOKS.length + 1;
  for (const isbn of extraIsbns) {
    const tagSets = [
      ["Technology", "programming"],
      ["Business", "management"],
      ["Science", "non-fiction"],
      ["Fiction", "literature"],
      ["Design", "UX/UI"],
      ["Popular", "library"],
    ];
    seeds.push({
      index,
      isbn,
      seed: {
        title: `Library volume ${index}`,
        author: "",
        tags: tagSets[index % tagSets.length],
        description: `Catalog entry ${index} — metadata from Open Library ISBN ${isbn}.`,
        status: index % 17 === 0 ? "BORROWED" : "AVAILABLE",
      },
    });
    index++;
  }

  while (seeds.length < BOOK_COUNT) {
    const n = seeds.length + 1;
    const isbn = `978000${String(n).padStart(6, "0")}`;
    seeds.push({
      index: n,
      isbn,
      seed: {
        title: `Office library placeholder ${n}`,
        author: "Unknown",
        tags: ["placeholder", "migration"],
        description: "Generated migration placeholder — replace with catalogued copy details.",
        status: "AVAILABLE",
      },
    });
  }

  console.log(`Fetching Open Library metadata for ${seeds.length} books...`);
  const metadata = await fetchOpenLibraryBooks(seeds.map((entry) => entry.isbn));

  for (const { index: bookIndex, isbn, seed } of seeds) {
    const internalId = padId("OC-B-WR-", bookIndex);
    const fetched = metadata.get(isbn);
    const title = fetched?.title ?? seed.title;
    const author = fetched?.author ?? seed.author ?? "";
    const image = fetched?.image ?? coverUrlFromIsbn(isbn);
    const description = fetched?.description ?? seed.description ?? null;

    books.push({
      type: "Book",
      title,
      author,
      isbn,
      description,
      image,
      tags: seed.tags ?? ["library"],
      instances: [{ internalId, status: seed.status ?? "AVAILABLE" }],
    });
  }

  return books;
}

function buildBoardGames() {
  const games = [];

  for (let i = 0; i < BOARD_COUNT; i++) {
    const n = i + 1;
    const internalId = padId("OC-G-WR-", n);
    const spec = SPEC_BOARD_GAMES[i];
    const filler = EXTRA_BOARD_TITLES[i - SPEC_BOARD_GAMES.length];

    if (spec) {
      games.push({
        type: "BoardGame",
        title: spec.title,
        description: spec.description,
        numberOfPlayers: spec.numberOfPlayers,
        tags: spec.tags,
        instances: [{ internalId, status: spec.status ?? "AVAILABLE" }],
      });
    } else {
      const title = filler ?? `Board game catalog entry ${n}`;
      games.push({
        type: "BoardGame",
        title,
        description: `Office library board game #${n}. Migrated catalog entry for testing and inventory.`,
        numberOfPlayers: (n % 6) + 2,
        tags: ["board-game", n % 3 === 0 ? "Popular" : "family"],
        instances: [{ internalId, status: n % 23 === 0 ? "BORROWED" : "AVAILABLE" }],
      });
    }
  }

  return games;
}

function buildPsGames() {
  const games = [];

  for (let i = 0; i < PS_COUNT; i++) {
    const n = i + 1;
    const internalId = padId("OC-PS-WR-", n);
    const spec = SPEC_PS_GAMES[i];
    const filler = EXTRA_PS_TITLES[i - SPEC_PS_GAMES.length];

    if (spec) {
      games.push({
        type: "PSGame",
        title: spec.title,
        description: spec.description,
        tags: spec.tags,
        instances: [{ internalId, status: "AVAILABLE" }],
      });
    } else {
      const title = filler ?? `PS5 catalog entry ${n}`;
      games.push({
        type: "PSGame",
        title,
        description: "For office use only.",
        tags: ["ps5", "office"],
        instances: [{ internalId, status: "AVAILABLE" }],
      });
    }
  }

  return games;
}

async function main() {
  console.log("Generating catalog migration file...");
  const books = await buildBooks();
  const boardGames = buildBoardGames();
  const psGames = buildPsGames();
  const payload = [...books, ...boardGames, ...psGames];

  writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Wrote ${payload.length} records to ${OUTPUT}`);
  console.log(`  Books: ${books.length}`);
  console.log(`  Board games: ${boardGames.length}`);
  console.log(`  PS games: ${psGames.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
