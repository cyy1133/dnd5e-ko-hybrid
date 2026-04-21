import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const MODULE_ID = "dnd5e-ko-hybrid";
const WORLD_URL = "http://codeparrotyard.com:30000/game";
const USER_ID = "c3261v0zy76F6y8c"; // 징코DM
const PASSWORD = "1133";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUTPUT_DIR = path.resolve("tmp/live-verify");

const ensureDir = async (dir) => fs.mkdir(dir, { recursive: true });

const stripHtml = (value = "") =>
  String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();

const hasKorean = (value = "") => /[가-힣]/u.test(String(value ?? ""));

const englishHeavy = (value = "") => {
  const text = stripHtml(value);
  if (!text || text.length < 40) return false;
  if (hasKorean(text)) return false;
  const letters = (text.match(/[A-Za-z]/gu) ?? []).length;
  return letters >= 20;
};

const brokenReference = (value = "") => /&Reference\[[^\]]+\](?!\{)/u.test(String(value ?? ""));

const screenshot = async (page, name, options = {}) => {
  const file = path.join(OUTPUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true, ...options });
  return file;
};

const login = async (page) => {
  await page.goto(WORLD_URL, { waitUntil: "domcontentloaded" });
  if (page.url().includes("/join")) {
    await page.waitForSelector("select[name='userid']");
    await page.evaluate((userid) => {
      const select = document.querySelector("select[name='userid']");
      select.value = userid;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }, USER_ID);
    await page.fill("input[name='password']", PASSWORD);
    await page.click("button[name='join']");
  }

  await page.waitForFunction(() => globalThis.game?.ready === true, null, { timeout: 120000 });
  await page.waitForTimeout(4000);
  try {
    await page.waitForFunction((moduleId) => !!game.modules.get(moduleId)?.api?.store, MODULE_ID, { timeout: 120000 });
    await page.waitForFunction((moduleId) => {
      const store = game.modules.get(moduleId)?.api?.store;
      if (!store) return false;
      return (store.compendium?.size ?? 0) > 0 || (store.world?.items?.size ?? 0) > 0;
    }, MODULE_ID, { timeout: 30000 });
  } catch (_error) {
    // Keep verification running even if the translation store is slow to hydrate.
  }
};

const ensureModuleEnabled = async (page) => {
  const status = await page.evaluate((moduleId) => ({
    isGM: !!game.user?.isGM,
    active: !!game.modules.get(moduleId)?.active,
    configured: !!game.settings.get("core", "moduleConfiguration")?.[moduleId]
  }), MODULE_ID);

  if (status.active || !status.isGM) return status;

  await page.evaluate(async (moduleId) => {
    const config = foundry.utils.deepClone(game.settings.get("core", "moduleConfiguration"));
    config[moduleId] = true;
    await game.settings.set("core", "moduleConfiguration", config);
  }, MODULE_ID);

  await page.reload({ waitUntil: "domcontentloaded" });
  await login(page);

  return page.evaluate((moduleId) => ({
    isGM: !!game.user?.isGM,
    active: !!game.modules.get(moduleId)?.active,
    configured: !!game.settings.get("core", "moduleConfiguration")?.[moduleId]
  }), MODULE_ID);
};

const openSidebarTab = async (page, tab) => {
  await page.evaluate((tabName) => ui.sidebar.activateTab(tabName), tab);
  await page.waitForTimeout(750);
};

const renderActorSheet = async (page, actorName) => {
  await page.evaluate(async (name) => {
    const actor = game.actors.find((candidate) => candidate.name.includes(name));
    if (!actor) throw new Error(`Actor not found: ${name}`);
    actor.sheet.render(true);
  }, actorName);
  await page.waitForTimeout(1500);
};

const evaluateReport = async (page) => page.evaluate(async ({ moduleId }) => {
  const api = game.modules.get(moduleId)?.api ?? null;
  const store = api?.store ?? null;
  const actor = game.actors.find((candidate) => candidate.name.includes("양치기 디아나"));
  const spell = actor?.items.find((candidate) => /Catnap|선잠/u.test(candidate.name)) ?? null;
  const whispers = actor?.items.find((candidate) => /Dissonant Whispers|불협화음/u.test(candidate.name))
    ?? game.items.find((candidate) => /Dissonant Whispers|불협화음/u.test(candidate.name))
    ?? null;
  const harengon = game.items.find((candidate) => /Harengon|해렌곤/u.test(candidate.name)) ?? null;
  const revolutionPack = game.packs.get("beast-world.subclasses");

  const getPackDoc = async (pack, matcher) => {
    if (!pack) return null;
    const index = await pack.getIndex();
    const entry = index.find((candidate) => matcher(candidate.name));
    return entry ? pack.getDocument(entry._id) : null;
  };

  const revolution = await getPackDoc(revolutionPack, (name) => /Oath of Revolution/u.test(name));
  const catnapTooltip = spell ? await spell.richTooltip() : null;

  const getTranslatedBody = (document) => {
    if (!document) return "";
    if (document.documentName === "Actor") {
      return store?.getActorTranslation?.(document)?.description
        ?? document.system?.details?.biography?.value
        ?? document.system?.details?.description
        ?? "";
    }
    if (document.documentName === "Item") {
      return store?.getItemTranslation?.(document)?.description
        ?? document.system?.description?.value
        ?? document.system?.description
        ?? "";
    }
    if (document.documentName === "JournalEntryPage") {
      return store?.getJournalPageTranslation?.(document)?.text
        ?? document.text?.content
        ?? "";
    }
    return document.system?.description?.value ?? document.system?.description ?? document.text?.content ?? "";
  };

  const enrichTranslated = async (document) => {
    const body = getTranslatedBody(document);
    if (!body) return "";
    if (store?.translateHtmlStringSync) {
      return store.translateHtmlStringSync(body, {
        relativeTo: document,
        rollData: document?.getRollData?.() ?? document?.parent?.getRollData?.() ?? null
      });
    }
    return TextEditor.enrichHTML(body, { relativeTo: document });
  };

  const whispersHtml = whispers ? await enrichTranslated(whispers) : "";
  const harengonHtml = harengon ? await enrichTranslated(harengon) : "";
  const revolutionHtml = revolution ? await enrichTranslated(revolution) : "";

  const packs = game.packs
    .filter((pack) => ["world", "module"].includes(pack.metadata.packageType))
    .map((pack) => pack.collection);

  const samplePackCoverage = {};
  for (const collection of ["world.ddb---ddb-items", "world.ddb---ddb-spells", "world.ddb---ddb-monsters", "beast-world.subclasses", "beast-world.species"]) {
    if (!packs.includes(collection)) continue;
    const pack = game.packs.get(collection);
    const docs = await pack.getDocuments();
    const described = docs.filter((doc) => {
      const value = getTranslatedBody(doc);
      return String(value ?? "").trim().length > 0;
    });
    const englishOnly = described.filter((doc) => {
      const value = getTranslatedBody(doc);
      const text = String(value ?? "").replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim();
      if (!text || text.length < 40) return false;
      return !/[가-힣]/u.test(text);
    });
    samplePackCoverage[collection] = {
      described: described.length,
      englishOnly: englishOnly.length,
      samples: englishOnly.slice(0, 5).map((doc) => doc.name)
    };
  }

  const collectEnglishHeavy = (documents, extractor) => documents
    .map((doc) => ({ name: doc.name, text: extractor(doc) }))
    .filter((entry) => {
      const text = String(entry.text ?? "").replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim();
      if (!text || text.length < 40) return false;
      return !/[가-힣]/u.test(text);
    })
    .slice(0, 20);

  const worldItemsEnglish = collectEnglishHeavy(game.items.contents, (item) => getTranslatedBody(item));
  const actorItemsEnglish = collectEnglishHeavy(
    game.actors.contents.flatMap((actorDoc) => actorDoc.items.contents),
    (item) => getTranslatedBody(item)
  );
  const journalEnglish = collectEnglishHeavy(
    game.journal.contents.flatMap((journal) => journal.pages.contents),
    (pageDoc) => getTranslatedBody(pageDoc)
  );

  const temp = await Item.create({
    name: "ZZZ Overlay Probe",
    type: "feat",
    system: { description: { value: "<p>Editable probe body.</p>" } }
  }, { temporary: false });
  await temp.update({ "system.description.value": "<p>Editable probe changed.</p>" });
  const storedAfterUpdate = temp.system?.description?.value ?? "";
  await temp.delete();

  if (harengon) {
    harengon.sheet.render(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  const translatedAppId = harengon?.sheet?.appId ?? null;
  const translatedWindow = translatedAppId ? document.querySelector(`.window-app[data-appid='${translatedAppId}']`) : null;
  const panelCountBefore = translatedWindow?.querySelectorAll("[data-dnd5e-ko-hybrid-panel]").length ?? 0;
  harengon?.sheet?.render(false);
  await new Promise((resolve) => setTimeout(resolve, 750));
  const panelCountAfter = translatedWindow?.querySelectorAll("[data-dnd5e-ko-hybrid-panel]").length ?? 0;
  const editorHtml = translatedWindow?.querySelector(".editor-content")?.innerHTML ?? "";

  const itemsTab = document.querySelector("#items");
  const sidebarRows = [...(itemsTab?.querySelectorAll(".directory-item.document, .directory-item.actor, .directory-item.item") ?? [])].slice(0, 20);
  const iconRows = sidebarRows.map((row) => ({
    text: row.textContent?.trim() ?? "",
    hasImage: !!row.querySelector("img")
  }));

  return {
    module: {
      active: !!game.modules.get(moduleId)?.active,
      version: game.modules.get(moduleId)?.version ?? null,
      hasApi: !!api,
      loadError: api?.loadError ? String(api.loadError) : null
    },
    samples: {
      actorName: actor?.name ?? null,
      catnapName: spell?.name ?? null,
      catnapTooltipTitle: catnapTooltip?.content?.match(/<div class="title">([^<]+)/u)?.[1] ?? null,
      catnapTooltipText: catnapTooltip?.content?.replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim().slice(0, 300) ?? null,
      whispersName: whispers?.name ?? null,
      whispersHtml,
      harengonName: harengon?.name ?? null,
      harengonHtml,
      revolutionName: revolution?.name ?? null,
      revolutionHtml
    },
    coverage: {
      worldItemsEnglish,
      actorItemsEnglish,
      journalEnglish,
      samplePackCoverage
    },
    ui: {
      iconRows,
      probe: {
        panelCountBefore,
        panelCountAfter,
        editorHtml,
        storedAfterUpdate
      }
    }
  };
}, { moduleId: MODULE_ID });

const main = async () => {
  await ensureDir(OUTPUT_DIR);
  const startedAt = Date.now();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--disable-dev-shm-usage"]
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });

  try {
    await login(page);
    const moduleStatus = await ensureModuleEnabled(page);
    const readyMs = Date.now() - startedAt;
    await screenshot(page, "01-after-login");

    await openSidebarTab(page, "items");
    await screenshot(page, "02-items-sidebar");

    await renderActorSheet(page, "양치기 디아나");
    await screenshot(page, "03-actor-sheet");

    const report = await evaluateReport(page);
    report.timing = { readyMs };
    report.module.enabledStatus = moduleStatus;

    await fs.writeFile(path.join(OUTPUT_DIR, "report.json"), JSON.stringify(report, null, 2), "utf8");

    const summary = {
      module: report.module,
      timing: report.timing,
      samples: {
        catnapTooltipTitle: report.samples.catnapTooltipTitle,
        catnapTooltipHasKorean: hasKorean(report.samples.catnapTooltipText ?? ""),
        whispersReferenceBroken: brokenReference(report.samples.whispersHtml ?? ""),
        harengonHasKorean: hasKorean(stripHtml(report.samples.harengonHtml ?? "")),
        revolutionHasKorean: hasKorean(stripHtml(report.samples.revolutionHtml ?? ""))
      },
      ui: {
        iconRowsMissingImage: report.ui.iconRows.filter((row) => !row.hasImage).length,
        probePanelCountBefore: report.ui.probe.panelCountBefore,
        probePanelCountAfter: report.ui.probe.panelCountAfter,
        probeStoredAfterUpdate: report.ui.probe.storedAfterUpdate
      },
      coverage: {
        worldItemsEnglishCount: report.coverage.worldItemsEnglish.length,
        actorItemsEnglishCount: report.coverage.actorItemsEnglish.length,
        journalEnglishCount: report.coverage.journalEnglish.length,
        samplePackCoverage: report.coverage.samplePackCoverage
      },
      files: {
        report: path.join(OUTPUT_DIR, "report.json"),
        afterLogin: path.join(OUTPUT_DIR, "01-after-login.png"),
        itemsSidebar: path.join(OUTPUT_DIR, "02-items-sidebar.png"),
        actorSheet: path.join(OUTPUT_DIR, "03-actor-sheet.png")
      }
    };

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await browser.close();
  }
};

await main();
