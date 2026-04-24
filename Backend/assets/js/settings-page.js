const settingsPageName = typeof PAGE !== "undefined" ? PAGE : document.body?.dataset?.page;

function q(sel, scope = document) {
  return scope.querySelector(sel);
}

function valueOf(id, fallback = "") {
  const el = document.getElementById(id);
  return el && "value" in el && el.value.trim() ? el.value.trim() : fallback;
}

function setText(sel, text) {
  const el = q(sel);
  if (el) el.textContent = text;
}

function setBrandName(name) {
  const el = q(".brand-preview-name");
  if (!el) return;

  const parts = name.trim().split(/\s+/).filter(Boolean);
  el.textContent = "";

  if (parts.length > 1) {
    el.append(document.createTextNode(`${parts.slice(0, -1).join(" ")} `));
    const last = document.createElement("span");
    last.textContent = parts[parts.length - 1];
    el.append(last);
    return;
  }

  el.textContent = name || "Shadhin Motor";
}

function updateModuleSummary() {
  const total = document.querySelectorAll(".module-grid input[type='checkbox']:checked").length;
  const summary = q(".set-summary-card:nth-child(2) strong");
  if (summary) summary.textContent = `${total} Modules Active`;
}

function updatePreview(showToast = false) {
  const adminName = valueOf("adminName", "Shadhin Motor");
  const adminLabel = valueOf("adminLabel", "Admin Panel");
  const titlePrefix = valueOf("titlePrefix", "Shadhin Motor");
  const theme = valueOf("defaultTheme", "Dark");
  const currency = valueOf("currencySymbol", "৳");
  const accent = valueOf("accentColor", "#f59e0b");
  const sidebar = getComputedStyle(document.documentElement).getPropertyValue("--sw").trim() || "246px";

  setBrandName(adminName);
  setText(".brand-preview-sub", adminLabel);
  setText('[data-preview="theme"]', theme);
  setText('[data-preview="currency"]', `${currency} BDT`);
  setText('[data-preview="sidebar"]', sidebar);
  updateModuleSummary();

  if (/^#[0-9a-f]{6}$/i.test(accent)) {
    const picker = document.getElementById("accentColorPicker");
    if (picker && picker.value.toLowerCase() !== accent.toLowerCase()) picker.value = accent;
  }

  document.title = `${titlePrefix} — Settings`;

  if (showToast) {
    toast("info", "Preview refreshed", "Your visible settings preview is updated.");
  }
}

function saveSettings(event) {
  updatePreview(false);

  const btn = event?.currentTarget;
  btn?.classList.add("loading");

  window.setTimeout(() => {
    btn?.classList.remove("loading");
    toast("success", "Settings saved", "Static preview updated. Backend persistence can be connected later.");
  }, 350);
}

function exportData() {
  toast("info", "Export ready for backend", "Demo records stay in HTML for clean Laravel Blade conversion.");
}

function importData(event) {
  const file = event?.target?.files?.[0];
  if (file) setText("#importFileName", file.name);
  toast("info", "Import selected", file ? `${file.name} selected. Connect backend import later.` : "Connect backend or storage later.");
}

async function clearAll() {
  const ok = await confirm2("Reset static demo content?");
  if (ok) {
    toast("success", "Reset skipped", "Static HTML content is fixed in this build.");
  }
}

function bindFileInput(inputId, labelId) {
  const input = document.getElementById(inputId);
  const label = document.getElementById(labelId);
  if (!input || !label) return;

  const fallback = label.textContent;
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    label.textContent = file ? file.name : fallback;
  });
}

function bindAccentControls() {
  const picker = document.getElementById("accentColorPicker");
  const text = document.getElementById("accentColor");
  if (!picker || !text) return;

  picker.addEventListener("input", () => {
    text.value = picker.value;
    updatePreview(false);
  });

  text.addEventListener("input", () => updatePreview(false));
}

function initSettingsPage() {
  if (settingsPageName !== "settings") return;

  document.querySelector('[data-action="settings-save"]')?.addEventListener("click", saveSettings);
  document.querySelector('[data-action="settings-preview"]')?.addEventListener("click", () => updatePreview(true));
  document.querySelector('[data-action="settings-export"]')?.addEventListener("click", exportData);
  document.querySelector('[data-action="settings-reset"]')?.addEventListener("click", clearAll);
  document.getElementById("settingsImportInput")?.addEventListener("change", importData);

  bindFileInput("adminLogoInput", "logoFileName");
  bindFileInput("faviconInput", "faviconFileName");
  bindAccentControls();

  document.querySelectorAll("#page-settings input, #page-settings select, #page-settings textarea").forEach((field) => {
    if (field.type === "file") return;
    field.addEventListener("input", () => updatePreview(false));
    field.addEventListener("change", () => updatePreview(false));
  });

  updatePreview(false);
}

document.addEventListener("DOMContentLoaded", initSettingsPage);

window.saveSettings = saveSettings;
window.exportData = exportData;
window.importData = importData;
window.clearAll = clearAll;
