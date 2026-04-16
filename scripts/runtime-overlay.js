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

export class RuntimeOverlay {
  constructor(store) {
    this.store = store;
    this.boundHooks = false;
    this.actorSheetObservers = new WeakMap();
    this.pendingActorSheetPasses = new WeakMap();
    this.pendingHtmlRenders = new WeakMap();
    this.pendingStoreRefresh = null;
  }

  activate() {
    if (this.boundHooks) return;
    this.boundHooks = true;

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

  #onDocumentMutation() {
    if (!this.#enabled()) return;
    queueMicrotask(() => this.rerenderOpenApplications());
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
      this.rerenderOpenApplications();
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

  #replaceHtml(root, translatedHtml) {
    if (!translatedHtml) return;
    for (const target of uniqueTargets(root)) {
      if (!target.classList.contains("editor-content") && target.children.length && target.querySelector(".editor-content")) continue;
      target.innerHTML = translatedHtml;
    }
  }

  async #applyTranslatedHtml(root, translatedHtmlPromise) {
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

    this.#replaceHtml(root, translatedHtml);
    this.#decorateHtml(root);
  }

  #applyNameInput(root, name) {
    root.querySelectorAll("input[name='name']").forEach((input) => {
      input.value = name;
    });
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
      const label = row.querySelector(".entry-name, h3, h4, .document-name");
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
      const label = row.querySelector(".item-name, .item-name h4, .item-name a, .name, .name a, .rollable, h4");
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

  #ensureActorSheetObserver(actor, root) {
    if (!root || this.actorSheetObservers.has(root)) return;
    const observer = new MutationObserver(() => this.#scheduleActorSheetPass(actor, root));
    observer.observe(root, { childList: true, subtree: true });
    this.actorSheetObservers.set(root, observer);
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
      const label = row.querySelector(".entry-name, h3, h4, .document-name");
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
    const translation = this.store.getItemTranslation(app.object);
    const context = {
      relativeTo: app.object,
      rollData: app.object?.getRollData?.() ?? null
    };
    if (translation?.name) {
      setWindowTitle(html, translation.name);
      this.#applyNameInput(html[0], translation.name);
    }
    if (translation?.description) {
      void this.#applyTranslatedHtml(html[0], this.store.translateHtmlString(translation.description, context));
    }
    this.#decorateHtml(html[0]);
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
      this.#applyNameInput(html[0], translation.name);
    }
    if (translation?.description) {
      void this.#applyTranslatedHtml(html[0], this.store.translateHtmlString(translation.description, context));
    }
    this.#translateActorSheetItems(app.object, html[0]);
    this.#translateFolderLabels(html[0]);
    this.#ensureActorSheetObserver(app.object, html[0]);
    this.#scheduleActorSheetPass(app.object, html[0]);
    this.#decorateHtml(html[0]);
  }

  #onRenderJournalSheet(app, html) {
    if (!this.#enabled()) return;
    this.#decorateHtml(html[0]);
  }

  #onRenderJournalPageSheet(app, html) {
    if (!this.#enabled()) return;
    const translation = this.store.getJournalPageTranslation(app.object);
    const context = {
      relativeTo: app.object,
      rollData: app.object?.getRollData?.() ?? null
    };
    if (translation?.name) {
      setWindowTitle(html, translation.name);
      this.#applyNameInput(html[0], translation.name);
    }
    if (translation?.text) {
      void this.#applyTranslatedHtml(html[0], this.store.translateHtmlString(translation.text, context));
    }
    this.#decorateHtml(html[0]);
  }

  #onRenderChatMessage(app, html) {
    if (!this.#enabled()) return;
    this.#decorateHtml(html[0]);
  }
}
