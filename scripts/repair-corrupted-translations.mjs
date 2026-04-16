import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const COMPENDIUM_DIR = path.join(ROOT, "localization", "compendium", "ko");

const TOKEN_PATTERNS = [
  /<[^>]+>/gu,
  /@[A-Za-z]+(?:\[[^\]]*\])(?:\{[^}]*\})?/gu,
  /&Reference\[[^\]]*\](?:\{[^}]*\})?/gu,
  /\[\[\/[^\]]+\]\]/gu
];

const HANGUL_RE = /[\u3131-\u318E\uAC00-\uD7A3]/gu;
const ENGLISH_RE = /[A-Za-z]/gu;
const BAD_CHAR_RE = /__FVTTTOK|FVT\s*TTOK|_ _FVTTTOK|\?{2,}|[�쏮먮]/gu;

const normalizeText = (value = "") => String(value ?? "").trim();
const normalizeLookupKey = (value = "") => normalizeText(value).toLowerCase();

const stripMarkup = (value = "") =>
  value
    .replace(/<[^>]*>/gu, " ")
    .replace(/@[A-Za-z]+(?:\[[^\]]*\])(?:\{[^}]*\})?/gu, " ")
    .replace(/&Reference\[[^\]]*\](?:\{[^}]*\})?/gu, " ")
    .replace(/\[\[\/[^\]]+\]\]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();

const looksCorrupted = (value = "") => {
  if (!value) return false;
  if (BAD_CHAR_RE.test(value)) return true;
  const visible = stripMarkup(value);
  const questionMarks = (visible.match(/\?/gu) ?? []).length;
  const hangul = (visible.match(HANGUL_RE) ?? []).length;
  return questionMarks >= 4 && hangul < 20;
};

const looksCorruptedName = (value = "", originalName = "") => {
  if (!value) return false;
  if (BAD_CHAR_RE.test(value)) return true;
  const visible = normalizeText(value);
  const hangul = (visible.match(HANGUL_RE) ?? []).length;
  const english = (visible.match(ENGLISH_RE) ?? []).length;
  if (originalName && visible === originalName) return false;
  return english >= 4 && hangul < Math.max(2, Math.floor(english * 0.3));
};

const tokenize = (value = "") => {
  const tokens = [];
  let output = value;
  for (const pattern of TOKEN_PATTERNS) {
    output = output.replace(pattern, (match) => {
      const token = `__FVTTTOK_${tokens.length}__`;
      tokens.push([token, match]);
      return token;
    });
  }
  return { output, tokens };
};

const untokenize = (value = "", tokens = []) => {
  let restored = value;
  for (const [token, match] of tokens) {
    restored = restored.replaceAll(token, match);
  }
  return restored;
};

const MAX_QUERY_LENGTH = 3500;
const splitForTranslation = (value = "") => {
  if (!value || value.length <= MAX_QUERY_LENGTH) return [value];
  const paragraphs = value
    .split(/(\n{2,}|<\/p>|<\/li>|<\/h[1-6]>|<\/tr>|<\/div>)/u)
    .filter(Boolean);

  const chunks = [];
  let current = "";
  for (const part of paragraphs) {
    if ((current + part).length > MAX_QUERY_LENGTH && current) {
      chunks.push(current);
      current = "";
    }

    if (part.length > MAX_QUERY_LENGTH) {
      for (let index = 0; index < part.length; index += MAX_QUERY_LENGTH) {
        const slice = part.slice(index, index + MAX_QUERY_LENGTH);
        if (slice) chunks.push(slice);
      }
      continue;
    }

    current += part;
  }

  if (current) chunks.push(current);
  return chunks;
};

const translateText = async (value) => {
  const translateSingle = async (chunk) => {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", "en");
    url.searchParams.set("tl", "ko");
    url.searchParams.set("dt", "t");
    url.searchParams.set("q", chunk);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Translate request failed: ${response.status}`);
    const payload = await response.json();
    return (payload?.[0] ?? []).map((piece) => piece?.[0] ?? "").join("");
  };

  const translated = [];
  for (const chunk of splitForTranslation(value)) {
    translated.push(await translateSingle(chunk));
  }
  return translated.join("");
};

const translateBody = async (value) => {
  const dom = new JSDOM(`<body>${value}</body>`);
  const { document, NodeFilter } = dom.window;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const source = node.nodeValue ?? "";
    const visible = source.replace(/\s+/gu, " ").trim();
    if (!visible || !ENGLISH_RE.test(visible)) continue;
    textNodes.push(node);
  }

  for (const node of textNodes) {
    const { output, tokens } = tokenize(node.nodeValue ?? "");
    const translated = await translateText(output);
    node.nodeValue = untokenize(translated, tokens);
  }

  return document.body.innerHTML
    .replace(/\u00A0/gu, " ")
    .replace(/\r?\n/gu, "\n");
};

const readJson = async (filePath) => JSON.parse((await fs.readFile(filePath, "utf8")).replace(/^\uFEFF/u, ""));

const findLatestTemplate = async () => {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const candidates = entries
    .filter((entry) => entry.isFile() && /^dnd5e-ko-hybrid-template-.*\.json$/u.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  if (!candidates.length) {
    throw new Error("No dnd5e-ko-hybrid-template-*.json file found in repo root.");
  }
  return path.join(ROOT, candidates.at(-1));
};

const buildLinkLabelIndex = async () => {
  const indexPath = path.join(COMPENDIUM_DIR, "index.json");
  const index = await readJson(indexPath);
  const map = new Map();
  for (const relativePath of index.files ?? []) {
    const absolutePath = path.join(ROOT, relativePath);
    const collection = path.basename(relativePath, ".json");
    const json = await readJson(absolutePath);
    const entryMap = new Map();
    for (const [originalName, entry] of Object.entries(json.entries ?? {})) {
      if (entry?.name) entryMap.set(originalName, entry.name);
    }
    map.set(collection, entryMap);
  }
  return map;
};

const localizeLinkLabels = (value = "", labelIndex = new Map()) =>
  value
    .replace(/@Compendium\[([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)\]\{([^}]+)\}/gu, (match, collection, label) => {
      const translated = labelIndex.get(collection)?.get(label);
      return translated ? match.replace(`{${label}}`, `{${translated}}`) : match;
    })
    .replace(/@UUID\[Compendium\.([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)\.Item\.[^\]]+\]\{([^}]+)\}/gu, (match, collection, label) => {
      const translated = labelIndex.get(collection)?.get(label);
      return translated ? match.replace(`{${label}}`, `{${translated}}`) : match;
    });

const buildTemplateLookups = (template) => ({
  compendiums: template.compendiums?.entries ?? {},
  actors: template.actors?.entries ?? {},
  items: template.items?.entries ?? {},
  actorItems: template.actorItems?.entries ?? {},
  journalPages: template.journalPages?.entries ?? {}
});

const buildEntryIndex = (entries = {}) => {
  const index = new Map();
  for (const [key, entry] of Object.entries(entries)) {
    index.set(normalizeLookupKey(key), entry);
    const originalName = normalizeText(entry?.originalName);
    if (originalName) index.set(normalizeLookupKey(originalName), entry);
  }
  return index;
};

const resolveSourceEntry = (index, key, entry) =>
  index.get(normalizeLookupKey(key))
  ?? index.get(normalizeLookupKey(entry?.originalName))
  ?? null;

const fileToTemplateSection = (relativePath) => {
  if (relativePath === "localization/world/ko/actors.json") return { type: "world", section: "actors" };
  if (relativePath === "localization/world/ko/world-items.json") return { type: "world", section: "items" };
  if (relativePath === "localization/world/ko/actor-items.json") return { type: "world", section: "actorItems" };
  if (relativePath === "localization/world/ko/journal-pages.json") return { type: "world", section: "journalPages" };
  if (relativePath.startsWith("localization/compendium/ko/")) {
    return { type: "compendium", section: path.basename(relativePath, ".json") };
  }
  return null;
};

const repairEntry = async (entry, source, labelIndex, counters) => {
  if (!entry || typeof entry !== "object" || !source || typeof source !== "object") return;

  if (typeof entry.name === "string" && typeof source.originalName === "string" && looksCorruptedName(entry.name, source.originalName)) {
    const translatedName = normalizeText(await translateText(source.originalName));
    if (translatedName) {
      entry.name = `${translatedName} - ${source.originalName}`;
      counters.names += 1;
    }
  }

  if (typeof entry.description === "string" && looksCorrupted(entry.description) && typeof source.originalDescription === "string" && source.originalDescription) {
    entry.description = localizeLinkLabels(await translateBody(source.originalDescription), labelIndex);
    counters.descriptions += 1;
  } else if (typeof entry.description === "string") {
    entry.description = localizeLinkLabels(entry.description, labelIndex);
  }

  if (typeof entry.text === "string" && looksCorrupted(entry.text) && typeof source.originalText === "string" && source.originalText) {
    entry.text = localizeLinkLabels(await translateBody(source.originalText), labelIndex);
    counters.text += 1;
  } else if (typeof entry.text === "string") {
    entry.text = localizeLinkLabels(entry.text, labelIndex);
  }

  if (entry.items && source.items) {
    const childIndex = buildEntryIndex(source.items);
    for (const [childKey, childEntry] of Object.entries(entry.items)) {
      await repairEntry(childEntry, resolveSourceEntry(childIndex, childKey, childEntry), labelIndex, counters);
    }
  }

  if (entry.pages && source.pages) {
    const childIndex = buildEntryIndex(source.pages);
    for (const [childKey, childEntry] of Object.entries(entry.pages)) {
      await repairEntry(childEntry, resolveSourceEntry(childIndex, childKey, childEntry), labelIndex, counters);
    }
  }
};

const main = async () => {
  const files = process.argv.slice(2);
  if (!files.length) {
    throw new Error("Usage: node scripts/repair-corrupted-translations.mjs <file...>");
  }

  const templatePath = await findLatestTemplate();
  const template = await readJson(templatePath);
  const lookups = buildTemplateLookups(template);
  const labelIndex = await buildLinkLabelIndex();

  for (const input of files) {
    const absolutePath = path.resolve(ROOT, input);
    const relativePath = path.relative(ROOT, absolutePath).replace(/\\/gu, "/");
    const mapping = fileToTemplateSection(relativePath);
    if (!mapping) {
      console.warn(`Skipping unsupported file: ${relativePath}`);
      continue;
    }

    const json = await readJson(absolutePath);
    const counters = { names: 0, descriptions: 0, text: 0 };
    const sourceEntries = mapping.type === "compendium"
      ? lookups.compendiums?.[mapping.section]?.entries ?? {}
      : lookups[mapping.section] ?? {};
    const sourceIndex = buildEntryIndex(sourceEntries);

    for (const [key, entry] of Object.entries(json.entries ?? {})) {
      await repairEntry(entry, resolveSourceEntry(sourceIndex, key, entry), labelIndex, counters);
    }

    await fs.writeFile(absolutePath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
    console.log(`${relativePath}\tname:${counters.names}\tdescription:${counters.descriptions}\ttext:${counters.text}`);
  }
};

await main();
