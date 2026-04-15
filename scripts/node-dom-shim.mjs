if (typeof document === "undefined" || typeof NodeFilter === "undefined") {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  const { window } = dom;

  globalThis.window ??= window;
  globalThis.document ??= window.document;
  globalThis.Node ??= window.Node;
  globalThis.NodeFilter ??= window.NodeFilter;
  globalThis.HTMLElement ??= window.HTMLElement;
  globalThis.DocumentFragment ??= window.DocumentFragment;
}
