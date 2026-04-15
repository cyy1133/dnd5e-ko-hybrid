import fs from "fs/promises";
import path from "path";
import { TranslationStore, nameToKo } from "./translation-store.js";

const ROOT = path.resolve("A:/TRPG/Compendium Translator");
const COMPENDIUM_DIR = path.join(ROOT, "localization/compendium/ko");

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

const GENERIC_PAGE_NAME_TRANSLATIONS = {
  Image: "이미지",
  Text: "텍스트",
  "Page 1": "페이지 1",
  "Page 2": "페이지 2",
  "Page 3": "페이지 3"
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

const sortObject = (object) =>
  Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)));

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));

const readJsonIfExists = async (filePath) => {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
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

const findCompendiumEntry = (compendium, type, originalName) => {
  if (!originalName) return null;
  for (const collection of preferredCollectionsForType(type)) {
    const entry = compendium.get(collection)?.[originalName];
    if (entry) return entry;
  }
  return null;
};

const findCompendiumActorEntry = (compendium, originalName) => {
  if (!originalName) return null;
  return compendium.get("dnd5e.monsters")?.[originalName]
    ?? compendium.get("dnd5e.heroes")?.[originalName]
    ?? null;
};

const translateName = (originalName, type, compendiumEntry) => {
  if (!originalName) return "";
  if (hasKorean(originalName)) return "";
  const translated =
    compendiumEntry?.name
    ?? GENERIC_PAGE_NAME_TRANSLATIONS[originalName]
    ?? nameToKo(originalName);
  return formatBilingualName(originalName, translated);
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

const shouldReplaceText = (currentValue, candidateValue, originalValue = "") => {
  const current = String(currentValue ?? "").trim();
  const candidate = String(candidateValue ?? "").trim();
  const original = String(originalValue ?? "").trim();

  if (!candidate || candidate === original) return false;
  if (!current) return true;

  const currentHasKorean = hasKorean(current);
  const candidateHasKorean = hasKorean(candidate);
  const currentEnglishOnly = hasEnglish(current) && !currentHasKorean;
  const candidateEnglishOnly = hasEnglish(candidate) && !candidateHasKorean;

  if (candidateHasKorean && !currentHasKorean) return true;
  if (candidateHasKorean && currentEnglishOnly) return true;
  if (candidateHasKorean && currentHasKorean && hasEnglish(current) && !candidateEnglishOnly) return true;

  return false;
};

const hasAnyTranslation = (entry) => {
  if (!entry) return false;
  if (entry.name || entry.description || entry.text) return true;
  if (entry.items && Object.values(entry.items).some((item) => hasAnyTranslation(item))) return true;
  if (entry.pages && Object.values(entry.pages).some((page) => hasAnyTranslation(page))) return true;
  return false;
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
  const templatePath = await findLatestTemplatePath();
  const [template, compendium, store] = await Promise.all([
    readJson(templatePath),
    loadCompendiumByCollection(),
    Promise.resolve(new TranslationStore())
  ]);

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

    const targetPath = path.join(COMPENDIUM_DIR, `${collection}.json`);
    const existingPack = await readJsonIfExists(targetPath);
    const packJson = buildPackSkeleton(packTemplate, existingPack);

    for (const [entryName, templateEntry] of Object.entries(packTemplate.entries ?? {})) {
      const existingEntry = packJson.entries[entryName] ?? {};

      switch (packTemplate.documentName) {
        case "Item": {
          const compendiumEntry = findCompendiumEntry(compendium, templateEntry.type, templateEntry.originalName);
          const translatedName = translateName(templateEntry.originalName, templateEntry.type, compendiumEntry);
          if (shouldReplaceText(existingEntry.name, translatedName, templateEntry.originalName)) {
            existingEntry.name = translatedName;
            itemNames += 1;
          }

          const translatedDescription = maybeBodyTranslation(
            store,
            templateEntry.originalDescription,
            templateEntry.type,
            compendiumEntry,
            "items"
          );
          if (shouldReplaceText(existingEntry.description, translatedDescription, templateEntry.originalDescription)) {
            existingEntry.description = translatedDescription;
            itemBodies += 1;
          }
          break;
        }
        case "Actor": {
          const compendiumActor = findCompendiumActorEntry(compendium, templateEntry.originalName);
          const translatedName = translateName(templateEntry.originalName, templateEntry.type, compendiumActor);
          if (shouldReplaceText(existingEntry.name, translatedName, templateEntry.originalName)) {
            existingEntry.name = translatedName;
            actorNames += 1;
          }

          const translatedDescription = maybeBodyTranslation(
            store,
            templateEntry.originalDescription,
            templateEntry.type,
            compendiumActor,
            "actors"
          );
          if (shouldReplaceText(existingEntry.description, translatedDescription, templateEntry.originalDescription)) {
            existingEntry.description = translatedDescription;
            actorBodies += 1;
          }

          existingEntry.items = existingEntry.items ?? {};
          for (const [itemName, itemTemplate] of Object.entries(templateEntry.items ?? {})) {
            const existingItem = existingEntry.items[itemName] ?? {};
            const compendiumEntry = findCompendiumEntry(compendium, itemTemplate.type, itemTemplate.originalName);
            const translatedItemName = translateName(itemTemplate.originalName, itemTemplate.type, compendiumEntry);
            if (shouldReplaceText(existingItem.name, translatedItemName, itemTemplate.originalName)) {
              existingItem.name = translatedItemName;
              actorItemNames += 1;
            }

            const translatedDescription = maybeBodyTranslation(
              store,
              itemTemplate.originalDescription,
              itemTemplate.type,
              compendiumEntry,
              "actorItems"
            );
            if (shouldReplaceText(existingItem.description, translatedDescription, itemTemplate.originalDescription)) {
              existingItem.description = translatedDescription;
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
          const translatedName = translateName(templateEntry.originalName, templateEntry.type, null);
          if (shouldReplaceText(existingEntry.name, translatedName, templateEntry.originalName)) {
            existingEntry.name = translatedName;
            journalNames += 1;
          }

          existingEntry.pages = existingEntry.pages ?? {};
          for (const [pageName, pageTemplate] of Object.entries(templateEntry.pages ?? {})) {
            const existingPage = existingEntry.pages[pageName] ?? {};
            const translatedPageName = translateName(pageTemplate.originalName, pageTemplate.type, null);
            if (shouldReplaceText(existingPage.name, translatedPageName, pageTemplate.originalName)) {
              existingPage.name = translatedPageName;
              journalNames += 1;
            }

            const translatedText = maybeBodyTranslation(
              store,
              pageTemplate.originalText,
              pageTemplate.type,
              null,
              "journalPages"
            );
            if (shouldReplaceText(existingPage.text, translatedText, pageTemplate.originalText)) {
              existingPage.text = translatedText;
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
          const translatedName = translateName(templateEntry.originalName ?? entryName, templateEntry.type, null);
          if (shouldReplaceText(existingEntry.name, translatedName, templateEntry.originalName ?? entryName)) {
            existingEntry.name = translatedName;
          }
          break;
        }
      }

      if (hasAnyTranslation(existingEntry)) {
        packJson.entries[entryName] = normalizeEntry(existingEntry);
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
