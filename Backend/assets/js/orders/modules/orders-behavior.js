const PAGE_NAME = window.SMAdmin?.page || document.body?.dataset.page || "";

function getOrderRows() {
  return Array.from(document.querySelectorAll("#ordTbody tr"));
}

function updateOrderEmptyState() {
  const hasVisibleRows = getOrderRows().some(row => !row.hidden);
  const emptyEl = document.getElementById("ordEmpty");
  if (emptyEl) emptyEl.hidden = hasVisibleRows;
}

function resetOrderModal() {
  const modal = document.getElementById("moOrder");
  if (!modal) return;

  modal.querySelectorAll("input:not([type='hidden']), textarea").forEach(field => {
    field.value = "";
  });

  modal.querySelectorAll("select").forEach(select => {
    select.selectedIndex = 0;
  });

  modal.querySelectorAll("input[type='hidden']").forEach(field => {
    field.value = "";
  });
}

function filtOrders(status, btn) {
  document.querySelectorAll("#ordFilterWrap .f-btn").forEach(filterBtn => {
    filterBtn.classList.toggle("on", filterBtn === btn);
  });

  getOrderRows().forEach(row => {
    const rowStatus = row.dataset.status || "all";
    row.hidden = !(status === "all" || rowStatus === status);
  });

  updateOrderEmptyState();
}

function openOrderMo(trigger) {
  resetOrderModal();
  const title = trigger?.dataset?.orderModalTitle || "New Order";
  const titleEl = document.getElementById("moOT");
  if (titleEl) titleEl.textContent = title;
  window.SMAdmin?.shell?.openMo?.("moOrder");
}

function saveOrder() {
  window.SMAdmin?.shell?.closeMo?.("moOrder");
  window.SMAdmin?.ui?.toast?.("success", "Order form submitted", "Static preview only");
}

export function initOrdersPage() {
  if (PAGE_NAME !== "orders") return;

  document.querySelectorAll("#ordFilterWrap [data-order-filter]").forEach(button => {
    button.addEventListener("click", () => filtOrders(button.dataset.orderFilter, button));
  });

  document.querySelectorAll("[data-order-modal]").forEach(button => {
    button.addEventListener("click", () => openOrderMo(button));
  });

  document.querySelector('[data-action="order-save"]')?.addEventListener("click", saveOrder);
  updateOrderEmptyState();

  if (window.location.hash === "#new-order") {
    openOrderMo(document.querySelector("[data-order-modal]"));
  }
}
