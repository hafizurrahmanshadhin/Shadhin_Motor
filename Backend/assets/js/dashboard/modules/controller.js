const PAGE_NAME = window.SMAdmin?.page || window.PAGE || "";

function renderDash() {
  window.toast?.("info", "Dashboard refreshed", "Static HTML cards are already up to date.");
}

export function initDashboardPage() {
  if (PAGE_NAME !== "dashboard") return;

  document.querySelector('[data-action="dash-refresh"]')?.addEventListener("click", renderDash);
}
