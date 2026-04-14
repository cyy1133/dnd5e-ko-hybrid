const MODULE_ID = "dnd5e-ko-hybrid";

let store = null;
let overlay = null;

const saveJson = (filename, data) => {
  const blob = JSON.stringify(data, null, 2);
  saveDataToFile(blob, "application/json", filename);
};

const hasEnglish = (value = "") => /[A-Za-z]/.test(String(value));

const createFallbackWorldTemplate = ({ onlyEnglish = true } = {}) => {
  const shouldInclude = (name = "", body = "") => {
    if (!onlyEnglish) return true;
    return hasEnglish(name) || hasEnglish(body);
  };

  const items = {};
  for (const item of game.items ?? []) {
    const description = item.system?.description?.value ?? "";
    if (!shouldInclude(item.name, description)) continue;
    items[item.uuid] = {
      name: "",
      description: "",
      originalName: item.name,
      originalDescription: description,
      type: item.type,
      source: item.system?.source ?? null
    };
  }

  const actorItems = {};
  for (const actor of game.actors ?? []) {
    for (const item of actor.items ?? []) {
      const description = item.system?.description?.value ?? "";
      if (!shouldInclude(item.name, description)) continue;
      actorItems[item.uuid] = {
        name: "",
        description: "",
        originalName: item.name,
        originalDescription: description,
        actor: actor.name,
        type: item.type,
        source: item.system?.source ?? null
      };
    }
  }

  const journalPages = {};
  for (const journal of game.journal ?? []) {
    for (const page of journal.pages ?? []) {
      const text = page.text?.content ?? "";
      if (!shouldInclude(page.name, text)) continue;
      journalPages[page.uuid] = {
        name: "",
        text: "",
        originalName: page.name,
        originalText: text,
        journal: journal.name,
        type: page.type
      };
    }
  }

  return {
    metadata: {
      module: MODULE_ID,
      generatedAt: new Date().toISOString(),
      world: game.world?.title ?? "",
      foundryVersion: game.release?.version ?? game.version ?? "",
      systemVersion: game.system?.version ?? ""
    },
    actors: {
      label: "Actors",
      entries: {}
    },
    items: {
      label: "World Items",
      entries: items
    },
    actorItems: {
      label: "Actor Embedded Items",
      entries: actorItems
    },
    journalPages: {
      label: "Journal Pages",
      entries: journalPages
    }
  };
};

const createApi = () => ({
  get store() {
    return store;
  },
  get overlay() {
    return overlay;
  },
  loadError: null,
  async refresh() {
    if (!store) {
      throw new Error("Translation store is not initialized.");
    }
    try {
      await store.refresh();
      overlay?.rerenderOpenApplications?.();
      this.loadError = null;
    } catch (error) {
      this.loadError = error;
      console.error(`${MODULE_ID} | Refresh failed`, error);
      throw error;
    }
  },
  exportTemplates(options = {}) {
    return store?.createWorldTemplate?.(options) ?? createFallbackWorldTemplate(options);
  },
  downloadTemplates(options = {}) {
    const data = this.exportTemplates(options);
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
    onChange: () => overlay?.rerenderOpenApplications?.()
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
  const api = createApi();
  game.modules.get(MODULE_ID).api = api;
  globalThis.dnd5eKoHybrid = api;

  try {
    const [{ TranslationStore }, { RuntimeOverlay }] = await Promise.all([
      import("./translation-store.js"),
      import("./runtime-overlay.js")
    ]);

    store = new TranslationStore();
    overlay = new RuntimeOverlay(store);

    await store.load();
    overlay.activate();
    api.loadError = null;
  } catch (error) {
    api.loadError = error;
    console.error(`${MODULE_ID} | Failed to initialize translation modules`, error);
  }

  if (game.settings.get(MODULE_ID, "debug")) {
    console.info(`${MODULE_ID} | Loaded translation store`, store);
  }
});
