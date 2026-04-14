import { MODULE_ID, TranslationStore } from "./translation-store.js";
import { RuntimeOverlay } from "./runtime-overlay.js";

const store = new TranslationStore();
const overlay = new RuntimeOverlay(store);

const saveJson = (filename, data) => {
  const blob = JSON.stringify(data, null, 2);
  saveDataToFile(blob, "application/json", filename);
};

const createApi = () => ({
  store,
  async refresh() {
    await store.refresh();
    overlay.rerenderOpenApplications();
  },
  exportTemplates(options = {}) {
    return store.createWorldTemplate(options);
  },
  downloadTemplates(options = {}) {
    const data = store.createWorldTemplate(options);
    const stamp = new Date().toISOString().replaceAll(":", "-");
    saveJson(`${MODULE_ID}-template-${stamp}.json`, data);
    return data;
  }
});

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "enable-runtime-overlay", {
    name: "DND5E-KO-HYBRID.Settings.Enable.Name",
    hint: "DND5E-KO-HYBRID.Settings.Enable.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => overlay.rerenderOpenApplications()
  });

  game.settings.register(MODULE_ID, "debug", {
    name: "DND5E-KO-HYBRID.Settings.Debug.Name",
    hint: "DND5E-KO-HYBRID.Settings.Debug.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false
  });

  if (typeof Babele !== "undefined") {
    game.babele?.register?.({
      module: MODULE_ID,
      lang: "ko",
      dir: "localization/compendium/ko"
    });
  }
});

Hooks.once("ready", async () => {
  await store.load();
  overlay.activate();

  game.modules.get(MODULE_ID).api = createApi();
  globalThis.dnd5eKoHybrid = game.modules.get(MODULE_ID).api;

  if (game.settings.get(MODULE_ID, "debug")) {
    console.info(`${MODULE_ID} | Loaded translation store`, store);
  }
});
