import { byId, onReady, openStaticModal } from "../admin-modules/shared.js";

const PAGE_NAME = window.SMAdmin?.page || document.body?.dataset.page || "";

export function initRolesPage() {
  if (PAGE_NAME !== "roles") return;
  const page = byId("page-roles");
  if (!page) return;

  const roleModal = byId("moRole");
  const nameField = roleModal?.querySelector("[data-role-name-field]");
  const keyField = roleModal?.querySelector("[data-role-key-field]");
  const statusField = roleModal?.querySelector("[data-role-status-field]");
  const countEl = byId("permissionCount");
  const checks = Array.from(roleModal?.querySelectorAll("[data-role-permission]") || []);

  const syncCount = () => {
    const count = checks.filter(input => input.checked).length;
    if (countEl) countEl.textContent = String(count);
  };

  checks.forEach(input => input.addEventListener("change", syncCount));
  syncCount();

  page.querySelectorAll("[data-role-modal]").forEach(button => {
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

  roleModal?.querySelector("[data-action='role-save']")?.addEventListener("click", () => {
    window.SMAdmin?.shell?.closeMo?.("moRole");
    window.SMAdmin?.ui?.toast?.("success", "Role saved", "Static preview only");
  });
}

onReady(initRolesPage);
