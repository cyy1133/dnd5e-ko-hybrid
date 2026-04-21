(() => {
  const MODULE_ID = "dnd5e-ko-hybrid";
  const HOTFIX_VERSION = "0.1.32-world-hotfix";
  const WORLD_HOTFIX_BASE = `/worlds/-/scripts/${MODULE_ID}-hotfix`;
  const STYLE_ID = `${MODULE_ID}-world-hotfix-style`;

  const HOTFIX_STATE = globalThis.__dnd5eKoHybridWorldHotfix ??= {
    initialized: false,
    initialising: false,
    store: null,
    overlay: null,
    api: null
  };

  const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .dnd5e-ko-hybrid-panel {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid var(--color-border-light-2, rgba(0,0,0,0.15));
      }
      .dnd5e-ko-hybrid-panel__heading {
        margin: 0 0 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.75;
      }
    `;
    document.head.append(style);
  };

  const createApi = () => ({
    get store() {
      return HOTFIX_STATE.store;
    },
    get overlay() {
      return HOTFIX_STATE.overlay;
    },
    loadError: null,
    hotfixVersion: HOTFIX_VERSION,
    async refresh() {
      if (!HOTFIX_STATE.store) throw new Error("Translation store is not initialized.");
      await HOTFIX_STATE.store.refresh();
      HOTFIX_STATE.overlay?.rerenderOpenApplications?.();
      this.loadError = null;
    }
  });

  const isTargetReadyHook = (fn) => {
    const source = String(fn);
    return source.includes("installDdbImporterCompatWithRetry")
      || source.includes("globalThis.dnd5eKoHybrid = api")
      || (source.includes("TranslationStore") && source.includes("RuntimeOverlay") && source.includes("store.load"));
  };

  const initializeHotfix = async () => {
    if (HOTFIX_STATE.initialized || HOTFIX_STATE.initialising) return HOTFIX_STATE.api;
    HOTFIX_STATE.initialising = true;

    try {
      const [{ installDdbImporterPatches }, { TranslationStore }, { RuntimeOverlay }] = await Promise.all([
        import(`${WORLD_HOTFIX_BASE}/ddb-importer-patches.js`),
        import(`${WORLD_HOTFIX_BASE}/translation-store.js`),
        import(`${WORLD_HOTFIX_BASE}/runtime-overlay.js`)
      ]);

      if (!HOTFIX_STATE.api) HOTFIX_STATE.api = createApi();

      const module = game.modules.get(MODULE_ID);
      if (module) {
        module.api = HOTFIX_STATE.api;
        try {
          module.version = HOTFIX_VERSION;
        } catch {}
      }
      globalThis.dnd5eKoHybrid = HOTFIX_STATE.api;

      injectStyles();
      installDdbImporterPatches?.({ debug: game.settings.get(MODULE_ID, "debug") });

      HOTFIX_STATE.store = new TranslationStore();
      HOTFIX_STATE.overlay = new RuntimeOverlay(HOTFIX_STATE.store);
      HOTFIX_STATE.overlay.activate();
      await HOTFIX_STATE.store.load();
      HOTFIX_STATE.overlay.rerenderOpenApplications?.();
      HOTFIX_STATE.api.loadError = null;
      HOTFIX_STATE.initialized = true;
      return HOTFIX_STATE.api;
    } catch (error) {
      console.error(`${MODULE_ID} world hotfix failed`, error);
      if (HOTFIX_STATE.api) HOTFIX_STATE.api.loadError = error;
      throw error;
    } finally {
      HOTFIX_STATE.initialising = false;
    }
  };

  const replaceReadyHook = (entry) => {
    if (!entry || entry.__koWorldHotfixPatched) return false;
    entry.fn = async function dnd5eKoHybridWorldHotfixReady() {
      return initializeHotfix();
    };
    entry.once = true;
    entry.__koWorldHotfixPatched = true;
    return true;
  };

  const patchExistingReadyHooks = () => {
    const readyHooks = Hooks?.events?.ready;
    if (!Array.isArray(readyHooks)) return false;
    let patched = false;
    for (const entry of readyHooks) {
      if (isTargetReadyHook(entry?.fn)) patched = replaceReadyHook(entry) || patched;
    }
    return patched;
  };

  const patchRegistration = () => {
    if (Hooks.__koWorldHotfixRegistrationPatched) return;
    Hooks.__koWorldHotfixRegistrationPatched = true;

    const originalOnce = Hooks.once.bind(Hooks);
    const originalOn = Hooks.on.bind(Hooks);

    Hooks.once = function patchedOnce(hook, fn, ...rest) {
      if (hook === "ready" && isTargetReadyHook(fn)) {
        return originalOnce(hook, async function dnd5eKoHybridWorldHotfixReady() {
          return initializeHotfix();
        }, ...rest);
      }
      return originalOnce(hook, fn, ...rest);
    };

    Hooks.on = function patchedOn(hook, fn, ...rest) {
      if (hook === "ready" && isTargetReadyHook(fn)) {
        return originalOn(hook, async function dnd5eKoHybridWorldHotfixReady() {
          return initializeHotfix();
        }, ...rest);
      }
      return originalOn(hook, fn, ...rest);
    };
  };

  patchRegistration();
  patchExistingReadyHooks();
  Hooks.once("init", () => patchExistingReadyHooks());
  Hooks.once("setup", () => patchExistingReadyHooks());
  Hooks.once("ready", () => {
    if (!HOTFIX_STATE.initialized && !HOTFIX_STATE.initialising) initializeHotfix().catch(() => {});
  });
})();
