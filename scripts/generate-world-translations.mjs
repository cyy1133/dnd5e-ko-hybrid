import fs from "fs/promises";
import path from "path";
import { TranslationStore, nameToKo } from "./translation-store.js";

const ROOT = path.resolve("A:/TRPG/Compendium Translator");
const COMPENDIUM_DIR = path.join(ROOT, "localization/compendium/ko");
const WORLD_DIR = path.join(ROOT, "localization/world/ko");

const WORLD_FILES = {
  items: path.join(WORLD_DIR, "world-items.json"),
  actorItems: path.join(WORLD_DIR, "actor-items.json"),
  journalPages: path.join(WORLD_DIR, "journal-pages.json"),
  actors: path.join(WORLD_DIR, "actors.json")
};

const GENERIC_PAGE_NAME_TRANSLATIONS = {
  Image: "이미지",
  Text: "텍스트",
  "Page 1": "페이지 1",
  "Page 2": "페이지 2",
  "Page 3": "페이지 3"
};

const stripMarkup = (value = "") =>
  String(value)
    .replace(/<[^>]+>/gu, " ")
    .replace(/\[\[[^\]]+\]\]/gu, " ")
    .replace(/@[a-zA-Z]+\[[^\]]+\]/gu, " ")
    .replace(/&Reference\[[^\]]+\](?:\{[^}]+\})?/gu, " ")
    .replace(/&[a-z]+;/giu, " ")
    .replace(/\s+/gu, " ")
    .trim();

const hasEnglish = (value = "") => /[A-Za-z]/.test(value);
const hasKorean = (value = "") => /[가-힣]/.test(value);

const formatBilingualName = (originalName, translatedName) => {
  const source = String(originalName ?? "").trim();
  const translated = String(translatedName ?? "").trim();

  if (!source || !translated) return translated;
  if (!hasEnglish(source) || hasKorean(source)) return translated;
  if (translated === source) return translated;
  if (translated.includes(source)) return translated;
  if (hasEnglish(translated)) return translated;

  return `${translated} ${source}`;
};

const isPureEnglish = (name = "", body = "") => {
  const visible = `${name} ${stripMarkup(body)}`.trim();
  return hasEnglish(visible) && !hasKorean(visible);
};

const sortObject = (object) =>
  Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)));

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));

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

const findCompendiumEntry = (compendium, type, originalName) => {
  if (!originalName) return null;
  for (const collection of preferredCollectionsForType(type)) {
    const entry = compendium.get(collection)?.[originalName];
    if (entry) return entry;
  }
  return null;
};

const translateName = (originalName, type, compendiumEntry) => {
  if (!originalName) return "";
  if (hasKorean(originalName)) return "";
  const translated =
    compendiumEntry?.name ??
    GENERIC_PAGE_NAME_TRANSLATIONS[originalName] ??
    nameToKo(originalName);
  return formatBilingualName(originalName, translated);
};

const maybeBodyTranslation = (store, originalBody, type, compendiumEntry, mode) => {
  if (!originalBody || hasKorean(stripMarkup(originalBody))) return "";

  if ((mode === "items" || mode === "actorItems") && compendiumEntry?.description) {
    return compendiumEntry.description;
  }

  const generated = store._translateGeneratedDescription(originalBody);
  if (generated !== originalBody) return generated;

  if (mode === "journalPages" && compendiumEntry?.text) {
    return compendiumEntry.text;
  }

  return "";
};

const ensureRecord = (currentEntries, uuid, labelKey) => {
  const existing = currentEntries[uuid] ?? {};
  return {
    ...existing,
    [labelKey]: existing[labelKey] ?? ""
  };
};

const main = async () => {
  const templatePath = await findLatestTemplatePath();
  const [template, compendium, itemsJson, actorItemsJson, journalJson] = await Promise.all([
    readJson(templatePath),
    loadCompendiumByCollection(),
    readJson(WORLD_FILES.items),
    readJson(WORLD_FILES.actorItems),
    readJson(WORLD_FILES.journalPages)
  ]);

  const store = new TranslationStore();

  let itemNames = 0;
  let itemBodies = 0;
  for (const [uuid, entry] of Object.entries(template.items.entries ?? {})) {
    if (!isPureEnglish(entry.originalName, entry.originalDescription)) continue;
    const record = ensureRecord(itemsJson.entries, uuid, "description");
    const compendiumEntry = findCompendiumEntry(compendium, entry.type, entry.originalName);
    const translatedName = translateName(entry.originalName, entry.type, compendiumEntry);
    if (translatedName && translatedName !== entry.originalName) {
      const shouldNormalizeName = record.name && !hasEnglish(record.name);
      if (!record.name || shouldNormalizeName) {
        record.name = translatedName;
        itemNames += 1;
      }
    }
    if (!record.description) {
      const translatedDescription = maybeBodyTranslation(store, entry.originalDescription, entry.type, compendiumEntry, "items");
      if (translatedDescription && translatedDescription !== entry.originalDescription) {
        record.description = translatedDescription;
        itemBodies += 1;
      }
    }
    itemsJson.entries[uuid] = record;
  }

  let actorItemNames = 0;
  let actorItemBodies = 0;
  for (const [uuid, entry] of Object.entries(template.actorItems.entries ?? {})) {
    if (!isPureEnglish(entry.originalName, entry.originalDescription)) continue;
    const record = ensureRecord(actorItemsJson.entries, uuid, "description");
    const compendiumEntry = findCompendiumEntry(compendium, entry.type, entry.originalName);
    const translatedName = translateName(entry.originalName, entry.type, compendiumEntry);
    if (translatedName && translatedName !== entry.originalName) {
      const shouldNormalizeName = record.name && !hasEnglish(record.name);
      if (!record.name || shouldNormalizeName) {
        record.name = translatedName;
        actorItemNames += 1;
      }
    }
    if (!record.description) {
      const translatedDescription = maybeBodyTranslation(store, entry.originalDescription, entry.type, compendiumEntry, "actorItems");
      if (translatedDescription && translatedDescription !== entry.originalDescription) {
        record.description = translatedDescription;
        actorItemBodies += 1;
      }
    }
    actorItemsJson.entries[uuid] = record;
  }

  let journalNames = 0;
  let journalBodies = 0;
  for (const [uuid, entry] of Object.entries(template.journalPages.entries ?? {})) {
    if (!isPureEnglish(entry.originalName, entry.originalText)) continue;
    const record = ensureRecord(journalJson.entries, uuid, "text");
    const translatedName = translateName(entry.originalName, entry.type, null);
    if (translatedName && translatedName !== entry.originalName) {
      const shouldNormalizeName = record.name && !hasEnglish(record.name);
      if (!record.name || shouldNormalizeName) {
        record.name = translatedName;
        journalNames += 1;
      }
    }
    if (!record.text) {
      const translatedText = maybeBodyTranslation(store, entry.originalText, entry.type, null, "journalPages");
      if (translatedText && translatedText !== entry.originalText) {
        record.text = translatedText;
        journalBodies += 1;
      }
    }
    journalJson.entries[uuid] = record;
  }

  itemsJson.entries = sortObject(itemsJson.entries);
  actorItemsJson.entries = sortObject(actorItemsJson.entries);
  journalJson.entries = sortObject(journalJson.entries);

  await Promise.all([
    fs.writeFile(WORLD_FILES.items, `${JSON.stringify(itemsJson, null, 2)}\n`, "utf8"),
    fs.writeFile(WORLD_FILES.actorItems, `${JSON.stringify(actorItemsJson, null, 2)}\n`, "utf8"),
    fs.writeFile(WORLD_FILES.journalPages, `${JSON.stringify(journalJson, null, 2)}\n`, "utf8")
  ]);

  console.log(JSON.stringify({
    itemNames,
    itemBodies,
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
