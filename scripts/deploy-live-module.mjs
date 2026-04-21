import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const WORLD_URL = "http://codeparrotyard.com:30000/game";
const USER_ID = "c3261v0zy76F6y8c"; // 징코DM
const PASSWORD = "1133";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const RELEASE_DIR = path.resolve("release/dnd5e-ko-hybrid-v0.1.34");
const REMOTE_ROOT = "modules/dnd5e-ko-hybrid";

const MIME_TYPES = {
  ".json": "application/json",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".md": "text/markdown",
  ".txt": "text/plain",
  ".html": "text/html"
};

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const dirs = [];
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      dirs.push(fullPath);
      const nested = await walk(fullPath);
      dirs.push(...nested.dirs);
      files.push(...nested.files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return { dirs, files };
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
  await page.waitForTimeout(1500);
};

const ensureModuleEnabled = async (page) => {
  await page.evaluate(async () => {
    const config = foundry.utils.deepClone(game.settings.get("core", "moduleConfiguration"));
    if (config["dnd5e-ko-hybrid"]) return;
    config["dnd5e-ko-hybrid"] = true;
    await game.settings.set("core", "moduleConfiguration", config);
  });
};

const deploy = async () => {
  const { dirs, files } = await walk(RELEASE_DIR);
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  const page = await browser.newPage();

  try {
    await login(page);

    for (const directory of dirs) {
      const relative = path.relative(RELEASE_DIR, directory).replaceAll("\\", "/");
      const remoteDir = `${REMOTE_ROOT}/${relative}`;
      await page.evaluate(async (target) => {
        try {
          await FilePicker.createDirectory("data", target);
        } catch (error) {
          const message = String(error);
          if (!message.includes("EEXIST") && !message.includes("already exists")) throw error;
        }
      }, remoteDir);
    }

    for (const filePath of files) {
      const relative = path.relative(RELEASE_DIR, filePath).replaceAll("\\", "/");
      const remoteDir = path.posix.dirname(`${REMOTE_ROOT}/${relative}`);
      const fileName = path.basename(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = MIME_TYPES[ext] ?? "application/octet-stream";
      const content = await fs.readFile(filePath);
      const base64 = content.toString("base64");

      await page.evaluate(async ({ targetDir, name, type, payload }) => {
        const binary = atob(payload);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        const file = new File([bytes], name, { type });
        await FilePicker.upload("data", targetDir, file, { overwrite: true }, { notify: false });
      }, {
        targetDir: remoteDir,
        name: fileName,
        type: mimeType,
        payload: base64
      });
    }

    await ensureModuleEnabled(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await login(page);

    const state = await page.evaluate(() => ({
      active: game.modules.get("dnd5e-ko-hybrid")?.active ?? null,
      version: game.modules.get("dnd5e-ko-hybrid")?.version ?? null,
      configured: game.settings.get("core", "moduleConfiguration")?.["dnd5e-ko-hybrid"] ?? null,
      hasApi: !!game.modules.get("dnd5e-ko-hybrid")?.api
    }));

    console.log(JSON.stringify({
      deployedFiles: files.length,
      deployedDirectories: dirs.length,
      state
    }, null, 2));
  } finally {
    await browser.close();
  }
};

await deploy();
