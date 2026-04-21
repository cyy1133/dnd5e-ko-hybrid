const MODULE_ID = "dnd5e-ko-hybrid";

let store = null;
let overlay = null;

const COMPENDIUM_REFRESH_DELAYS = [500, 1500, 3000, 5000, 8000, 12000];
const REQUIRED_COMPENDIUM_COLLECTIONS = ["dnd5e.rules", "world.ddb---ddb-items", "world.ddb---ddb-spells"];

const saveJson = (filename, data) => {
  const blob = JSON.stringify(data, null, 2);
  saveDataToFile(blob, "application/json", filename);
};

const hasEnglish = (value = "") => /[A-Za-z]/.test(String(value));
const normalizeText = (value = "") => String(value ?? "").trim();
const extractItemDescription = (item) => item?.system?.description?.value ?? item?.system?.description ?? "";
const extractActorDescription = (actor) =>
  actor?.system?.details?.biography?.value
  ?? actor?.system?.details?.description
  ?? actor?.system?.description?.value
  ?? "";
const normalizePackFilter = (packFilter) => {
  if (!packFilter) return null;
  if (packFilter instanceof Set) return packFilter;
  if (Array.isArray(packFilter)) {
    return new Set(packFilter.map((value) => normalizeText(value)).filter(Boolean));
  }
  if (typeof packFilter === "string") {
    return new Set(packFilter.split(",").map((value) => normalizeText(value)).filter(Boolean));
  }
  return null;
};
const shouldIncludePack = (pack, { includeSystemCompendiums = false, filter = null } = {}) => {
  if (!pack?.collection) return false;
  if (filter?.size && !filter.has(pack.collection)) return false;
  if (!includeSystemCompendiums && pack.collection.startsWith("dnd5e.")) return false;
  return true;
};

const createFallbackWorldTemplate = async ({
  onlyEnglish = true,
  includeCompendiums = true,
  includeSystemCompendiums = false,
  packFilter = null
} = {}) => {
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

  const actors = {};
  for (const actor of game.actors ?? []) {
    const description = extractActorDescription(actor);
    if (!shouldInclude(actor.name, description)) continue;
    actors[actor.uuid] = {
      name: "",
      description: "",
      originalName: actor.name,
      originalDescription: description,
      type: actor.type
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

  const template = {
    metadata: {
      module: MODULE_ID,
      generatedAt: new Date().toISOString(),
      world: game.world?.title ?? "",
      foundryVersion: game.release?.version ?? game.version ?? "",
      systemVersion: game.system?.version ?? ""
    },
    actors: {
      label: "Actors",
      entries: actors
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

  if (includeCompendiums) {
    const filter = normalizePackFilter(packFilter);
    const compendiums = {};

    for (const pack of game.packs ?? []) {
      if (!shouldIncludePack(pack, { includeSystemCompendiums, filter })) continue;

      let documents;
      try {
        documents = await pack.getDocuments();
      } catch (error) {
        console.warn(`${MODULE_ID} | Failed to export fallback compendium template for ${pack.collection}`, error);
        continue;
      }

      const entries = {};
      for (const document of documents) {
        switch (document.documentName) {
          case "Actor": {
            const description = extractActorDescription(document);
            const items = {};
            for (const item of document.items ?? []) {
              const itemDescription = extractItemDescription(item);
              if (!shouldInclude(item.name, itemDescription)) continue;
              items[item.name] = {
                name: "",
                description: "",
                originalName: item.name,
                originalDescription: itemDescription,
                type: item.type,
                source: item.system?.source ?? null
              };
            }
            if (!shouldInclude(document.name, description) && !Object.keys(items).length) continue;
            entries[document.name] = {
              name: "",
              description: "",
              originalName: document.name,
              originalDescription: description,
              type: document.type,
              items
            };
            break;
          }
          case "Item": {
            const description = extractItemDescription(document);
            if (!shouldInclude(document.name, description)) continue;
            entries[document.name] = {
              name: "",
              description: "",
              originalName: document.name,
              originalDescription: description,
              type: document.type,
              source: document.system?.source ?? null
            };
            break;
          }
          case "JournalEntry": {
            const pages = {};
            for (const page of document.pages ?? []) {
              const text = page.text?.content ?? "";
              if (!shouldInclude(page.name, text)) continue;
              pages[page.name] = {
                name: "",
                text: "",
                originalName: page.name,
                originalText: text,
                type: page.type
              };
            }
            if (!shouldInclude(document.name, "") && !Object.keys(pages).length) continue;
            entries[document.name] = {
              name: "",
              originalName: document.name,
              pages
            };
            break;
          }
          default:
            if (!shouldInclude(document.name, "")) continue;
            entries[document.name] = {
              name: "",
              originalName: document.name
            };
            break;
        }
      }

      if (!Object.keys(entries).length) continue;

      compendiums[pack.collection] = {
        label: pack.metadata?.label ?? pack.title ?? pack.collection,
        documentName: pack.documentName ?? null,
        packageType: pack.metadata?.packageType ?? pack.metadata?.package ?? null,
        packageName: pack.metadata?.packageName ?? null,
        entries
      };
    }

    template.compendiums = {
      label: "Compendiums",
      entries: compendiums
    };
  }

  return template;
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
  async exportTemplates(options = {}) {
    return store?.createWorldTemplate?.(options) ?? createFallbackWorldTemplate(options);
  },
  async downloadTemplates(options = {}) {
    const data = await this.exportTemplates(options);
    const stamp = new Date().toISOString().replaceAll(":", "-");
    saveJson(`${MODULE_ID}-template-${stamp}.json`, data);
    return data;
  }
});

const installDdbImporterCompatWithRetry = (installer, { debug = false, attempt = 0 } = {}) => {
  if (typeof installer !== "function") return;
  const installed = installer({ debug });
  if (installed || attempt >= 6) return;

  const delay = [250, 750, 1500, 3000, 5000, 8000][attempt] ?? 8000;
  setTimeout(() => installDdbImporterCompatWithRetry(installer, { debug, attempt: attempt + 1 }), delay);
};

const hasHydratedCompendiums = () => {
  if (!store?.compendium) return false;
  return REQUIRED_COMPENDIUM_COLLECTIONS.every((collection) => store.compendium.has(collection));
};

const scheduleCompendiumHydration = (api, { debug = false, attempt = 0 } = {}) => {
  if (!store) return;
  if (hasHydratedCompendiums()) return;
  if (attempt >= COMPENDIUM_REFRESH_DELAYS.length) {
    console.warn(`${MODULE_ID} | Compendium translations never hydrated after startup.`);
    return;
  }

  const delay = COMPENDIUM_REFRESH_DELAYS[attempt];
  setTimeout(async () => {
    if (!store || hasHydratedCompendiums()) return;
    try {
      await store.refreshCompendiums();
      overlay?.rerenderOpenApplications?.();
      if (debug) {
        console.info(`${MODULE_ID} | Hydrated compendium translations`, {
          attempt: attempt + 1,
          count: store.compendium?.size ?? 0,
          hydrated: hasHydratedCompendiums()
        });
      }
    } catch (error) {
      console.warn(`${MODULE_ID} | Deferred compendium hydration failed`, error);
    }

    if (!hasHydratedCompendiums()) {
      scheduleCompendiumHydration(api, { debug, attempt: attempt + 1 });
    }
  }, delay);
};

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
  const debug = game.settings.get(MODULE_ID, "debug");

  try {
    const [{ installDdbImporterPatches }, { TranslationStore }, { RuntimeOverlay }] = await Promise.all([
      import("./ddb-importer-patches.js"),
      import("./translation-store.js"),
      import("./runtime-overlay.js")
    ]);

    installDdbImporterCompatWithRetry(installDdbImporterPatches, { debug });

    store = new TranslationStore();
    overlay = new RuntimeOverlay(store);

    overlay.activate();
    await store.load();
    scheduleCompendiumHydration(api, { debug });
    overlay.rerenderOpenApplications();
    api.loadError = null;
  } catch (error) {
    api.loadError = error;
    console.error(`${MODULE_ID} | Failed to initialize translation modules`, error);
  }

  if (debug) {
    console.info(`${MODULE_ID} | Loaded translation store`, store);
  }
});
