import fs from "fs/promises";
import path from "path";
import { chromium } from "playwright-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PROFILE_PATH = "A:\\temp\\edge-fvtt-profile";
const OUTPUT_DIR = "A:\\TRPG\\Compendium Translator\\tmp";
const GAME_URL = "http://codeparrotyard.com:30000/game";

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const main = async () => {
  await ensureDir(OUTPUT_DIR);

  const context = await chromium.launchPersistentContext(PROFILE_PATH, {
    executablePath: EDGE_PATH,
    headless: true,
    viewport: { width: 1600, height: 1200 }
  });

  try {
    const page = context.pages()[0] ?? await context.newPage();
    await page.goto(GAME_URL, { waitUntil: "domcontentloaded", timeout: 120000 });
    try {
      await page.waitForFunction(
        () => typeof game !== "undefined" && !!game.user?.name && !!globalThis.dnd5eKoHybrid?.exportTemplates,
        { timeout: 60000 }
      );
    } catch {
      await page.waitForTimeout(5000);
    }

    const loginState = await page.evaluate(() => {
      const hasGame = typeof game !== "undefined";
      return {
        url: location.href,
        title: document.title,
        bodyText: document.body?.innerText?.slice(0, 500) ?? "",
        hasGame,
        worldTitle: hasGame ? game.world?.title ?? null : null,
        userName: hasGame ? game.user?.name ?? null : null,
        moduleVersion: hasGame ? game.modules.get("dnd5e-ko-hybrid")?.version ?? null : null,
        moduleActive: hasGame ? game.modules.get("dnd5e-ko-hybrid")?.active ?? null : null,
        hasApi: hasGame ? !!game.modules.get("dnd5e-ko-hybrid")?.api : false,
        apiReady: hasGame ? typeof globalThis.dnd5eKoHybrid?.exportTemplates === "function" : false
      };
    });

    await fs.writeFile(
      path.join(OUTPUT_DIR, "remote-login-state.json"),
      JSON.stringify(loginState, null, 2),
      "utf8"
    );

    if (!loginState.hasGame || !loginState.apiReady) {
      throw new Error(`World/API unavailable: ${JSON.stringify(loginState)}`);
    }

    const templates = await page.evaluate(async () => {
      return globalThis.dnd5eKoHybrid.exportTemplates({ onlyEnglish: true });
    });

    await fs.writeFile(
      path.join(OUTPUT_DIR, "remote-template-export.json"),
      JSON.stringify(templates, null, 2),
      "utf8"
    );
  } finally {
    await context.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
