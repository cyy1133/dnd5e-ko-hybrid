import fs from "fs/promises";
import path from "path";
import "./node-dom-shim.mjs";
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
  const current = String(currentValue ?? "").trim();
  const candidate = String(candidateValue ?? "").trim();
  const original = String(originalValue ?? "").trim();
  const visibleCurrent = stripMarkup(current);
  const visibleCandidate = stripMarkup(candidate);

  if (!candidate || candidate === original) return false;
  if (!current || current === original) return true;
  if (!hasKorean(visibleCurrent) && hasKorean(visibleCandidate)) return true;
  return translationScore(candidate) > (translationScore(current) + 10);
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

const needsTranslationPass = (name = "", body = "") => {
  const visible = `${name} ${stripMarkup(body)}`.trim();
  return hasEnglish(visible);
};

const makeSourceKey = (type = "", originalName = "") =>
  `${String(type ?? "").trim().toLowerCase()}::${String(originalName ?? "").trim().toLowerCase()}`;

const sortObject = (object) =>
  Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)));

const readJson = async (filePath) => {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw.replace(/^\uFEFF/u, ""));
};

const normalizeMachineText = (value = "") =>
  String(value ?? "")
    .replace(/\r\n?/gu, "\n")
    .replace(/\u00A0/gu, " ")
    .trim();

const normalizeTemplateBody = (value = "") => {
  const normalized = value == null ? "" : String(value);
  return normalized === "null" || normalized === "undefined" ? "" : normalized;
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
  const normalized = normalizeMachineText(value);
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
    if (!response.ok) throw new Error(`Translate request failed: ${response.status}`);
    const payload = await response.json();
    translated.push((payload?.[0] ?? []).map((piece) => piece?.[0] ?? "").join(""));
  }

  const output = translated.join("").replace(/\u00A0/gu, " ").trim();
  plainTranslationCache.set(normalized, output);
  return output;
};

const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

const formatMachineTranslatedName = (originalName = "", translatedName = "") => {
  const source = normalizeMachineText(originalName);
  let translated = normalizeMachineText(translatedName);
  if (!source || !translated || !hasKorean(translated)) return "";
  translated = translated
    .replace(new RegExp(`\\(\\s*${escapeRegExp(source)}\\s*\\)$`, "u"), "")
    .replace(new RegExp(`\\s*-\\s*${escapeRegExp(source)}$`, "u"), "")
    .trim();
  return translated ? `${translated} - ${source}` : "";
};

const machineTranslateName = async (originalName = "") => {
  const visible = normalizeMachineText(originalName);
  if (!visible || hasKorean(visible) || !hasEnglish(visible)) return "";
  const translated = await translateTextViaGoogle(visible);
  if (!translated || translated === visible) return "";
  return formatMachineTranslatedName(originalName, translated);
};

const machineTranslateMarkup = async (value = "") => {
  const source = normalizeTemplateBody(value);
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
  return findAnyCompendiumEntry(compendium, originalName);
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

const getTranslatedNameCandidate = async (currentValue, originalName, type, compendiumEntry) => {
  let candidate = translateName(originalName, type, compendiumEntry);
  const currentVisible = normalizeMachineText(currentValue);
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
  const sourceBody = normalizeTemplateBody(originalBody);
  if (!sourceBody) return "";
  const visibleOriginal = stripMarkup(sourceBody);
  if (hasKorean(visibleOriginal) && !hasEnglish(visibleOriginal)) return "";

  const candidates = [];

  if ((mode === "items" || mode === "actorItems" || mode === "actors") && compendiumEntry?.description) {
    candidates.push(compendiumEntry.description);
  }

  if ((mode === "items" || mode === "actorItems" || mode === "actors") && compendiumEntry?._sharedDescription) {
    candidates.push(compendiumEntry._sharedDescription);
  }

  const generated = store._translateGeneratedDescription(sourceBody);
  if (generated !== sourceBody) candidates.push(generated);

  if (mode === "journalPages" && compendiumEntry?.text) {
    candidates.push(compendiumEntry.text);
  }

  return candidates
    .filter(Boolean)
    .sort((left, right) => translationScore(right) - translationScore(left))[0] ?? "";
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

const ensureRecord = (currentEntries, uuid, labelKey) => {
  const existing = currentEntries[uuid] ?? {};
  return {
    ...existing,
    [labelKey]: existing[labelKey] ?? ""
  };
};

const buildSharedTranslationIndex = (templateEntries, currentEntries) => {
  const index = new Map();

  for (const [uuid, source] of Object.entries(templateEntries ?? {})) {
    const record = currentEntries?.[uuid];
    if (!record?.description && !record?.name) continue;
    const key = makeSourceKey(source?.type, source?.originalName);
    if (!key || key === "::") continue;

    const current = index.get(key);
    const candidateScore =
      translationScore(record.description ?? "") +
      translationScore(record.name ?? "");
    const currentScore = current
      ? translationScore(current.description ?? "") + translationScore(current.name ?? "")
      : Number.NEGATIVE_INFINITY;

    if (!current || candidateScore > currentScore) {
      index.set(key, {
        name: record.name ?? "",
        description: record.description ?? ""
      });
    }
  }

  return index;
};

const attachSharedDescription = (entry, sharedIndex, type, originalName) => {
  const shared = sharedIndex.get(makeSourceKey(type, originalName));
  if (!shared?.description) return entry;
  return {
    ...(entry ?? {}),
    _sharedDescription: shared.description
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
    const record = ensureRecord(actorsJson.entries, uuid, "description");
    const sourceName = entry.originalName || inferOriginalName(record.name, record.description);
    const sourceDescription = entry.originalDescription || record.description || "";
    if (!needsTranslationPass(sourceName, sourceDescription)) continue;
    const compendiumEntry = findAnyCompendiumEntry(compendium, sourceName);
    const translatedName = await getTranslatedNameCandidate(
      record.name,
      sourceName,
      entry.type,
      compendiumEntry
    );
    if (shouldReplaceName(record.name, translatedName, sourceName)) {
      record.name = translatedName;
      actorNames += 1;
    }
    const translatedDescription = await getTranslatedBodyCandidate(
      store,
      record.description,
      sourceDescription,
      entry.type,
      compendiumEntry,
      "actors"
    );
    if (shouldReplaceBody(record.description, translatedDescription, sourceDescription)) {
      record.description = translatedDescription;
      actorBodies += 1;
    }
    actorsJson.entries[uuid] = record;
  }

  let itemNames = 0;
  let itemBodies = 0;
  for (const [uuid, entry] of Object.entries(template.items.entries ?? {})) {
    const record = ensureRecord(itemsJson.entries, uuid, "description");
    const sourceName = entry.originalName || inferOriginalName(record.name, record.description);
    const sourceDescription = entry.originalDescription || record.description || "";
    if (!needsTranslationPass(sourceName, sourceDescription)) continue;
    const compendiumEntry = findCompendiumEntry(compendium, entry.type, sourceName);
    const translatedName = await getTranslatedNameCandidate(
      record.name,
      sourceName,
      entry.type,
      compendiumEntry
    );
    if (shouldReplaceName(record.name, translatedName, sourceName)) {
      record.name = translatedName;
      itemNames += 1;
    }
    const translatedDescription = await getTranslatedBodyCandidate(
      store,
      record.description,
      sourceDescription,
      entry.type,
      compendiumEntry,
      "items"
    );
    if (shouldReplaceBody(record.description, translatedDescription, sourceDescription)) {
      record.description = translatedDescription;
      itemBodies += 1;
    }
    itemsJson.entries[uuid] = record;
  }

  const sharedItemTranslations = buildSharedTranslationIndex(
    template.items.entries ?? {},
    itemsJson.entries ?? {}
  );

  let actorItemNames = 0;
  let actorItemBodies = 0;
  for (const [uuid, entry] of Object.entries(template.actorItems.entries ?? {})) {
    const record = ensureRecord(actorItemsJson.entries, uuid, "description");
    const sourceName = entry.originalName || inferOriginalName(record.name, record.description);
    const sourceDescription = entry.originalDescription || record.description || "";
    if (!needsTranslationPass(sourceName, sourceDescription)) continue;
    const compendiumEntry = attachSharedDescription(
      findCompendiumEntry(compendium, entry.type, sourceName),
      sharedItemTranslations,
      entry.type,
      sourceName
    );
    const translatedName = await getTranslatedNameCandidate(
      record.name,
      sourceName,
      entry.type,
      compendiumEntry
    );
    if (shouldReplaceName(record.name, translatedName, sourceName)) {
      record.name = translatedName;
      actorItemNames += 1;
    }
    const translatedDescription = await getTranslatedBodyCandidate(
      store,
      record.description,
      sourceDescription,
      entry.type,
      compendiumEntry,
      "actorItems"
    );
    if (shouldReplaceBody(record.description, translatedDescription, sourceDescription)) {
      record.description = translatedDescription;
      actorItemBodies += 1;
    }
    actorItemsJson.entries[uuid] = record;
  }

  let journalNames = 0;
  let journalBodies = 0;
  for (const [uuid, entry] of Object.entries(template.journalPages.entries ?? {})) {
    const record = ensureRecord(journalJson.entries, uuid, "text");
    const sourceName = entry.originalName || inferOriginalName(record.name, record.text);
    const sourceText = entry.originalText || record.text || "";
    if (!needsTranslationPass(sourceName, sourceText)) continue;
    const translatedName = await getTranslatedNameCandidate(
      record.name,
      sourceName,
      entry.type,
      null
    );
    if (shouldReplaceName(record.name, translatedName, sourceName)) {
      record.name = translatedName;
      journalNames += 1;
    }
    const translatedText = await getTranslatedBodyCandidate(
      store,
      record.text,
      sourceText,
      entry.type,
      null,
      "journalPages"
    );
    if (shouldReplaceBody(record.text, translatedText, sourceText)) {
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
