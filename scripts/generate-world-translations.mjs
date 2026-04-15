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
const hasBrokenTranslation = (value = "") => /\?{2,}|�/u.test(String(value));
const hasKorean = (value = "") => /[가-힣]/.test(value);

const translationScore = (value = "") => {
  const visible = stripMarkup(value);
  const korean = (visible.match(/[가-힣]/gu) ?? []).length;
  const english = (visible.match(/[A-Za-z]/gu) ?? []).length;
  const broken = (visible.match(/\?{2,}|\ufffd/gu) ?? []).length;
  return (korean * 2) - english - (broken * 20);
};

const shouldReplaceBody = (currentValue, candidateValue, originalValue = "") => {
  if (!candidateValue || candidateValue === originalValue) return false;
  if (!currentValue || currentValue === originalValue) return true;
  return translationScore(candidateValue) > (translationScore(currentValue) + 10);
};

const shouldReplaceName = (currentValue, candidateValue, originalValue = "") => {
  const current = String(currentValue ?? "").trim();
  const candidate = String(candidateValue ?? "").trim();
  const original = String(originalValue ?? "").trim();

  if (!candidate || candidate === original) return false;
  if (!current) return true;
  if (hasBrokenTranslation(current) || !hasKorean(current)) return true;
  if (candidate === original && hasEnglish(current) && hasKorean(current) && !current.endsWith(original)) return true;
  if (candidate.includes(" - ") && current !== candidate && original && current.endsWith(original)) return true;

  return false;
};

const extractEnglishTail = (value = "") => {
  const match = String(value).match(/([A-Za-z][A-Za-z0-9:'(),/+ -]*)$/u);
  return match?.[1]?.trim() ?? "";
};

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

const findAnyCompendiumEntry = (compendium, originalName) => {
  if (!originalName) return null;
  for (const entries of compendium.values()) {
    if (entries?.[originalName]) return entries[originalName];
  }
  return null;
};

const translateName = (originalName, type, compendiumEntry) => {
  if (!originalName) return "";
  if (splitBilingualName(originalName)) {
    return formatBilingualName(originalName, compendiumEntry?.name ?? originalName);
  }
  if (hasKorean(originalName)) return "";
  const translated =
    compendiumEntry?.name ??
    GENERIC_PAGE_NAME_TRANSLATIONS[originalName] ??
    nameToKo(originalName);
  return formatBilingualName(originalName, translated);
};

const inferOriginalName = (currentName = "", currentBody = "") => {
  const englishTail = extractEnglishTail(currentName);
  if (englishTail) return englishTail;
  if (/Lay on Hands/i.test(currentBody) || /치유력 풀/u.test(currentBody)) return "Lay on Hands Pool";
  return "";
};

const repairBrokenName = (currentName, currentBody, originalName, type, compendiumEntry, compendium) => {
  if (!currentName || !hasBrokenTranslation(currentName)) return "";
  const englishName = originalName || inferOriginalName(currentName, currentBody);
  if (!englishName) return "";
  const fallbackEntry = compendiumEntry ?? findCompendiumEntry(compendium, type, englishName) ?? findAnyCompendiumEntry(compendium, englishName);
  return translateName(englishName, type, fallbackEntry);
};

const maybeBodyTranslation = (store, originalBody, type, compendiumEntry, mode) => {
  if (!originalBody || hasKorean(stripMarkup(originalBody))) return "";

  if ((mode === "items" || mode === "actorItems" || mode === "actors") && compendiumEntry?.description) {
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
  const [template, compendium, actorsJson, itemsJson, actorItemsJson, journalJson] = await Promise.all([
    readJson(templatePath),
    loadCompendiumByCollection(),
    readJson(WORLD_FILES.actors),
    readJson(WORLD_FILES.items),
    readJson(WORLD_FILES.actorItems),
    readJson(WORLD_FILES.journalPages)
  ]);

  const store = new TranslationStore();

  let actorNames = 0;
  let actorBodies = 0;
  for (const [uuid, entry] of Object.entries(template.actors?.entries ?? {})) {
    if (!isPureEnglish(entry.originalName, entry.originalDescription)) continue;
    const record = ensureRecord(actorsJson.entries, uuid, "description");
    const compendiumEntry = findAnyCompendiumEntry(compendium, entry.originalName);
    const translatedName = translateName(entry.originalName, entry.type, compendiumEntry);
    if (shouldReplaceName(record.name, translatedName, entry.originalName)) {
      record.name = translatedName;
      actorNames += 1;
    }
    const translatedDescription = maybeBodyTranslation(store, entry.originalDescription, entry.type, compendiumEntry, "actors");
    if (shouldReplaceBody(record.description, translatedDescription, entry.originalDescription)) {
      record.description = translatedDescription;
      actorBodies += 1;
    }
    actorsJson.entries[uuid] = record;
  }

  let itemNames = 0;
  let itemBodies = 0;
  for (const [uuid, entry] of Object.entries(template.items.entries ?? {})) {
    if (!isPureEnglish(entry.originalName, entry.originalDescription)) continue;
    const record = ensureRecord(itemsJson.entries, uuid, "description");
    const compendiumEntry = findCompendiumEntry(compendium, entry.type, entry.originalName);
    const translatedName = translateName(entry.originalName, entry.type, compendiumEntry);
    if (shouldReplaceName(record.name, translatedName, entry.originalName)) {
      record.name = translatedName;
      itemNames += 1;
    }
    const translatedDescription = maybeBodyTranslation(store, entry.originalDescription, entry.type, compendiumEntry, "items");
    if (shouldReplaceBody(record.description, translatedDescription, entry.originalDescription)) {
      record.description = translatedDescription;
      itemBodies += 1;
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
    if (shouldReplaceName(record.name, translatedName, entry.originalName)) {
      record.name = translatedName;
      actorItemNames += 1;
    }
    const translatedDescription = maybeBodyTranslation(store, entry.originalDescription, entry.type, compendiumEntry, "actorItems");
    if (shouldReplaceBody(record.description, translatedDescription, entry.originalDescription)) {
      record.description = translatedDescription;
      actorItemBodies += 1;
    }
    actorItemsJson.entries[uuid] = record;
  }

  let journalNames = 0;
  let journalBodies = 0;
  for (const [uuid, entry] of Object.entries(template.journalPages.entries ?? {})) {
    if (!isPureEnglish(entry.originalName, entry.originalText)) continue;
    const record = ensureRecord(journalJson.entries, uuid, "text");
    const translatedName = translateName(entry.originalName, entry.type, null);
    if (shouldReplaceName(record.name, translatedName, entry.originalName)) {
      record.name = translatedName;
      journalNames += 1;
    }
    const translatedText = maybeBodyTranslation(store, entry.originalText, entry.type, null, "journalPages");
    if (shouldReplaceBody(record.text, translatedText, entry.originalText)) {
      record.text = translatedText;
      journalBodies += 1;
    }
    journalJson.entries[uuid] = record;
  }

  for (const [uuid, record] of Object.entries(actorsJson.entries)) {
    if (!hasBrokenTranslation(record.name)) continue;
    const source = template.actors.entries?.[uuid];
    const compendiumEntry = findAnyCompendiumEntry(compendium, source?.originalName ?? extractEnglishTail(record.name));
    const repairedName = repairBrokenName(record.name, record.description, source?.originalName, source?.type, compendiumEntry, compendium);
    if (repairedName && repairedName !== record.name) {
      record.name = repairedName;
      actorNames += 1;
    }
  }

  for (const [uuid, record] of Object.entries(itemsJson.entries)) {
    if (!hasBrokenTranslation(record.name)) continue;
    const source = template.items.entries?.[uuid];
    const compendiumEntry =
      findCompendiumEntry(compendium, source?.type, source?.originalName)
      ?? findAnyCompendiumEntry(compendium, source?.originalName ?? extractEnglishTail(record.name));
    const repairedName = repairBrokenName(record.name, record.description, source?.originalName, source?.type, compendiumEntry, compendium);
    if (repairedName && repairedName !== record.name) {
      record.name = repairedName;
      itemNames += 1;
    }
  }

  for (const [uuid, record] of Object.entries(actorItemsJson.entries)) {
    if (!hasBrokenTranslation(record.name)) continue;
    const source = template.actorItems.entries?.[uuid];
    const compendiumEntry =
      findCompendiumEntry(compendium, source?.type, source?.originalName)
      ?? findAnyCompendiumEntry(compendium, source?.originalName ?? extractEnglishTail(record.name));
    const repairedName = repairBrokenName(record.name, record.description, source?.originalName, source?.type, compendiumEntry, compendium);
    if (repairedName && repairedName !== record.name) {
      record.name = repairedName;
      actorItemNames += 1;
    }
  }

  for (const [uuid, record] of Object.entries(journalJson.entries)) {
    if (!hasBrokenTranslation(record.name)) continue;
    const source = template.journalPages.entries?.[uuid];
    const repairedName = repairBrokenName(record.name, record.text, source?.originalName, source?.type, null, compendium);
    if (repairedName && repairedName !== record.name) {
      record.name = repairedName;
      journalNames += 1;
    }
  }

  actorsJson.entries = sortObject(actorsJson.entries);
  itemsJson.entries = sortObject(itemsJson.entries);
  actorItemsJson.entries = sortObject(actorItemsJson.entries);
  journalJson.entries = sortObject(journalJson.entries);

  await Promise.all([
    fs.writeFile(WORLD_FILES.actors, `${JSON.stringify(actorsJson, null, 2)}\n`, "utf8"),
    fs.writeFile(WORLD_FILES.items, `${JSON.stringify(itemsJson, null, 2)}\n`, "utf8"),
    fs.writeFile(WORLD_FILES.actorItems, `${JSON.stringify(actorItemsJson, null, 2)}\n`, "utf8"),
    fs.writeFile(WORLD_FILES.journalPages, `${JSON.stringify(journalJson, null, 2)}\n`, "utf8")
  ]);

  console.log(JSON.stringify({
    actorNames,
    actorBodies,
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
