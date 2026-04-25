const PAGE_NAME = window.SMAdmin?.page || window.PAGE || document.body?.dataset.page || "";

function byId(id) {
  return document.getElementById(id);
}

function setModalTitle(modalId, title) {
  const modal = byId(modalId);
  const titleEl = modal?.querySelector(".modal-title");
  if (titleEl && title) titleEl.textContent = title;
}

function resetModalFields(modalId) {
  const modal = byId(modalId);
  if (!modal) return;

  modal.querySelectorAll("input:not([type='hidden']):not([type='checkbox']):not([type='radio']), textarea").forEach(field => {
    field.value = "";
  });

  modal.querySelectorAll("select").forEach(select => {
    select.selectedIndex = 0;
  });

  modal.querySelectorAll("input[type='checkbox']").forEach(input => {
    input.checked = input.dataset.defaultChecked === "true";
  });
}

function openStaticModal(modalId, title) {
  resetModalFields(modalId);
  setModalTitle(modalId, title);
  window.openMo?.(modalId);
}

function currentStatus(row) {
  return String(row?.dataset.status || "all").trim().toLowerCase();
}

function bindFilterButtons({ wrapSelector, itemSelector, emptySelector, statusAttr = "status" }) {
  const wrap = document.querySelector(wrapSelector);
  if (!wrap) return;

  const apply = status => {
    const items = Array.from(document.querySelectorAll(itemSelector));
    let visible = 0;

    items.forEach(item => {
      const value = String(item.dataset[statusAttr] || "all").trim().toLowerCase();
      const show = status === "all" || value === status;
      item.hidden = !show;
      if (show) visible += 1;
    });

    const empty = document.querySelector(emptySelector);
    if (empty) empty.hidden = visible > 0;
  };

  wrap.querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
      wrap.querySelectorAll("[data-filter]").forEach(btn => btn.classList.toggle("on", btn === button));
      apply(String(button.dataset.filter || "all").toLowerCase());
    });
  });
}

function bindTableSearch(inputSelector, rowSelector, emptySelector) {
  const input = document.querySelector(inputSelector);
  if (!input) return;

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;

    document.querySelectorAll(rowSelector).forEach(row => {
      const show = !query || row.textContent.toLowerCase().includes(query);
      row.hidden = !show;
      if (show) visible += 1;
    });

    const empty = document.querySelector(emptySelector);
    if (empty) empty.hidden = visible > 0;
  });
}

function initReviewsPage() {
  if (PAGE_NAME !== "reviews") return;

  bindFilterButtons({
    wrapSelector: "#reviewFilterWrap",
    itemSelector: ".review-card",
    emptySelector: "#reviewsEmpty"
  });

  document.addEventListener("click", event => {
    const action = event.target.closest("[data-review-action]");
    if (!action) return;

    const card = action.closest(".review-card");
    const next = action.dataset.reviewAction;

    if (next === "view") {
      openStaticModal("moReview", action.dataset.modalTitle || "Review Details");
      return;
    }

    if (!card || !["approved", "rejected", "pending"].includes(next)) return;
    card.dataset.status = next;
    card.querySelector("[data-review-status]").textContent = next.charAt(0).toUpperCase() + next.slice(1);
    card.querySelector("[data-review-status]").className = `status-pill ${next}`;
    window.toast?.("success", "Review status updated", "Static preview only");
  });
}

function initFrontendContentPage() {
  if (PAGE_NAME !== "frontend-content") return;

  const tabs = Array.from(document.querySelectorAll("[data-content-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-content-panel]"));

  const showPanel = key => {
    tabs.forEach(tab => tab.classList.toggle("on", tab.dataset.contentTab === key));
    panels.forEach(panel => {
      panel.hidden = panel.dataset.contentPanel !== key;
    });
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => showPanel(tab.dataset.contentTab || "sections"));
  });

  document.addEventListener("click", event => {
    const edit = event.target.closest("[data-content-edit]");
    if (edit) {
      openStaticModal("moContentBlock", edit.dataset.modalTitle || "Edit Content Block");
      return;
    }

    const save = event.target.closest("[data-action='content-save']");
    if (save) {
      window.closeMo?.("moContentBlock");
      window.toast?.("success", "Content block saved", "Static preview only");
      return;
    }

    const publish = event.target.closest("[data-action='content-publish']");
    if (publish) {
      window.toast?.("info", "Publish flow ready", "Laravel can persist section order, copy, media and SEO later.");
    }
  });

  showPanel("sections");
}

function initRolesPage() {
  if (PAGE_NAME !== "roles") return;

  const roleModal = byId("moRole");
  const nameField = roleModal?.querySelector("[data-role-name-field]");
  const keyField = roleModal?.querySelector("[data-role-key-field]");
  const statusField = roleModal?.querySelector("[data-role-status-field]");
  const countEl = byId("permissionCount");
  const checks = Array.from(document.querySelectorAll("[data-role-permission]"));

  const syncCount = () => {
    const count = checks.filter(input => input.checked).length;
    if (countEl) countEl.textContent = String(count);
  };

  checks.forEach(input => input.addEventListener("change", syncCount));
  syncCount();

  document.querySelectorAll("[data-role-modal]").forEach(button => {
    button.addEventListener("click", () => {
      openStaticModal("moRole", button.dataset.roleModalTitle || "Create Role");

      const isEdit = Boolean(button.dataset.roleKey);
      if (nameField) nameField.value = button.dataset.roleName || "";
      if (keyField) {
        keyField.value = button.dataset.roleKey || "";
        keyField.readOnly = isEdit;
      }
      if (statusField && button.dataset.roleStatus) statusField.value = button.dataset.roleStatus;

      if (isEdit) {
        const allowed = new Set(String(button.dataset.rolePermissions || "").split(",").filter(Boolean));
        checks.forEach(input => {
          input.checked = allowed.has(input.value);
        });
      }

      syncCount();
    });
  });

  document.querySelector("[data-action='role-save']")?.addEventListener("click", () => {
    window.closeMo?.("moRole");
    window.toast?.("success", "Role saved", "Static preview only");
  });
}

function initUsersPage() {
  if (PAGE_NAME !== "users") return;

  bindTableSearch("#userSearch", "#usersTbody tr[data-user-row]", "#usersEmpty");

  document.querySelectorAll("[data-user-modal]").forEach(button => {
    button.addEventListener("click", () => {
      openStaticModal("moUser", button.dataset.userModalTitle || "User");
    });
  });

  document.querySelector("[data-action='user-save']")?.addEventListener("click", () => {
    window.closeMo?.("moUser");
    window.toast?.("success", "User saved", "Static preview only");
  });
}

function initMediaPage() {
  if (PAGE_NAME !== "media") return;

  bindFilterButtons({
    wrapSelector: "#mediaFilterWrap",
    itemSelector: ".media-card",
    emptySelector: "#mediaEmpty",
    statusAttr: "type"
  });

  document.querySelectorAll("[data-media-modal]").forEach(button => {
    button.addEventListener("click", () => {
      openStaticModal("moMedia", button.dataset.mediaModalTitle || "Upload Media");
    });
  });

  document.querySelector("[data-action='media-save']")?.addEventListener("click", () => {
    window.closeMo?.("moMedia");
    window.toast?.("success", "Media saved", "Static preview only");
  });
}

function initAdminModules() {
  initReviewsPage();
  initFrontendContentPage();
  initRolesPage();
  initUsersPage();
  initMediaPage();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdminModules, { once: true });
} else {
  initAdminModules();
}
