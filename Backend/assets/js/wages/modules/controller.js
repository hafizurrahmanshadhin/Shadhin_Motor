const PAGE_NAME = window.SMAdmin?.page || window.PAGE || "";

function syncWageDateLabel() {
  const input = document.getElementById("wDate");
  const label = document.getElementById("wDateLbl");
  if (!input || !label) return;

  label.textContent = input.value ? `Attendance for ${input.value}` : "Select a date";
}

function renderWageLog() {
  const currentDate = document.getElementById("wDate")?.value || "the selected date";
  window.toast?.("info", "Wage log filtered", `Static HTML rows shown for ${currentDate}.`);
}

function markAllPresent() {
  window.toast?.("success", "Attendance marked", "Static preview only");
}

function clearDayWages() {
  window.toast?.("warning", "Clear disabled", "Static demo rows stay fixed in HTML.");
}

export function initWagesPage() {
  if (PAGE_NAME !== "wages") return;

  const input = document.getElementById("wDate");
  if (input) {
    input.addEventListener("change", syncWageDateLabel);
  }

  document.querySelector('[data-action="wages-load"]')?.addEventListener("click", renderWageLog);
  document.querySelector('[data-action="wages-mark-all"]')?.addEventListener("click", markAllPresent);
  document.querySelector('[data-action="wages-clear"]')?.addEventListener("click", clearDayWages);
  syncWageDateLabel();
}
