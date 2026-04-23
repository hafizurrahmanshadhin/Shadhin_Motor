function saveSettings() {
  toast("success", "Settings saved", "Static preview only");
}

function exportData() {
  toast("info", "Export disabled", "This static build keeps data directly in HTML.");
}

function importData() {
  toast("info", "Import disabled", "Connect backend or storage later.");
}

async function clearAll() {
  const ok = await confirm2("Reset static demo content?");
  if (ok) {
    toast("success", "Reset skipped", "Static HTML content is fixed in this build.");
  }
}

function initSettingsPage() {
  if (PAGE !== "settings") return;

  document.querySelector('[data-action="settings-save"]')?.addEventListener("click", saveSettings);
  document.querySelector('[data-action="settings-export"]')?.addEventListener("click", exportData);
  document.querySelector('[data-action="settings-reset"]')?.addEventListener("click", clearAll);
  document.getElementById("settingsImportInput")?.addEventListener("change", importData);
}

document.addEventListener("DOMContentLoaded", initSettingsPage);

window.saveSettings = saveSettings;
window.exportData = exportData;
window.importData = importData;
window.clearAll = clearAll;
