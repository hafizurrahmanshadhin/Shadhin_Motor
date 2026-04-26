import { bindFilterButtons, byId, onReady, openStaticModal } from "../admin-modules/shared.js";

const PAGE_NAME = window.SMAdmin?.page || document.body?.dataset.page || "";

export function initReviewsPage() {
  if (PAGE_NAME !== "reviews") return;
  const page = byId("page-reviews");
  if (!page) return;

  bindFilterButtons({
    root: page,
    wrapSelector: "#reviewFilterWrap",
    itemSelector: ".review-card",
    emptySelector: "#reviewsEmpty"
  });

  page.addEventListener("click", event => {
    const action = event.target.closest("[data-review-action]");
    if (!action) return;

    const card = action.closest(".review-card");
    const next = action.dataset.reviewAction;

    if (next === "view") {
      openStaticModal("moReview", action.dataset.modalTitle || "Review Details");
      return;
    }

    if (!card || !["approved", "rejected", "pending"].includes(next)) return;
    window.SMAdmin?.ui?.toast?.("info", "Moderation flow ready", "Static HTML data was not changed. Connect this button to a Laravel action later.");
  });
}

onReady(initReviewsPage);
