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

const stripMarkup = (value = "") =>
  value
    .replace(/<[^>]*>/gu, " ")
    .replace(/@[A-Za-z]+(?:\[[^\]]*\])(?:\{[^}]*\})?/gu, " ")
    .replace(/&Reference\[[^\]]*\](?:\{[^}]*\})?/gu, " ")
    .replace(/\[\[\/[^\]]+\]\]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();

const needsTranslation = (value = "") => {
  const visible = stripMarkup(value);
  if (!visible) return false;
  const hangul = (visible.match(HANGUL_RE) ?? []).length;
  const english = (visible.match(ENGLISH_RE) ?? []).length;
  return english > 100 && hangul < english * 0.15;
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
    if (!response.ok) {
      throw new Error(`Translate request failed: ${response.status}`);
    }
    const payload = await response.json();
    return (payload?.[0] ?? []).map((piece) => piece?.[0] ?? "").join("");
  }

  const chunks = splitForTranslation(value);
  const translated = [];
  for (const chunk of chunks) {
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

const processEntries = async (entries, changed, labelIndex) => {
  for (const entry of Object.values(entries ?? {})) {
    if (!entry || typeof entry !== "object") continue;
    if (typeof entry.description === "string" && needsTranslation(entry.description)) {
      entry.description = await translateBody(entry.description);
      changed.count += 1;
    }
    if (typeof entry.description === "string") {
      entry.description = localizeLinkLabels(entry.description, labelIndex);
    }
    if (typeof entry.text === "string" && needsTranslation(entry.text)) {
      entry.text = await translateBody(entry.text);
      changed.count += 1;
    }
    if (typeof entry.text === "string") {
      entry.text = localizeLinkLabels(entry.text, labelIndex);
    }
    if (entry.items) await processEntries(entry.items, changed, labelIndex);
    if (entry.pages) await processEntries(entry.pages, changed, labelIndex);
  }
};

const main = async () => {
  const inputFiles = process.argv.slice(2);
  if (!inputFiles.length) {
    throw new Error("Usage: node scripts/auto-translate-html-json.mjs <file...>");
  }

  const labelIndex = await buildLinkLabelIndex();
  for (const inputFile of inputFiles) {
    const absolute = path.resolve(inputFile);
    const raw = await fs.readFile(absolute, "utf8");
    const json = JSON.parse(raw.replace(/^\uFEFF/u, ""));
    const changed = { count: 0 };
    await processEntries(json.entries ?? json, changed, labelIndex);
    await fs.writeFile(absolute, `${JSON.stringify(json, null, 2)}\n`, "utf8");
    console.log(`${path.basename(absolute)}\t${changed.count}`);
  }
};

await main();
