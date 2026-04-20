import { MODULE_ID } from "./translation-store.js";

const DESCRIPTION_SELECTORS = [
  ".editor-content",
  "[data-tab='description'] .tab-body",
  "[data-tab='description'] .editor",
  "[data-tab='biography'] .tab-body",
  "[data-tab='biography'] .editor",
  "[data-tab='biography'] .editor-content",
  "[data-tab='details'] .biography .editor-content",
  ".journal-page-content",
  ".journal-sheet-container .pages-list .page"
];

const DESCRIPTION_PANEL_SELECTORS = [
  "[data-tab='description'] .editor",
  "[data-tab='description'] .tab-body",
  "[data-tab='biography'] .editor",
  "[data-tab='biography'] .tab-body",
  "[data-tab='details'] .biography",
  ".journal-page-content",
  ".journal-sheet-container .pages-list .page"
];

const LEAF_LABEL_SELECTORS = [
  ".item-name h4",
  ".item-name .name",
  ".item-name a",
  ".entry-name",
  ".document-name",
  ".name h4",
  ".name a",
  ".rollable h4",
  "h4",
  "h3",
  "a",
  "span"
];

const TRANSLATION_PANEL_ATTR = "data-dnd5e-ko-hybrid-panel";
const TRANSLATION_PANEL_HEADING = "한국어 번역";

const normalizeText = (value = "") => String(value ?? "").replace(/\s+/gu, " ").trim();
const normalizeHtmlText = (value = "") => {
  const template = document.createElement("template");
  template.innerHTML = String(value ?? "");
  return normalizeText(template.content.textContent ?? "");
};

const extractItemDescription = (item) => item?.system?.description?.value ?? item?.system?.description ?? "";
const extractActorDescription = (actor) =>
  actor?.system?.details?.biography?.value
  ?? actor?.system?.details?.description
  ?? actor?.system?.description?.value
  ?? "";
const extractJournalPageText = (page) => page?.text?.content ?? "";

const setWindowTitle = (htmlOrRoot, name) => {
  const root = htmlOrRoot instanceof HTMLElement ? htmlOrRoot : htmlOrRoot?.[0];
  root?.closest(".window-app")?.querySelector(".window-title")?.replaceChildren(name);
};

const uniqueTargets = (root) => {
  const nodes = new Set();
  for (const selector of DESCRIPTION_SELECTORS) {
    root.querySelectorAll(selector).forEach((node) => nodes.add(node));
  }
  return [...nodes];
};

const findLeafLabelTarget = (root, selectors = LEAF_LABEL_SELECTORS) => {
  if (!(root instanceof HTMLElement)) return null;

  for (const selector of selectors) {
    const candidates = root.matches?.(selector) ? [root, ...root.querySelectorAll(selector)] : root.querySelectorAll(selector);
    for (const node of candidates) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.matches("input, textarea, select")) continue;
      if (node.querySelector("img, svg, video")) continue;
      const text = normalizeText(node.textContent);
      if (!text) continue;
      return node;
    }
  }

  return null;
};

const ITEM_PRESENTATION_PATCHES = {
  installed: false,
  overlay: null
};

const ORIGINAL_GET_CHAT_DATA = Symbol(`${MODULE_ID}.originalGetChatData`);
const ORIGINAL_RICH_TOOLTIP = Symbol(`${MODULE_ID}.originalRichTooltip`);
const ORIGINAL_CREATE_SCROLL = Symbol(`${MODULE_ID}.originalCreateScrollFromSpell`);

const overlayEnabled = () => {
  try {
    return !!game?.settings?.get(MODULE_ID, "enable-runtime-overlay");
  } catch {
    return false;
  }
};

const getOverlayStore = () => ITEM_PRESENTATION_PATCHES.overlay?.store ?? null;

const getItemContext = (item) => ({
  relativeTo: item,
  rollData: item?.getRollData?.()
    ?? item?.parent?.getRollData?.()
    ?? item?.actor?.getRollData?.()
    ?? null
});

const patchChatDataResult = (item, result) => {
  const store = getOverlayStore();
  if (!overlayEnabled() || !store || !result) return result;

  const translation = store.getItemTranslation?.(item);
  if (!translation?.name && !translation?.description) return result;

  if (translation.name && typeof result.name === "string") {
    result.name = translation.name;
  }

  if (translation.description) {
    const translated = store.translateHtmlStringSync(translation.description, getItemContext(item));
    if (typeof result.description === "string") {
      result.description = translated;
    } else if (result.description && typeof result.description === "object") {
      if (typeof result.description.value === "string") result.description.value = translated;
      else if (typeof result.description.content === "string") result.description.content = translated;
    }
  }

  return result;
};

const patchRichTooltipResult = (item, result) => {
  const store = getOverlayStore();
  if (!overlayEnabled() || !store || !result || typeof result.content !== "string") return result;

  const translation = store.getItemTranslation?.(item);
  if (!translation?.name && !translation?.description) return result;

  const template = document.createElement("template");
  template.innerHTML = result.content;
  const root = template.content.firstElementChild ?? template.content;

  if (translation.name) {
    root.querySelector(".title")?.replaceChildren(translation.name);
    const image = root.querySelector("img[alt]");
    if (image) image.alt = translation.name;
  }

  if (translation.description) {
    const description = root.querySelector(".description");
    if (description) {
      description.innerHTML = store.translateHtmlStringSync(translation.description, getItemContext(item));
    }
  }

  store.translateContentLinks(root);
  result.content = template.innerHTML;
  return result;
};

const getPrototypeChain = (prototype) => {
  const chain = [];
  for (let current = prototype; current && current !== Object.prototype; current = Object.getPrototypeOf(current)) {
    chain.push(current);
  }
  return chain;
};

const getConstructorChain = (constructor) => {
  const chain = [];
  for (let current = constructor; typeof current === "function" && current !== Function.prototype; current = Object.getPrototypeOf(current)) {
    chain.push(current);
  }
  return chain;
};

const installItemPresentationPatches = () => {
  if (ITEM_PRESENTATION_PATCHES.installed) return;

  const itemConstructors = new Set([
    globalThis.CONFIG?.Item?.documentClass,
    globalThis.game?.dnd5e?.documents?.Item5e,
    globalThis.getDocumentClass?.("Item"),
    globalThis.Item
  ].filter((value) => typeof value === "function"));

  if (!itemConstructors.size) return;

  for (const itemConstructor of itemConstructors) {
    for (const prototype of getPrototypeChain(itemConstructor.prototype)) {
      if (Object.prototype.hasOwnProperty.call(prototype, "getChatData")
        && typeof prototype.getChatData === "function"
        && !prototype[ORIGINAL_GET_CHAT_DATA]) {
        prototype[ORIGINAL_GET_CHAT_DATA] = prototype.getChatData;
        prototype.getChatData = function getChatDataPatched(...args) {
          const result = prototype[ORIGINAL_GET_CHAT_DATA].apply(this, args);
          if (typeof result?.then === "function") {
            return result.then((value) => patchChatDataResult(this, value));
          }
          return patchChatDataResult(this, result);
        };
      }

      if (Object.prototype.hasOwnProperty.call(prototype, "richTooltip")
        && typeof prototype.richTooltip === "function"
        && !prototype[ORIGINAL_RICH_TOOLTIP]) {
        prototype[ORIGINAL_RICH_TOOLTIP] = prototype.richTooltip;
        prototype.richTooltip = function richTooltipPatched(...args) {
          const result = prototype[ORIGINAL_RICH_TOOLTIP].apply(this, args);
          if (typeof result?.then === "function") {
            return result.then((value) => patchRichTooltipResult(this, value));
          }
          return patchRichTooltipResult(this, result);
        };
      }
    }

    for (const constructor of getConstructorChain(itemConstructor)) {
      if (!Object.prototype.hasOwnProperty.call(constructor, "createScrollFromSpell")
        || typeof constructor.createScrollFromSpell !== "function"
        || constructor[ORIGINAL_CREATE_SCROLL]) {
        continue;
      }

      constructor[ORIGINAL_CREATE_SCROLL] = constructor.createScrollFromSpell;
      constructor.createScrollFromSpell = async function createScrollFromSpellPatched(spell, ...args) {
        const result = await constructor[ORIGINAL_CREATE_SCROLL].call(this, spell, ...args);
        const store = getOverlayStore();
        if (!overlayEnabled() || !store || !result) return result;

        const translation = store.getItemTranslation?.(spell);
        if (!translation?.description) return result;

        const translated = store.translateHtmlStringSync(translation.description, getItemContext(spell));
        if (typeof result?.system?.description?.value === "string") {
          result.system.description.value = translated;
        } else if (typeof result?.data?.description?.value === "string") {
          result.data.description.value = translated;
        } else if (typeof result?.system?.description === "string") {
          result.system.description = translated;
        }

        return result;
      };
    }
  }

  ITEM_PRESENTATION_PATCHES.installed = true;
};

export class RuntimeOverlay {
  constructor(store) {
    this.store = store;
    this.boundHooks = false;
    this.pendingActorSheetPasses = new WeakMap();
    this.pendingHtmlRenders = new WeakMap();
    this.pendingDeferredPasses = new WeakMap();
    this.pendingStoreRefresh = null;
  }

  activate() {
    if (this.boundHooks) return;
    this.boundHooks = true;
    ITEM_PRESENTATION_PATCHES.overlay = this;
    installItemPresentationPatches();
    for (const delay of [250, 1000, 3000, 10000]) {
      setTimeout(() => installItemPresentationPatches(), delay);
    }

    Hooks.on("renderItemDirectory", this.#onRenderItemDirectory.bind(this));
    Hooks.on("renderActorDirectory", this.#onRenderActorDirectory.bind(this));
    Hooks.on("renderJournalDirectory", this.#onRenderJournalDirectory.bind(this));
    Hooks.on("renderCompendium", this.#onRenderCompendium.bind(this));
    Hooks.on("renderItemSheet", this.#onRenderItemSheet.bind(this));
    Hooks.on("renderActorSheet", this.#onRenderActorSheet.bind(this));
    Hooks.on("renderJournalSheet", this.#onRenderJournalSheet.bind(this));
    Hooks.on("renderJournalPageSheet", this.#onRenderJournalPageSheet.bind(this));
    Hooks.on("renderChatMessage", this.#onRenderChatMessage.bind(this));
    Hooks.on("createItem", this.#onDocumentMutation.bind(this));
    Hooks.on("updateItem", this.#onDocumentMutation.bind(this));
    Hooks.on("createActor", this.#onDocumentMutation.bind(this));
    Hooks.on("updateActor", this.#onDocumentMutation.bind(this));
    Hooks.on("createJournalEntry", this.#onDocumentMutation.bind(this));
    Hooks.on("updateJournalEntry", this.#onDocumentMutation.bind(this));
    Hooks.on("createJournalEntryPage", this.#onDocumentMutation.bind(this));
    Hooks.on("updateJournalEntryPage", this.#onDocumentMutation.bind(this));
    Hooks.on("createFolder", this.#onDocumentMutation.bind(this));
    Hooks.on("updateFolder", this.#onDocumentMutation.bind(this));
    Hooks.on("deleteFolder", this.#onDocumentMutation.bind(this));
    Hooks.on("ddb-importer.characterProcessDataComplete", this.#onDocumentMutation.bind(this));

    for (const hookName of [
      "ddb-importer.itemsCompendiumUpdateComplete",
      "ddb-importer.spellsCompendiumUpdateComplete",
      "ddb-importer.featuresCompendiumUpdateComplete",
      "ddb-importer.classCompendiumUpdateComplete",
      "ddb-importer.summonsCompendiumUpdateComplete",
      "ddb-importer.vehiclesCompendiumUpdateComplete",
      "ddb-importer.monsterAddToCompendiumComplete"
    ]) {
      Hooks.on(hookName, this.#onImporterCompendiumMutation.bind(this));
    }
  }

  rerenderOpenApplications() {
    Object.values(ui.windows).forEach((app) => {
      try {
        app.render(false);
      } catch (error) {
        console.warn(`${MODULE_ID} | Failed to rerender`, app, error);
      }
    });

    this.#refreshSidebarTabs();
  }

  #enabled() {
    return game.settings.get(MODULE_ID, "enable-runtime-overlay");
  }

  #rerenderApplications(predicate) {
    Object.values(ui.windows).forEach((app) => {
      try {
        if (predicate(app)) app.render(false);
      } catch (error) {
        console.warn(`${MODULE_ID} | Failed to rerender`, app, error);
      }
    });
  }

  #refreshSidebarForDocument(document) {
    const name = document?.documentName ?? "";
    if (name === "Item" || document?.parent?.documentName === "Actor") {
      const itemsRoot = ui.sidebar?.tabs?.items?.element?.[0];
      if (itemsRoot) {
        this.#translateDirectory(itemsRoot, game.items, (item) => this.store.getItemTranslation(item));
      }
    }

    if (name === "Actor" || document?.parent?.documentName === "Actor") {
      const actorsRoot = ui.sidebar?.tabs?.actors?.element?.[0];
      if (actorsRoot) {
        this.#translateDirectory(actorsRoot, game.actors, (actor) => this.store.getActorTranslation(actor));
      }
    }

    if (name === "JournalEntry" || name === "JournalEntryPage" || name === "Folder") {
      const journalRoot = ui.sidebar?.tabs?.journal?.element?.[0];
      if (journalRoot) {
        this.#translateFolderLabels(journalRoot);
        this.#decorateHtml(journalRoot);
      }
    }
  }

  #onDocumentMutation(document) {
    if (!this.#enabled()) return;
    queueMicrotask(() => {
      const targetUuid = document?.uuid ?? null;
      const parentUuid = document?.parent?.uuid ?? null;

      this.#rerenderApplications((app) => {
        const object = app?.object ?? app?.document ?? null;
        const objectUuid = object?.uuid ?? null;
        if (targetUuid && objectUuid === targetUuid) return true;
        if (parentUuid && objectUuid === parentUuid) return true;
        return false;
      });

      this.#refreshSidebarForDocument(document);
    });
  }

  #onImporterCompendiumMutation() {
    if (!this.#enabled()) return;
    this.#scheduleStoreRefresh();
  }

  #scheduleStoreRefresh() {
    if (this.pendingStoreRefresh) clearTimeout(this.pendingStoreRefresh);
    this.pendingStoreRefresh = setTimeout(async () => {
      this.pendingStoreRefresh = null;
      try {
        if (typeof this.store.refreshCompendiums === "function") {
          await this.store.refreshCompendiums();
        } else {
          await this.store.refresh();
        }
      } catch (error) {
        console.warn(`${MODULE_ID} | Failed to refresh translation store after importer update`, error);
      }
      this.#rerenderApplications((app) => Boolean(app?.collection ?? app?.object ?? app?.document));
      this.#refreshSidebarTabs();
    }, 250);
  }

  #refreshSidebarTabs() {
    if (!this.#enabled()) return;

    const itemsRoot = ui.sidebar?.tabs?.items?.element?.[0];
    if (itemsRoot) {
      this.#translateDirectory(itemsRoot, game.items, (item) => this.store.getItemTranslation(item));
    }

    const actorsRoot = ui.sidebar?.tabs?.actors?.element?.[0];
    if (actorsRoot) {
      this.#translateDirectory(actorsRoot, game.actors, (actor) => this.store.getActorTranslation(actor));
    }

    const journalRoot = ui.sidebar?.tabs?.journal?.element?.[0];
    if (journalRoot) {
      this.#translateFolderLabels(journalRoot);
      this.#decorateHtml(journalRoot);
    }
  }

  #decorateHtml(root) {
    if (!root || !this.#enabled()) return;
    this.store.translateContentLinks(root);
  }

  #findDescriptionPanelTarget(root) {
    if (!(root instanceof HTMLElement)) return null;
    for (const selector of DESCRIPTION_PANEL_SELECTORS) {
      const target = root.querySelector(selector);
      if (target instanceof HTMLElement) return target;
    }
    return uniqueTargets(root).find((node) => node instanceof HTMLElement) ?? null;
  }

  #clearTranslationPanels(root, key) {
    if (!(root instanceof HTMLElement)) return;
    root.querySelectorAll(`[${TRANSLATION_PANEL_ATTR}]`).forEach((panel) => {
      if (!key || panel.getAttribute(TRANSLATION_PANEL_ATTR) === key) panel.remove();
    });
  }

  #upsertTranslationPanel(root, key, translatedHtml, originalHtml = "") {
    if (!(root instanceof HTMLElement)) return;
    this.#clearTranslationPanels(root, key);

    if (!translatedHtml) return;
    if (normalizeHtmlText(originalHtml) === normalizeHtmlText(translatedHtml)) return;

    const target = this.#findDescriptionPanelTarget(root);
    if (!(target instanceof HTMLElement)) return;

    const panel = document.createElement("section");
    panel.className = "dnd5e-ko-hybrid-panel";
    panel.setAttribute(TRANSLATION_PANEL_ATTR, key);
    panel.innerHTML = `
      <div class="dnd5e-ko-hybrid-panel__label">${TRANSLATION_PANEL_HEADING}</div>
      <div class="dnd5e-ko-hybrid-panel__content">${translatedHtml}</div>
    `;

    target.insertAdjacentElement("afterend", panel);
    this.#decorateHtml(panel);
  }

  async #applyTranslatedHtml(root, translatedHtmlPromise, { key = "description", originalHtml = "" } = {}) {
    if (!root || !this.#enabled()) return;

    const token = (this.pendingHtmlRenders.get(root) ?? 0) + 1;
    this.pendingHtmlRenders.set(root, token);

    let translatedHtml = translatedHtmlPromise;
    if (typeof translatedHtml?.then === "function") {
      try {
        translatedHtml = await translatedHtml;
      } catch (error) {
        console.warn(`${MODULE_ID} | Failed to translate sheet HTML`, error);
        return;
      }
    }

    if (!translatedHtml || !root.isConnected) return;
    if (this.pendingHtmlRenders.get(root) !== token) return;

    this.#upsertTranslationPanel(root, key, translatedHtml, originalHtml);
  }

  #applyStaticName(root, name) {
    root.querySelectorAll(".document-name, .sheet-header .document-name").forEach((node) => {
      if (node instanceof HTMLInputElement) return;
      node.textContent = name;
    });
  }

  #scheduleDeferredPass(root, callback, delays = [150, 600, 1500]) {
    const existing = this.pendingDeferredPasses.get(root);
    if (existing) existing.forEach((handle) => clearTimeout(handle));

    const handles = delays.map((delay) => setTimeout(() => {
      if (!root?.isConnected || !this.#enabled()) return;
      callback();
    }, delay));

    this.pendingDeferredPasses.set(root, handles);
  }

  #translateFolderLabels(root) {
    root.querySelectorAll(".folder .folder-name, .folder .folder-header h3").forEach((node) => {
      const translated = this.store.getPlainTextLabel(node.textContent?.trim());
      if (translated) node.textContent = translated;
    });
  }

  #translateDirectory(root, documents, translator) {
    if (!root || !this.#enabled()) return;
    root.querySelectorAll("[data-document-id]").forEach((row) => {
      const document = documents.get(row.dataset.documentId);
      const translation = translator(document);
      if (!translation?.name) return;
      const label = findLeafLabelTarget(row, [".entry-name", ".document-name", "h4", "h3", "a", "span"]);
      if (label) label.textContent = translation.name;
    });
    this.#translateFolderLabels(root);
    this.#decorateHtml(root);
  }

  #translateActorSheetItems(actor, root) {
    root.querySelectorAll("[data-item-id]").forEach((row) => {
      const item = actor.items.get(row.dataset.itemId);
      const translation = this.store.getItemTranslation(item);
      if (!translation?.name) return;
      const label = findLeafLabelTarget(row, [".item-name h4", ".item-name .name", ".item-name a", ".name h4", ".name a", ".rollable h4", "h4", "a", "span"]);
      if (label) label.textContent = translation.name;
    });
  }

  #scheduleActorSheetPass(actor, root) {
    const existing = this.pendingActorSheetPasses.get(root);
    if (existing) clearTimeout(existing);

    const handle = setTimeout(() => {
      this.pendingActorSheetPasses.delete(root);
      if (!root?.isConnected || !this.#enabled()) return;
      this.#translateActorSheetItems(actor, root);
      this.#translateFolderLabels(root);
      this.#decorateHtml(root);
    }, 50);

    this.pendingActorSheetPasses.set(root, handle);
  }

  #translateCompendiumEntries(app, root) {
    const pack = app.collection;
    if (!pack) return;

    const packLabel = this.store.getCompendiumPackLabel(pack.collection);
      if (packLabel) setWindowTitle(root, packLabel);

    root.querySelectorAll("[data-document-id], [data-entry-id]").forEach((row) => {
      const entryId = row.dataset.documentId ?? row.dataset.entryId;
      const entry = pack.index?.get?.(entryId) ?? [...(pack.index?.values?.() ?? [])].find((candidate) => candidate._id === entryId);
      if (!entry) return;
      const translation = this.store._getCompendiumEntry(pack.collection, entry.name);
      if (!translation?.name) return;
      const label = findLeafLabelTarget(row, [".entry-name", ".document-name", "h4", "h3", "a", "span"]);
      if (label) label.textContent = translation.name;
    });

    root.querySelectorAll(".folder .folder-name, .folder .folder-header h3").forEach((node) => {
      const translated = this.store.getCompendiumFolderLabel(pack.collection, node.textContent.trim());
      if (translated) node.textContent = translated;
    });
  }

  #onRenderItemDirectory(app, html) {
    this.#translateDirectory(html[0], game.items, (item) => this.store.getItemTranslation(item));
  }

  #onRenderActorDirectory(app, html) {
    this.#translateDirectory(html[0], game.actors, (actor) => this.store.getActorTranslation(actor));
  }

  #onRenderJournalDirectory(app, html) {
    if (!this.#enabled()) return;
    this.#translateFolderLabels(html[0]);
    this.#decorateHtml(html[0]);
  }

  #onRenderCompendium(app, html) {
    if (!this.#enabled()) return;
    this.#translateCompendiumEntries(app, html[0]);
    this.#decorateHtml(html[0]);
  }

  #onRenderItemSheet(app, html) {
    if (!this.#enabled()) return;
    const root = html[0];
    const translation = this.store.getItemTranslation(app.object);
    const context = {
      relativeTo: app.object,
      rollData: app.object?.getRollData?.() ?? null
    };
    const apply = () => {
      if (translation?.name) {
        setWindowTitle(html, translation.name);
        this.#applyStaticName(root, translation.name);
      }
      if (translation?.description) {
        void this.#applyTranslatedHtml(root, this.store.translateHtmlString(translation.description, context), {
          key: "item-description",
          originalHtml: extractItemDescription(app.object)
        });
      } else {
        this.#clearTranslationPanels(root, "item-description");
      }
      this.#decorateHtml(root);
    };
    apply();
    this.#scheduleDeferredPass(root, apply, [120, 450]);
  }

  #onRenderActorSheet(app, html) {
    if (!this.#enabled()) return;
    const translation = this.store.getActorTranslation(app.object);
    const context = {
      relativeTo: app.object,
      rollData: app.object?.getRollData?.() ?? null
    };
    if (translation?.name) {
      setWindowTitle(html, translation.name);
      this.#applyStaticName(html[0], translation.name);
    }
    if (translation?.description) {
      void this.#applyTranslatedHtml(html[0], this.store.translateHtmlString(translation.description, context), {
        key: "actor-description",
        originalHtml: extractActorDescription(app.object)
      });
    } else {
      this.#clearTranslationPanels(html[0], "actor-description");
    }
    this.#translateActorSheetItems(app.object, html[0]);
    this.#translateFolderLabels(html[0]);
    this.#scheduleActorSheetPass(app.object, html[0]);
    this.#decorateHtml(html[0]);
  }

  #onRenderJournalSheet(app, html) {
    if (!this.#enabled()) return;
    this.#decorateHtml(html[0]);
  }

  #onRenderJournalPageSheet(app, html) {
    if (!this.#enabled()) return;
    const root = html[0];
    const translation = this.store.getJournalPageTranslation(app.object);
    const context = {
      relativeTo: app.object,
      rollData: app.object?.getRollData?.() ?? null
    };
    const apply = () => {
      if (translation?.name) {
        setWindowTitle(html, translation.name);
        this.#applyStaticName(root, translation.name);
      }
      if (translation?.text) {
        void this.#applyTranslatedHtml(root, this.store.translateHtmlString(translation.text, context), {
          key: "journal-page-text",
          originalHtml: extractJournalPageText(app.object)
        });
      } else {
        this.#clearTranslationPanels(root, "journal-page-text");
      }
      this.#decorateHtml(root);
    };
    apply();
    this.#scheduleDeferredPass(root, apply, [120, 450]);
  }

  #onRenderChatMessage(app, html) {
    if (!this.#enabled()) return;
    this.#decorateHtml(html[0]);
  }
}
