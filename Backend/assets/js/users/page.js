import { bindTableSearch, byId, onReady, openStaticModal } from "../admin-modules/shared.js";

const PAGE_NAME = window.SMAdmin?.page || document.body?.dataset.page || "";

export function initUsersPage() {
  if (PAGE_NAME !== "users") return;
  const page = byId("page-users");
  if (!page) return;

  bindTableSearch(page, "#userSearch", "#usersTbody tr[data-user-row]", "#usersEmpty");

  page.querySelectorAll("[data-user-modal]").forEach(button => {
    button.addEventListener("click", () => {
      openStaticModal("moUser", button.dataset.userModalTitle || "User");
    });
  });

  byId("moUser")?.querySelector("[data-action='user-save']")?.addEventListener("click", () => {
    window.SMAdmin?.shell?.closeMo?.("moUser");
    window.SMAdmin?.ui?.toast?.("success", "User saved", "Static preview only");
  });
}

onReady(initUsersPage);
