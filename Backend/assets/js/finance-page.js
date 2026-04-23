function resetFinanceModal() {
  const modal = document.getElementById("moFin");
  if (!modal) return;

  modal.querySelectorAll("input:not([type='hidden']), textarea").forEach(field => {
    field.value = "";
  });

  modal.querySelectorAll("select").forEach(select => {
    select.selectedIndex = 0;
  });
}

function openFinMo(trigger) {
  resetFinanceModal();
  const titleEl = document.querySelector("#moFin .modal-title");
  if (titleEl) titleEl.textContent = trigger?.dataset?.financeModalTitle || "Finance Entry";
  openMo("moFin");
}

function saveFinEntry() {
  closeMo("moFin");
  toast("success", "Finance entry saved", "Static preview only");
}

function initFinancePage() {
  if (PAGE !== "finance") return;

  document.querySelectorAll("[data-finance-modal]").forEach(button => {
    button.addEventListener("click", () => openFinMo(button));
  });

  document.querySelector('[data-action="finance-save"]')?.addEventListener("click", saveFinEntry);

  if (window.location.hash === "#add-entry") {
    openFinMo(document.querySelector("[data-finance-modal]"));
  }
}

document.addEventListener("DOMContentLoaded", initFinancePage);

window.openFinMo = openFinMo;
window.saveFinEntry = saveFinEntry;
