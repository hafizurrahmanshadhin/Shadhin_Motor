const PAGE_NAME = window.SMAdmin?.page || document.body?.dataset.page || "";

function getSampleCards() {
  return Array.from(document.querySelectorAll("#sGrid .s-card"));
}

function updateSampleCount() {
  const countEl = document.getElementById("sCnt");
  if (!countEl) return;

  const visibleCards = getSampleCards().filter(card => !card.hidden);
  countEl.textContent = String(visibleCards.length);
}

function nextSampleId(material) {
  const prefix = material === "leather" ? "LT" : "RX";
  const count = document.querySelectorAll(`#sGrid .s-card[data-material="${material}"]`).length + 1;
  return `${prefix}-${String(count).padStart(3, "0")}`;
}

function updSPrev() {
  const name = document.getElementById("sm_n")?.value.trim() || "Untitled sample";
  const colorName = document.getElementById("sm_c")?.value.trim() || "Color not set";
  const hex = document.getElementById("sm_hex")?.value.trim() || "#1a1a1a";
  const sampleName = document.getElementById("smPrevN");
  const sampleColor = document.getElementById("smPrevC");
  const swatch = document.getElementById("smPrevSw");

  if (sampleName) sampleName.textContent = name;
  if (sampleColor) sampleColor.textContent = colorName;
  if (swatch) swatch.style.background = hex;
}

function syncClr(source) {
  const hex = document.getElementById("sm_hex");
  const picker = document.getElementById("sm_pick");
  if (!hex || !picker) return;

  if (source === "p") hex.value = picker.value;
  if (source === "h") picker.value = hex.value || "#1a1a1a";

  updSPrev();
}

function autoSID() {
  const material = document.getElementById("sm_mat");
  const sampleId = document.getElementById("sm_id");
  if (!material || !sampleId) return;

  const value = sampleId.value.trim();
  if (!value || /^[A-Z]{2}-\d{3}$/.test(value)) {
    sampleId.value = nextSampleId(material.value || "rexine");
  }
}

function filtSamples(type, btn) {
  document.querySelectorAll("#page-samples .f-btn").forEach(filterBtn => {
    filterBtn.classList.toggle("on", filterBtn === btn);
  });

  getSampleCards().forEach(card => {
    const cardType = card.dataset.material || "all";
    card.hidden = !(type === "all" || cardType === type);
  });

  updateSampleCount();
}

function resetSampleModal() {
  const modal = document.getElementById("moSample");
  if (!modal) return;

  modal.querySelectorAll("input:not([type='hidden']):not([type='color']), textarea").forEach(field => {
    field.value = "";
  });

  const picker = document.getElementById("sm_pick");
  if (picker) picker.value = "#1a1a1a";

  const hex = document.getElementById("sm_hex");
  if (hex) hex.value = "#1a1a1a";

  modal.querySelectorAll("select").forEach(select => {
    select.selectedIndex = 0;
  });

  modal.querySelectorAll("input[type='hidden']").forEach(field => {
    field.value = "";
  });
}

function openSampleMo(trigger) {
  resetSampleModal();
  const titleEl = document.getElementById("moST");
  if (titleEl) titleEl.textContent = trigger?.dataset?.sampleModalTitle || "Add Sample";
  autoSID();
  updSPrev();
  window.SMAdmin?.shell?.openMo?.("moSample");
}

function saveSample() {
  window.SMAdmin?.shell?.closeMo?.("moSample");
  window.SMAdmin?.ui?.toast?.("success", "Sample saved", "Static preview only");
}

export function initSamplesPage() {
  if (PAGE_NAME !== "samples") return;

  document.querySelectorAll("[data-sample-filter]").forEach(button => {
    button.addEventListener("click", () => filtSamples(button.dataset.sampleFilter, button));
  });

  document.querySelectorAll("[data-sample-modal]").forEach(button => {
    button.addEventListener("click", () => openSampleMo(button));
  });

  document.querySelector('[data-action="sample-save"]')?.addEventListener("click", saveSample);
  document.getElementById("sm_mat")?.addEventListener("change", () => {
    autoSID();
    updSPrev();
  });
  document.getElementById("sm_n")?.addEventListener("input", updSPrev);
  document.getElementById("sm_c")?.addEventListener("input", updSPrev);
  document.getElementById("sm_hex")?.addEventListener("input", () => syncClr("h"));
  document.getElementById("sm_pick")?.addEventListener("input", () => syncClr("p"));

  updateSampleCount();
  syncClr("h");

  if (window.location.hash === "#add-sample") {
    openSampleMo(document.querySelector("[data-sample-modal]"));
  }
}
