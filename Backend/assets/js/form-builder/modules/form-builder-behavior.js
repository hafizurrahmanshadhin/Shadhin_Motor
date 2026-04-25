const PAGE_NAME = window.SMAdmin?.page || document.body?.dataset.page || "";

function calcDue() {
  const total = parseFloat(document.getElementById("f_total")?.value || "0");
  const advance = parseFloat(document.getElementById("f_advance")?.value || "0");
  const due = Math.max(0, total - advance);
  const dueField = document.getElementById("f_due");
  if (dueField) dueField.value = due ? String(due) : "";
}

function getPreviewPairs() {
  const name = document.getElementById("f_name")?.value.trim() || "Customer name";
  const phone = document.getElementById("f_phone")?.value.trim() || "Phone number";
  const vehicleType = document.getElementById("f_vtype")?.value || "Vehicle type";
  const brand = document.getElementById("f_brand")?.value || "Brand";
  const model = document.getElementById("f_model")?.value.trim() || "Model";
  const service = document.getElementById("f_service")?.value || "Service";
  const material = document.getElementById("f_material")?.value || "Material";
  const sample = document.getElementById("f_sample")?.value || "No sample";
  const total = document.getElementById("f_total")?.value || "0";
  const advance = document.getElementById("f_advance")?.value || "0";
  const due = document.getElementById("f_due")?.value || "0";
  const delivery = document.getElementById("f_delivery")?.value || "Not scheduled";

  return [
    ["Customer", `${name} · ${phone}`],
    ["Vehicle", `${vehicleType} · ${brand} ${model}`],
    ["Service", `${service} · ${material}`],
    ["Sample", sample],
    ["Payment", `৳${total} total · ৳${advance} advance · ৳${due} due`],
    ["Delivery", delivery]
  ];
}

function hasPreviewContent() {
  return Array.from(document.querySelectorAll("#toolForm input, #toolForm select, #toolForm textarea")).some(field => {
    if (field.type === "radio" || field.type === "checkbox" || field.type === "file") return false;
    if (field.readOnly) return false;
    if (field.tagName === "SELECT") return field.selectedIndex > 0 && field.value.trim() !== "";
    return field.value && field.value.trim() !== "";
  });
}

function setPreviewValue(label, value) {
  const target = document.querySelector(`[data-preview-field="${label}"]`);
  if (target) target.textContent = value || "-";
}

function renderPreview() {
  const preview = document.getElementById("fPreview");
  if (!preview) return;

  const hasContent = hasPreviewContent();
  preview.querySelector("[data-preview-empty]")?.toggleAttribute("hidden", hasContent);
  preview.querySelector("[data-preview-summary]")?.toggleAttribute("hidden", !hasContent);

  getPreviewPairs().forEach(([label, value]) => setPreviewValue(label, value));
}

function resetToolForm() {
  const form = document.getElementById("toolForm");
  form?.reset();
  form?.classList.remove("was-validated");
  const dueField = document.getElementById("f_due");
  if (dueField) dueField.value = "";
  renderPreview();
}

function handleFormSubmit(event) {
  event.preventDefault();
  event.stopPropagation();

  const form = event.currentTarget;
  form.classList.add("was-validated");
  calcDue();
  renderPreview();

  if (typeof form.checkValidity === "function" && !form.checkValidity()) return;

  window.SMAdmin?.ui?.toast?.("success", "Order form ready", "Static preview only");
}

export function initFormBuilderPage() {
  if (PAGE_NAME !== "tool-form") return;

  const form = document.getElementById("toolForm");
  if (!form) return;

  form.addEventListener("submit", handleFormSubmit);
  form.addEventListener("input", () => {
    calcDue();
    renderPreview();
  });
  form.addEventListener("change", renderPreview);

  document.querySelector('[data-action="form-reset"]')?.addEventListener("click", resetToolForm);

  calcDue();
  renderPreview();
}
