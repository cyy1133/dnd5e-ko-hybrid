import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const WORLD_URL = "http://codeparrotyard.com:30000/game";
const WORLD_ID = "-";
const USER_ID = "c3261v0zy76F6y8c"; // 징코DM
const PASSWORD = "1133";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const MODULE_ID = "dnd5e-ko-hybrid";
const HOTFIX_DIR = `worlds/${WORLD_ID}/scripts/${MODULE_ID}-hotfix`;
const LOADER_PATH = `worlds/${WORLD_ID}/scripts/${MODULE_ID}-hotfix-loader.js`;

const FILES = [
  {
    local: path.resolve("scripts/world-hotfix-loader.js"),
    remoteDir: `worlds/${WORLD_ID}/scripts`,
    name: `${MODULE_ID}-hotfix-loader.js`,
    type: "application/javascript"
  },
  {
    local: path.resolve("scripts/runtime-overlay.js"),
    remoteDir: HOTFIX_DIR,
    name: "runtime-overlay.js",
    type: "application/javascript"
  },
  {
    local: path.resolve("scripts/translation-store.js"),
    remoteDir: HOTFIX_DIR,
    name: "translation-store.js",
    type: "application/javascript"
  },
  {
    local: path.resolve("scripts/ddb-importer-patches.js"),
    remoteDir: HOTFIX_DIR,
    name: "ddb-importer-patches.js",
    type: "application/javascript"
  }
];

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
};

const uploadFile = async (page, fileInfo) => {
  const content = await fs.readFile(fileInfo.local);
  const payload = content.toString("base64");
  return page.evaluate(async ({ remoteDir, name, type, payload }) => {
    const binary = atob(payload);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const file = new File([bytes], name, { type });
    return FilePicker.upload("data", remoteDir, file, { overwrite: true }, { notify: false });
  }, { ...fileInfo, payload });
};

const patchWorldManifest = async (page) => {
  const current = await page.evaluate(() => fetch(`/worlds/-/world.json`).then((response) => response.json()));
  const scripts = Array.isArray(current.scripts) ? [...current.scripts] : [];
  const relativeLoader = `scripts/${MODULE_ID}-hotfix-loader.js`;
  if (!scripts.includes(relativeLoader)) scripts.push(relativeLoader);
  current.scripts = scripts;

  const content = Buffer.from(JSON.stringify(current, null, 2), "utf8").toString("base64");
  return page.evaluate(async ({ payload }) => {
    const binary = atob(payload);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const file = new File([bytes], "world.json", { type: "application/json" });
    return FilePicker.upload("data", "worlds/-", file, { overwrite: true }, { notify: false });
  }, { payload: content });
};

const deploy = async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  const page = await browser.newPage();

  try {
    await login(page);
    await page.evaluate(async (dir) => {
      try { await FilePicker.createDirectory("data", dir); } catch {}
    }, `worlds/${WORLD_ID}/scripts`);
    await page.evaluate(async (dir) => {
      try { await FilePicker.createDirectory("data", dir); } catch {}
    }, HOTFIX_DIR);

    const uploads = [];
    for (const fileInfo of FILES) uploads.push(await uploadFile(page, fileInfo));
    const manifestUpload = await patchWorldManifest(page);

    await page.reload({ waitUntil: "domcontentloaded" });
    await login(page);
    await page.waitForTimeout(2500);

    const state = await page.evaluate(() => ({
      moduleVersion: game.modules.get("dnd5e-ko-hybrid")?.version ?? null,
      apiVersion: game.modules.get("dnd5e-ko-hybrid")?.api?.hotfixVersion ?? null,
      hasApi: !!game.modules.get("dnd5e-ko-hybrid")?.api,
      worldScripts: game.world._source?.scripts ?? [],
      loaderPresent: [...document.scripts].some((script) => script.src.includes("dnd5e-ko-hybrid-hotfix-loader.js"))
    }));

    console.log(JSON.stringify({ uploads, manifestUpload, state }, null, 2));
  } finally {
    await browser.close();
  }
};

await deploy();
