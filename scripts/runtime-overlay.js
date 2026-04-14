import { MODULE_ID } from "./translation-store.js";

const DESCRIPTION_SELECTORS = [
  ".editor-content",
  "[data-tab='description'] .tab-body",
  "[data-tab='description'] .editor",
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
  }

  rerenderOpenApplications() {
    Object.values(ui.windows).forEach((app) => {
      try {
        app.render(false);
      } catch (error) {
        console.warn(`${MODULE_ID} | Failed to rerender`, app, error);
      }
    });
  }

  #enabled() {
    return game.settings.get(MODULE_ID, "enable-runtime-overlay");
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

  #applyNameInput(root, name) {
    root.querySelectorAll("input[name='name']").forEach((input) => {
      input.value = name;
    });
  }

  #translateDirectory(root, documents, translator) {
    root.querySelectorAll("[data-document-id]").forEach((row) => {
      const document = documents.get(row.dataset.documentId);
      const translation = translator(document);
      if (!translation?.name) return;
      const label = row.querySelector(".entry-name, h3, h4, .document-name");
      if (label) label.textContent = translation.name;
    });
    this.#decorateHtml(root);
  }

  #translateActorSheetItems(actor, root) {
    root.querySelectorAll("[data-item-id]").forEach((row) => {
      const item = actor.items.get(row.dataset.itemId);
      const translation = this.store.getItemTranslation(item);
      if (!translation?.name) return;
      const label = row.querySelector(".item-name, .item-name h4, .name, .rollable");
      if (label) label.textContent = translation.name;
    });
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
      this.#replaceHtml(html[0], this.store.translateHtmlString(translation.description, context));
    }
    this.#decorateHtml(html[0]);
  }

  #onRenderActorSheet(app, html) {
    if (!this.#enabled()) return;
    const translation = this.store.getActorTranslation(app.object);
    if (translation?.name) {
      setWindowTitle(html, translation.name);
      this.#applyNameInput(html[0], translation.name);
    }
    this.#translateActorSheetItems(app.object, html[0]);
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
      this.#replaceHtml(html[0], this.store.translateHtmlString(translation.text, context));
    }
    this.#decorateHtml(html[0]);
  }

  #onRenderChatMessage(app, html) {
    if (!this.#enabled()) return;
    this.#decorateHtml(html[0]);
  }
}
