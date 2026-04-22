import fs from "fs/promises";
import path from "path";
import "./node-dom-shim.mjs";
import { TranslationStore, nameToKo } from "./translation-store.js";

const ROOT = path.resolve("A:/TRPG/Compendium Translator");
const COMPENDIUM_DIR = path.join(ROOT, "localization/compendium/ko");
const SHARED_ITEMS_PATH = path.join(ROOT, "localization/world/ko/shared-items.json");

const normalizeText = (value = "") =>
  String(value ?? "")
    .replace(/\r\n?/gu, "\n")
    .replace(/\u00a0/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();

const normalizeTemplateBody = (value = "") => {
  const normalized = value == null ? "" : String(value);
  return normalized === "null" || normalized === "undefined" ? "" : normalized;
};

const signatureFor = ({ type = "", name = "", content = "" } = {}) =>
  `${normalizeText(type)}::${normalizeText(name)}::${normalizeText(content)}`;

const stripMarkup = (value = "") =>
  String(value)
    .replace(/<[^>]+>/gu, " ")
    .replace(/\[\[[^\]]+\]\]/gu, " ")
    .replace(/@[a-zA-Z]+\[[^\]]+\]/gu, " ")
    .replace(/&Reference\[[^\]]+\](?:\{[^}]+\})?/gu, " ")
    .replace(/&[a-z]+;/giu, " ")
    .replace(/\s+/gu, " ")
    .trim();

const hasEnglish = (value = "") => /[A-Za-z]/u.test(value);
const hasKorean = (value = "") => /\p{Script=Hangul}/u.test(value);

const splitBilingualName = (value = "") => {
  const normalized = String(value ?? "").trim();
  const match = normalized.match(/^(.*?)(?:\s*-\s*|\s+)([A-Za-z][A-Za-z0-9:'(),/+ -]*)$/u);
  if (!match) return null;

  const translated = match[1].trim();
  const source = match[2].trim();
  if (!translated || !source || !hasKorean(translated)) return null;

  return { translated, source };
};

const formatBilingualName = (originalName, translatedName) => {
  const source = String(originalName ?? "").trim();
  const translated = String(translatedName ?? "").trim();
  const sourceBilingual = splitBilingualName(source);
  const translatedBilingual = splitBilingualName(translated);

  if (!source || !translated) return translated;
  if (sourceBilingual) {
    return `${translatedBilingual?.translated ?? sourceBilingual.translated} - ${translatedBilingual?.source ?? sourceBilingual.source}`;
  }
  if (translatedBilingual) {
    return translatedBilingual.source === source
      ? `${translatedBilingual.translated} - ${translatedBilingual.source}`
      : source;
  }
  if (!hasEnglish(source) || hasKorean(source)) return translated;
  if (translated === source) return translated;
  if (translated.endsWith(source)) {
    const head = translated.slice(0, -source.length).replace(/\s*-\s*$/u, "").trim();
    if (head) return `${head} - ${source}`;
  }
  if (hasEnglish(translated)) return source;

  return `${translated} - ${source}`;
};

const translationScore = (value = "", originalValue = "") => {
  const visible = stripMarkup(value);
  const korean = (visible.match(/\p{Script=Hangul}/gu) ?? []).length;
  const english = (visible.match(/[A-Za-z]/gu) ?? []).length;
  const unchanged = normalizeText(value) === normalizeText(originalValue);
  return (korean * 3) - english - (unchanged ? 200 : 0);
};

const GENERIC_PAGE_NAME_TRANSLATIONS = {
  Image: "이미지",
  Text: "텍스트",
  "Page 1": "페이지 1",
  "Page 2": "페이지 2",
  "Page 3": "페이지 3"
};

const TYPE_COLLECTION_SUFFIXES = {
  background: ["backgrounds"],
  class: ["classes"],
  consumable: ["items", "tradegoods"],
  container: ["items", "tradegoods"],
  equipment: ["items", "tradegoods"],
  loot: ["items", "tradegoods"],
  tool: ["items", "tradegoods"],
  weapon: ["items", "tradegoods"],
  feat: ["class-features", "classfeatures", "monster-features", "monsterfeatures", "heroes", "wild-cards"],
  race: ["species", "species-traits", "races"],
  spell: ["spells"],
  subclass: ["subclasses"]
};

const preferredCollectionsForType = (type) => {
  switch (type) {
    case "background":
      return ["dnd5e.backgrounds"];
    case "class":
      return ["dnd5e.classes"];
    case "consumable":
    case "container":
    case "equipment":
    case "loot":
    case "tool":
    case "weapon":
      return ["dnd5e.items", "dnd5e.tradegoods"];
    case "feat":
      return ["dnd5e.monsterfeatures", "dnd5e.classfeatures", "dnd5e.heroes"];
    case "race":
      return ["dnd5e.races"];
    case "spell":
      return ["dnd5e.spells"];
    case "subclass":
      return ["dnd5e.subclasses"];
    default:
      return [];
  }
};

const preferredPackageCollectionsForType = (compendium, type, packageName = "", currentCollection = "") => {
  if (!packageName) return [];

  const packagePrefix = `${packageName}.`;
  const packageCollections = [...compendium.keys()].filter((collection) => collection.startsWith(packagePrefix));
  if (!packageCollections.length) return [];

  const ordered = [];
  const seen = new Set();
  const push = (collection) => {
    if (!collection || seen.has(collection) || !packageCollections.includes(collection)) return;
    seen.add(collection);
    ordered.push(collection);
  };

  push(currentCollection);
  for (const suffix of TYPE_COLLECTION_SUFFIXES[type] ?? []) {
    push(`${packageName}.${suffix}`);
  }
  for (const collection of packageCollections) {
    push(collection);
  }

  return ordered;
};

const sortObject = (object) =>
  Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)));

const readJson = async (filePath) => {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw.replace(/^\uFEFF/u, ""));
};

const readJsonIfExists = async (filePath) => {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
};

const loadSharedItemTranslations = async () => {
  const data = await readJsonIfExists(SHARED_ITEMS_PATH);
  const map = new Map();
  for (const entry of data?.entries ?? []) {
    if (!entry?.signature) continue;
    map.set(normalizeText(entry.signature), entry);
  }
  return map;
};

const MACHINE_TRANSLATE_TOKEN_PATTERNS = [
  /<[^>]+>/gu,
  /@[A-Za-z]+(?:\[[^\]]*\])(?:\{[^}]*\})?/gu,
  /&Reference\[[^\]]*\](?:\{[^}]*\})?/gu,
  /\[\[\/[^\]]+\]\]/gu
];

const TRANSLATE_MAX_QUERY_LENGTH = 3500;
const plainTranslationCache = new Map();
const markupTranslationCache = new Map();

const tokenizeMachineTranslation = (value = "") => {
  const tokens = [];
  let output = value;
  for (const pattern of MACHINE_TRANSLATE_TOKEN_PATTERNS) {
    output = output.replace(pattern, (match) => {
      const token = `__FVTTTOK_${tokens.length}__`;
      tokens.push([token, match]);
      return token;
    });
  }
  return { output, tokens };
};

const untokenizeMachineTranslation = (value = "", tokens = []) => {
  let restored = value;
  for (const [token, match] of tokens) {
    restored = restored.replaceAll(token, match);
  }
  return restored;
};

const splitForMachineTranslation = (value = "") => {
  if (!value || value.length <= TRANSLATE_MAX_QUERY_LENGTH) return [value];

  const chunks = [];
  let cursor = 0;
  while (cursor < value.length) {
    let next = Math.min(cursor + TRANSLATE_MAX_QUERY_LENGTH, value.length);
    if (next < value.length) {
      const split = value.lastIndexOf(" ", next);
      if (split > cursor + 500) next = split;
    }
    chunks.push(value.slice(cursor, next));
    cursor = next;
  }
  return chunks.filter(Boolean);
};

const translateTextViaGoogle = async (value = "") => {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  if (plainTranslationCache.has(normalized)) return plainTranslationCache.get(normalized);

  const chunks = splitForMachineTranslation(normalized);
  const translated = [];
  for (const chunk of chunks) {
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
    translated.push((payload?.[0] ?? []).map((piece) => piece?.[0] ?? "").join(""));
  }

  const output = translated.join("").replace(/\u00A0/gu, " ").trim();
  plainTranslationCache.set(normalized, output);
  return output;
};

const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

const formatMachineTranslatedName = (originalName = "", translatedName = "") => {
  const source = normalizeText(originalName);
  let translated = normalizeText(translatedName);
  if (!source || !translated || !hasKorean(translated)) return "";

  translated = translated
    .replace(new RegExp(`\\(\\s*${escapeRegExp(source)}\\s*\\)$`, "u"), "")
    .replace(new RegExp(`\\s*-\\s*${escapeRegExp(source)}$`, "u"), "")
    .trim();

  return translated ? `${translated} - ${source}` : "";
};

const machineTranslateName = async (originalName = "") => {
  const visible = normalizeText(originalName);
  if (!visible || hasKorean(visible) || !hasEnglish(visible)) return "";
  const translated = await translateTextViaGoogle(visible);
  if (!translated || translated === visible) return "";
  return formatMachineTranslatedName(originalName, translated);
};

const machineTranslateMarkup = async (value = "") => {
  const source = String(value ?? "").trim();
  if (!source) return "";
  if (markupTranslationCache.has(source)) return markupTranslationCache.get(source);

  const { output, tokens } = tokenizeMachineTranslation(source);
  const translated = await translateTextViaGoogle(output);
  const restored = untokenizeMachineTranslation(translated, tokens)
    .replace(/\u00A0/gu, " ")
    .replace(/\r\n?/gu, "\n")
    .trim();

  markupTranslationCache.set(source, restored);
  return restored;
};

const writeJson = async (filePath, data) => {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

const findLatestTemplatePath = async () => {
  const candidates = (await fs.readdir(ROOT))
    .filter((fileName) => /^dnd5e-ko-hybrid-template-.*\.json$/u.test(fileName))
    .sort()
    .reverse();

  if (!candidates.length) {
    throw new Error("No downloaded template file was found.");
  }

  return path.join(ROOT, candidates[0]);
};

const loadCompendiumByCollection = async () => {
  const index = await readJson(path.join(COMPENDIUM_DIR, "index.json"));
  const map = new Map();
  for (const relativePath of index.files ?? []) {
    const absolutePath = path.join(ROOT, relativePath);
    const data = await readJson(absolutePath);
    const collection = path.basename(relativePath, ".json");
    map.set(collection, data.entries ?? {});
  }
  return map;
};

const findCompendiumEntry = (compendium, type, originalName, options = {}) => {
  if (!originalName) return null;
  for (const collection of preferredPackageCollectionsForType(compendium, type, options.packageName, options.collection)) {
    const entry = compendium.get(collection)?.[originalName];
    if (entry) return entry;
  }
  for (const collection of preferredCollectionsForType(type)) {
    const entry = compendium.get(collection)?.[originalName];
    if (entry) return entry;
  }
  return null;
};

const findCompendiumActorEntry = (compendium, originalName, options = {}) => {
  if (!originalName) return null;
  for (const collection of preferredPackageCollectionsForType(compendium, "actor", options.packageName, options.collection)) {
    const entry = compendium.get(collection)?.[originalName];
    if (entry) return entry;
  }
  return compendium.get("dnd5e.monsters")?.[originalName]
    ?? compendium.get("dnd5e.heroes")?.[originalName]
    ?? null;
};

const findSharedItemEntry = (sharedItems, type, originalName, originalBody) =>
  sharedItems.get(normalizeText(signatureFor({
    type,
    name: originalName,
    content: originalBody
  }))) ?? null;

const translateName = (originalName, type, compendiumEntry) => {
  if (!originalName) return "";
  if (splitBilingualName(originalName)) {
    return formatBilingualName(originalName, compendiumEntry?.name ?? originalName);
  }
  if (hasKorean(originalName)) return "";
  const translated =
    compendiumEntry?.name
    ?? GENERIC_PAGE_NAME_TRANSLATIONS[originalName]
    ?? nameToKo(originalName);
  return formatBilingualName(originalName, translated);
};

const getTranslatedNameCandidate = async (currentValue, originalName, type, compendiumEntry) => {
  let candidate = translateName(originalName, type, compendiumEntry);
  const currentVisible = normalizeText(currentValue);
  if (
    (!candidate || candidate === originalName || !hasKorean(candidate))
    && (!currentVisible || !hasKorean(currentVisible))
    && hasEnglish(originalName)
  ) {
    const machineCandidate = await machineTranslateName(originalName);
    if (machineCandidate) candidate = machineCandidate;
  }
  return candidate;
};

const maybeBodyTranslation = (store, originalBody, type, compendiumEntry, mode) => {
  const sourceBody = normalizeTemplateBody(originalBody);
  if (!sourceBody) return "";
  const visibleOriginal = stripMarkup(sourceBody);
  if (hasKorean(visibleOriginal) && !hasEnglish(visibleOriginal)) return "";

  const candidates = [];

  if ((mode === "items" || mode === "actorItems" || mode === "actors") && compendiumEntry?.description) {
    candidates.push(compendiumEntry.description);
  }

  if (mode === "journalPages" && compendiumEntry?.text) {
    candidates.push(compendiumEntry.text);
  }

  const generated = store._translateGeneratedDescription(sourceBody);
  if (generated !== sourceBody) candidates.push(generated);

  let best = "";
  let bestScore = translationScore("", sourceBody);
  for (const candidate of candidates) {
    const score = translationScore(candidate, sourceBody);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return best;
};

const getTranslatedBodyCandidate = async (
  store,
  currentValue,
  originalBody,
  type,
  compendiumEntry,
  mode
) => {
  const sourceBody = normalizeTemplateBody(originalBody);
  let candidate = maybeBodyTranslation(store, sourceBody, type, compendiumEntry, mode);
  const currentVisible = stripMarkup(currentValue);
  const candidateVisible = stripMarkup(candidate);
  const originalVisible = stripMarkup(sourceBody);

  if (
    (!candidate || !hasKorean(candidateVisible))
    && (!currentVisible || !hasKorean(currentVisible))
    && originalVisible
    && hasEnglish(originalVisible)
  ) {
    const machineCandidate = await machineTranslateMarkup(sourceBody);
    if (machineCandidate) candidate = machineCandidate;
  }

  return candidate;
};

const shouldReplaceText = (currentValue, candidateValue, originalValue = "") => {
  const current = String(currentValue ?? "").trim();
  const candidate = String(candidateValue ?? "").trim();
  const original = String(originalValue ?? "").trim();
  const visibleCurrent = stripMarkup(current);
  const visibleCandidate = stripMarkup(candidate);

  if (!candidate || candidate === original) return false;
  if (!current) return true;
  if (!hasKorean(visibleCurrent) && hasKorean(visibleCandidate)) return true;
  return translationScore(candidate, original) > translationScore(current, original);
};

const shouldReplaceName = (currentValue, candidateValue, originalValue = "") => {
  const current = String(currentValue ?? "").trim();
  const candidate = String(candidateValue ?? "").trim();
  const original = String(originalValue ?? "").trim();

  if (!candidate || candidate === original) return false;
  if (!current) return true;
  if (shouldReplaceText(current, candidate, original)) return true;
  if (candidate === original && hasEnglish(current) && hasKorean(current) && !current.endsWith(original)) return true;
  if (candidate.includes(" - ") && current !== candidate && original && current.endsWith(original)) return true;

  return false;
};

const hasAnyTranslation = (entry) => {
  if (!entry) return false;
  if (entry.name || entry.description || entry.text) return true;
  if (entry.items && Object.values(entry.items).some((item) => hasAnyTranslation(item))) return true;
  if (entry.pages && Object.values(entry.pages).some((page) => hasAnyTranslation(page))) return true;
  return false;
};

const stabilizeRecord = (store, record, templateRecord = null) => {
  if (!record) return record;

  if (record.description) {
    const originalDescription = templateRecord?.originalDescription ?? "";
    const candidate = store._translateGeneratedDescription(record.description);
    if (shouldReplaceText(record.description, candidate, originalDescription)) {
      record.description = candidate;
    }
  }

  if (record.text) {
    const originalText = templateRecord?.originalText ?? "";
    const candidate = store._translateGeneratedDescription(record.text);
    if (shouldReplaceText(record.text, candidate, originalText)) {
      record.text = candidate;
    }
  }

  if (record.items) {
    for (const [itemName, itemRecord] of Object.entries(record.items)) {
      stabilizeRecord(store, itemRecord, templateRecord?.items?.[itemName] ?? null);
    }
  }

  if (record.pages) {
    for (const [pageName, pageRecord] of Object.entries(record.pages)) {
      stabilizeRecord(store, pageRecord, templateRecord?.pages?.[pageName] ?? null);
    }
  }

  return record;
};

const buildPackSkeleton = (packTemplate, existingPack = null) => ({
  label: existingPack?.label ?? packTemplate.label ?? "",
  ...(packTemplate.folders ? { folders: existingPack?.folders ?? packTemplate.folders } : {}),
  entries: existingPack?.entries ?? {}
});

const normalizeEntry = (record = {}) => {
  const normalized = {};
  if (record.name) normalized.name = record.name;
  if (record.description) normalized.description = record.description;
  if (record.text) normalized.text = record.text;
  if (record.items && Object.keys(record.items).length) normalized.items = sortObject(record.items);
  if (record.pages && Object.keys(record.pages).length) normalized.pages = sortObject(record.pages);
  return normalized;
};

const main = async () => {
  const targetCollections = new Set(process.argv.slice(2));
  const templatePath = await findLatestTemplatePath();
  const [template, compendium, sharedItems] = await Promise.all([
    readJson(templatePath),
    loadCompendiumByCollection(),
    loadSharedItemTranslations()
  ]);
  const store = new TranslationStore();

  const externalPacks = template.compendiums?.entries ?? {};
  if (!Object.keys(externalPacks).length) {
    console.log(JSON.stringify({ packs: 0, entries: 0, itemNames: 0, itemBodies: 0, actorNames: 0, actorBodies: 0, actorItemNames: 0, actorItemBodies: 0, journalNames: 0, journalBodies: 0 }, null, 2));
    return;
  }

  let packs = 0;
  let entries = 0;
  let itemNames = 0;
  let itemBodies = 0;
  let actorNames = 0;
  let actorBodies = 0;
  let actorItemNames = 0;
  let actorItemBodies = 0;
  let journalNames = 0;
  let journalBodies = 0;

  for (const [collection, packTemplate] of Object.entries(externalPacks)) {
    if (collection.startsWith("dnd5e.")) continue;
    if (targetCollections.size && !targetCollections.has(collection)) continue;

    const targetPath = path.join(COMPENDIUM_DIR, `${collection}.json`);
    const existingPack = await readJsonIfExists(targetPath);
    const packJson = buildPackSkeleton(packTemplate, existingPack);

    for (const [entryName, templateEntry] of Object.entries(packTemplate.entries ?? {})) {
      const existingEntry = packJson.entries[entryName] ?? {};

        switch (packTemplate.documentName) {
        case "Item": {
          const compendiumEntry = findCompendiumEntry(compendium, templateEntry.type, templateEntry.originalName, {
            collection,
            packageName: packTemplate.packageName
          });
          const sharedEntry = findSharedItemEntry(
            sharedItems,
            templateEntry.type,
            templateEntry.originalName,
            templateEntry.originalDescription
          );
          const translationEntry = sharedEntry ? { ...(compendiumEntry ?? {}), ...sharedEntry } : compendiumEntry;
          const translatedName = await getTranslatedNameCandidate(
            existingEntry.name,
            templateEntry.originalName,
            templateEntry.type,
            translationEntry
          );
          if (shouldReplaceName(existingEntry.name, translatedName, templateEntry.originalName)) {
            existingEntry.name = translatedName;
            itemNames += 1;
          }

          const translatedDescription = await getTranslatedBodyCandidate(
            store,
            existingEntry.description,
            templateEntry.originalDescription,
            templateEntry.type,
            translationEntry,
            "items"
          );
          if (shouldReplaceText(existingEntry.description, translatedDescription, templateEntry.originalDescription)) {
            existingEntry.description = translatedDescription;
            itemBodies += 1;
          }
          const stabilizedDescription = maybeBodyTranslation(
            store,
            existingEntry.description,
            templateEntry.type,
            translationEntry,
            "items"
          );
          if (shouldReplaceText(existingEntry.description, stabilizedDescription, templateEntry.originalDescription)) {
            existingEntry.description = stabilizedDescription;
            itemBodies += 1;
          }
          break;
        }
        case "Actor": {
          const compendiumActor = findCompendiumActorEntry(compendium, templateEntry.originalName, {
            collection,
            packageName: packTemplate.packageName
          });
          const translatedName = await getTranslatedNameCandidate(
            existingEntry.name,
            templateEntry.originalName,
            templateEntry.type,
            compendiumActor
          );
          if (shouldReplaceName(existingEntry.name, translatedName, templateEntry.originalName)) {
            existingEntry.name = translatedName;
            actorNames += 1;
          }

          const translatedDescription = await getTranslatedBodyCandidate(
            store,
            existingEntry.description,
            templateEntry.originalDescription,
            templateEntry.type,
            compendiumActor,
            "actors"
          );
          if (shouldReplaceText(existingEntry.description, translatedDescription, templateEntry.originalDescription)) {
            existingEntry.description = translatedDescription;
            actorBodies += 1;
          }
          const stabilizedDescription = maybeBodyTranslation(
            store,
            existingEntry.description,
            templateEntry.type,
            compendiumActor,
            "actors"
          );
          if (shouldReplaceText(existingEntry.description, stabilizedDescription, templateEntry.originalDescription)) {
            existingEntry.description = stabilizedDescription;
            actorBodies += 1;
          }

          existingEntry.items = existingEntry.items ?? {};
          for (const [itemName, itemTemplate] of Object.entries(templateEntry.items ?? {})) {
            const existingItem = existingEntry.items[itemName] ?? {};
            const compendiumEntry = findCompendiumEntry(compendium, itemTemplate.type, itemTemplate.originalName, {
              collection,
              packageName: packTemplate.packageName
            });
            const sharedEntry = findSharedItemEntry(
              sharedItems,
              itemTemplate.type,
              itemTemplate.originalName,
              itemTemplate.originalDescription
            );
            const translationEntry = sharedEntry ? { ...(compendiumEntry ?? {}), ...sharedEntry } : compendiumEntry;
            const translatedItemName = await getTranslatedNameCandidate(
              existingItem.name,
              itemTemplate.originalName,
              itemTemplate.type,
              translationEntry
            );
            if (shouldReplaceName(existingItem.name, translatedItemName, itemTemplate.originalName)) {
              existingItem.name = translatedItemName;
              actorItemNames += 1;
            }

            const translatedDescription = await getTranslatedBodyCandidate(
              store,
              existingItem.description,
              itemTemplate.originalDescription,
              itemTemplate.type,
              translationEntry,
              "actorItems"
            );
            if (shouldReplaceText(existingItem.description, translatedDescription, itemTemplate.originalDescription)) {
              existingItem.description = translatedDescription;
              actorItemBodies += 1;
            }
            const stabilizedDescription = maybeBodyTranslation(
              store,
              existingItem.description,
              itemTemplate.type,
              translationEntry,
              "actorItems"
            );
            if (shouldReplaceText(existingItem.description, stabilizedDescription, itemTemplate.originalDescription)) {
              existingItem.description = stabilizedDescription;
              actorItemBodies += 1;
            }

            if (hasAnyTranslation(existingItem)) {
              existingEntry.items[itemName] = normalizeEntry(existingItem);
            }
          }

          if (!Object.keys(existingEntry.items).length) {
            delete existingEntry.items;
          }
          break;
        }
        case "JournalEntry": {
          const translatedName = await getTranslatedNameCandidate(
            existingEntry.name,
            templateEntry.originalName,
            templateEntry.type,
            null
          );
          if (shouldReplaceName(existingEntry.name, translatedName, templateEntry.originalName)) {
            existingEntry.name = translatedName;
            journalNames += 1;
          }

          existingEntry.pages = existingEntry.pages ?? {};
          for (const [pageName, pageTemplate] of Object.entries(templateEntry.pages ?? {})) {
            const existingPage = existingEntry.pages[pageName] ?? {};
            const translatedPageName = await getTranslatedNameCandidate(
              existingPage.name,
              pageTemplate.originalName,
              pageTemplate.type,
              null
            );
            if (shouldReplaceName(existingPage.name, translatedPageName, pageTemplate.originalName)) {
              existingPage.name = translatedPageName;
              journalNames += 1;
            }

            const translatedText = await getTranslatedBodyCandidate(
              store,
              existingPage.text,
              pageTemplate.originalText,
              pageTemplate.type,
              null,
              "journalPages"
            );
            if (shouldReplaceText(existingPage.text, translatedText, pageTemplate.originalText)) {
              existingPage.text = translatedText;
              journalBodies += 1;
            }
            const stabilizedText = maybeBodyTranslation(
              store,
              existingPage.text,
              pageTemplate.type,
              null,
              "journalPages"
            );
            if (shouldReplaceText(existingPage.text, stabilizedText, pageTemplate.originalText)) {
              existingPage.text = stabilizedText;
              journalBodies += 1;
            }

            if (hasAnyTranslation(existingPage)) {
              existingEntry.pages[pageName] = normalizeEntry(existingPage);
            }
          }

          if (!Object.keys(existingEntry.pages).length) {
            delete existingEntry.pages;
          }
          break;
        }
        default: {
          const translatedName = await getTranslatedNameCandidate(
            existingEntry.name,
            templateEntry.originalName ?? entryName,
            templateEntry.type,
            null
          );
          if (shouldReplaceName(existingEntry.name, translatedName, templateEntry.originalName ?? entryName)) {
            existingEntry.name = translatedName;
          }
          break;
        }
      }

      if (hasAnyTranslation(existingEntry)) {
        packJson.entries[entryName] = normalizeEntry(stabilizeRecord(store, existingEntry, templateEntry));
        entries += 1;
      }
    }

    packJson.entries = sortObject(packJson.entries);
    if (!Object.keys(packJson.entries).length && !existingPack) continue;

    await writeJson(targetPath, packJson);
    packs += 1;
  }

  const fileNames = (await fs.readdir(COMPENDIUM_DIR))
    .filter((fileName) => fileName.endsWith(".json") && fileName !== "index.json")
    .sort();
  await writeJson(path.join(COMPENDIUM_DIR, "index.json"), {
    files: fileNames.map((fileName) => `localization/compendium/ko/${fileName}`)
  });

  console.log(JSON.stringify({
    packs,
    entries,
    itemNames,
    itemBodies,
    actorNames,
    actorBodies,
    actorItemNames,
    actorItemBodies,
    journalNames,
    journalBodies
  }, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
