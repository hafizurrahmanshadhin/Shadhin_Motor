import { bindFilterButtons, byId, onReady, openStaticModal } from "../admin-modules/shared.js";

const PAGE_NAME = window.SMAdmin?.page || document.body?.dataset.page || "";

export function initMediaPage() {
  if (PAGE_NAME !== "media") return;
  const page = byId("page-media");
  if (!page) return;

  bindFilterButtons({
    root: page,
    wrapSelector: "#mediaFilterWrap",
    itemSelector: ".media-card",
    emptySelector: "#mediaEmpty",
    statusAttr: "type"
  });

  page.querySelectorAll("[data-media-modal]").forEach(button => {
    button.addEventListener("click", () => {
      openStaticModal("moMedia", button.dataset.mediaModalTitle || "Upload Media");
    });
  });

  byId("moMedia")?.querySelector("[data-action='media-save']")?.addEventListener("click", () => {
    window.SMAdmin?.shell?.closeMo?.("moMedia");
    window.SMAdmin?.ui?.toast?.("success", "Media saved", "Static preview only");
  });
}

onReady(initMediaPage);
