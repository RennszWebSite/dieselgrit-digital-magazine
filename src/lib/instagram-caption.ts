// Parses a pasted Instagram caption into structured feature fields.
// No scraping — pure text parsing.

export type ParsedCaption = {
  ownerInstagram: string | null;
  taggedHandles: string[];
  year: number | null;
  make: string | null;
  model: string | null;
  engine: string | null;
  story: string;
};

const MAKES: Record<string, string> = {
  ford: "Ford",
  chevy: "Chevrolet",
  chevrolet: "Chevrolet",
  gmc: "GMC",
  ram: "Ram",
  dodge: "Ram",
  toyota: "Toyota",
  nissan: "Nissan",
  cummins: "Ram",
};

const ENGINE_KEYWORDS = [
  { re: /\bcummins\b/i, label: "Cummins" },
  { re: /\bduramax\b/i, label: "Duramax" },
  { re: /\bpower[\s-]?stroke\b/i, label: "Power Stroke" },
  { re: /\b6\.7\b/, label: "6.7L" },
  { re: /\b6\.6\b/, label: "6.6L" },
  { re: /\b7\.3\b/, label: "7.3L" },
  { re: /\b5\.9\b/, label: "5.9L" },
];

const COMMON_MODELS = [
  "F-250", "F250", "F-350", "F350", "F-450", "F450", "F-150", "F150",
  "Silverado", "Sierra", "2500", "3500", "1500",
  "Tundra", "Tacoma", "Titan",
];

export function parseInstagramCaption(text: string): ParsedCaption {
  const clean = text.replace(/\r/g, "").trim();
  const handles = Array.from(clean.matchAll(/@([a-z0-9._]{2,30})/gi)).map((m) => "@" + m[1]);
  const uniqueHandles = Array.from(new Set(handles));
  const owner = uniqueHandles[0] ?? null;
  const tagged = uniqueHandles.slice(1);

  const yearMatch = clean.match(/\b(19[89]\d|20[0-4]\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

  let make: string | null = null;
  for (const [k, v] of Object.entries(MAKES)) {
    if (new RegExp(`\\b${k}\\b`, "i").test(clean)) {
      make = v;
      break;
    }
  }

  let model: string | null = null;
  for (const m of COMMON_MODELS) {
    if (new RegExp(`\\b${m.replace("-", "-?")}\\b`, "i").test(clean)) {
      model = m.replace(/^F(\d)/, "F-$1");
      break;
    }
  }

  const engineHits: string[] = [];
  for (const e of ENGINE_KEYWORDS) if (e.re.test(clean)) engineHits.push(e.label);
  const engine = engineHits.length ? engineHits.join(" ") : null;

  // Story: strip leading @handle mentions and trailing hashtag blocks.
  let story = clean
    .replace(/^(\s*@[a-z0-9._]+[,\s]*)+/i, "")
    .replace(/\n{2,}#[^\n]*(?:\n#[^\n]*)*\s*$/g, "")
    .replace(/(^|\s)#[a-z0-9_]+/gi, "")
    .trim();

  return {
    ownerInstagram: owner,
    taggedHandles: tagged,
    year,
    make,
    model,
    engine,
    story,
  };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}