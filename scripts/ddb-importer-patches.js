const MODULE_ID = "dnd5e-ko-hybrid";
const DDB_IMPORTER_ID = "ddb-importer";
const SUMMON_PATCH_TARGETS = ["getClairvoyance", "getArcaneEyes", "getFaithfulHound"];

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const toCamelCase = (value) =>
  String(value ?? "")
    .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part, index) => {
      const lower = part.toLowerCase();
      return index === 0 ? lower : lower[0].toUpperCase() + lower.slice(1);
    })
    .join("");

const buildConditionKeys = (conditionName) => {
  const normalized = normalize(conditionName);
  const compact = normalized.replace(/\s+/g, "");
  const camel = normalize(toCamelCase(conditionName));
  return new Set([normalized, compact, camel].filter(Boolean));
};

const isSystemCondition = (effect) => {
  const id = String(effect?._id ?? effect?.id ?? "");
  return id.startsWith("dnd5e");
};

const matchesConditionKey = (effect, keys) => {
  const fields = [
    effect?.name,
    effect?.label,
    effect?.id,
    effect?._id,
    ...(Array.isArray(effect?.statuses) ? effect.statuses : [])
  ];

  return fields
    .filter(Boolean)
    .map((value) => normalize(value))
    .some((value) => keys.has(value) || keys.has(value.replace(/\s+/g, "")));
};

const getDdbImporterApi = () => game.modules.get(DDB_IMPORTER_ID)?.api ?? globalThis.DDBImporter ?? null;
const hasCustomProxyConfigured = () =>
  Boolean(game.settings.get(DDB_IMPORTER_ID, "custom-proxy") && game.settings.get(DDB_IMPORTER_ID, "api-endpoint"));

const enableMonsterMunchButton = (htmlOrRoot) => {
  if (!hasCustomProxyConfigured()) return false;

  const root = htmlOrRoot?.[0] instanceof HTMLElement ? htmlOrRoot[0] : htmlOrRoot;
  if (!(root instanceof HTMLElement)) return false;

  const button = root.querySelector("#munch-monsters-start");
  if (!(button instanceof HTMLButtonElement)) return false;

  button.disabled = false;
  if (button.textContent?.includes("Patreon Supporters")) {
    button.textContent = "Monster Munch (Custom Proxy)";
  }

  return true;
};

const patchFindCondition = (helper, api) => {
  if (typeof helper?.findCondition !== "function" || helper.findCondition.__koHybridPatched) return false;

  const originalFindCondition = helper.findCondition.bind(helper);
  const patchedFindCondition = function ({ conditionName, forceSystemCondition = false } = {}) {
    if (!conditionName) return null;

    try {
      const directMatch = originalFindCondition({ conditionName, forceSystemCondition });
      if (directMatch) return directMatch;
    } catch (error) {
      console.warn(`${MODULE_ID} | DDB Importer condition lookup failed for ${conditionName}, falling back`, error);
    }

    const keys = buildConditionKeys(conditionName);
    const candidates = (Array.isArray(CONFIG.statusEffects) ? CONFIG.statusEffects : []).filter((effect) => {
      if (!matchesConditionKey(effect, keys)) return false;
      return !forceSystemCondition || isSystemCondition(effect);
    });

    return candidates.find((effect) => isSystemCondition(effect)) ?? candidates[0] ?? null;
  };

  patchedFindCondition.__koHybridPatched = true;
  patchedFindCondition.__koHybridOriginal = originalFindCondition;
  helper.findCondition = patchedFindCondition;

  if (api?.EffectHelper) {
    api.EffectHelper.findCondition = patchedFindCondition;
  }

  return true;
};

const patchSummonHelper = (summons, key) => {
  const original = summons?.[key];
  if (typeof original !== "function" || original.__koHybridPatched) return false;

  const wrapped = async (...args) => {
    try {
      return await original(...args);
    } catch (error) {
      const message = String(error?.message ?? "");
      if (message.includes("reading 'id'") || message.includes("reading \"id\"")) {
        console.warn(`${MODULE_ID} | DDB Importer ${key} fallback activated`, error);
        return {};
      }
      throw error;
    }
  };

  wrapped.__koHybridPatched = true;
  wrapped.__koHybridOriginal = original;
  summons[key] = wrapped;
  return true;
};

export function installDdbImporterPatches({ debug = false } = {}) {
  const api = getDdbImporterApi();
  const helper = api?.lib?.DDBEffectHelper;
  const summons = api?.lib?.DDBSummonsInterface;
  let muncherHookInstalled = false;

  if (!globalThis.__dnd5eKoHybridMonsterMunchHookInstalled) {
    Hooks.on("renderDDBMuncher", (_app, html) => {
      enableMonsterMunchButton(html);
    });
    globalThis.__dnd5eKoHybridMonsterMunchHookInstalled = true;
    muncherHookInstalled = true;
  }

  const liveRoot = document.getElementById("ddb-importer-monsters");
  if (liveRoot) enableMonsterMunchButton(liveRoot);
  if (!helper || !summons) return muncherHookInstalled;

  const helperPatched = patchFindCondition(helper, api);
  const summonPatched = SUMMON_PATCH_TARGETS.map((key) => patchSummonHelper(summons, key)).some(Boolean);

  if ((helperPatched || summonPatched || muncherHookInstalled) && debug) {
    console.info(`${MODULE_ID} | Installed DDB Importer compatibility patches`, {
      helperPatched,
      summonPatched,
      muncherHookInstalled
    });
  }

  return helperPatched || summonPatched || muncherHookInstalled;
}
