import { byId, onReady, openStaticModal } from "../admin-modules/shared.js";

const PAGE_NAME = window.SMAdmin?.page || document.body?.dataset.page || "";

function syncContentTabs(tabs, panels, key) {
  let hasPanel = false;

  panels.forEach(panel => {
    const active = panel.dataset.contentPanel === key;
    panel.hidden = !active;
    if (active) hasPanel = true;
  });

  const nextKey = hasPanel ? key : "sections";
  tabs.forEach(tab => {
    const active = tab.dataset.contentTab === nextKey;
    tab.classList.toggle("on", active);
    tab.setAttribute("aria-pressed", String(active));
  });

  if (!hasPanel && nextKey !== key) {
    panels.forEach(panel => {
      panel.hidden = panel.dataset.contentPanel !== nextKey;
    });
  }
}

function getInitialPanelKey(panels) {
  const hashKey = window.location.hash.replace(/^#/, "");
  if (hashKey && panels.some(panel => panel.dataset.contentPanel === hashKey)) return hashKey;
  return "sections";
}

export function initFrontendContentPage() {
  if (PAGE_NAME !== "frontend-content") return;
  const page = byId("page-frontend-content");
  if (!page) return;

  const tabs = Array.from(page.querySelectorAll("[data-content-tab]"));
  const panels = Array.from(page.querySelectorAll("[data-content-panel]"));

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const key = tab.dataset.contentTab || "sections";
      syncContentTabs(tabs, panels, key);
      if (history.replaceState) history.replaceState(null, "", `#${key}`);
    });
  });

  page.addEventListener("click", event => {
    const edit = event.target.closest("[data-content-edit]");
    if (edit) {
      openStaticModal("moContentBlock", edit.dataset.modalTitle || "Edit Content Block");
      const keyField = byId("contentBlockKey");
      if (keyField && edit.dataset.contentKey) keyField.value = edit.dataset.contentKey;
      return;
    }

    const publish = event.target.closest("[data-action='content-publish']");
    if (publish) {
      window.SMAdmin?.ui?.toast?.("info", "Publish flow ready", "Laravel can persist section order, copy, media and SEO later.");
    }
  });

  byId("moContentBlock")?.querySelector("[data-action='content-save']")?.addEventListener("click", () => {
    window.SMAdmin?.shell?.closeMo?.("moContentBlock");
    window.SMAdmin?.ui?.toast?.("success", "Content block saved", "Static preview only");
  });

  syncContentTabs(tabs, panels, getInitialPanelKey(panels));
}

onReady(initFrontendContentPage);
