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

function renderPreview() {
  const preview = document.getElementById("fPreview");
  if (!preview) return;

  const hasContent = Array.from(document.querySelectorAll("#toolForm input, #toolForm select, #toolForm textarea")).some(
    field => field.value && field.value.trim() !== ""
  );

  preview.textContent = "";

  if (!hasContent) {
    const empty = document.createElement("div");
    empty.style.textAlign = "center";
    empty.style.padding = "36px 20px";
    empty.style.color = "var(--txt3)";
    const icon = document.createElement("i");
    icon.className = "bi bi-file-text";
    icon.style.fontSize = "36px";
    icon.style.display = "block";
    icon.style.marginBottom = "10px";

    const text = document.createElement("p");
    text.style.fontSize = "12px";
    text.textContent = "Fill the form to see preview";

    empty.append(icon, text);
    preview.appendChild(empty);
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = "dashboard-chart-static";

  getPreviewPairs().forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "dashboard-chart-bar";

    const labelEl = document.createElement("span");
    labelEl.textContent = label;

    const valueTrack = document.createElement("div");
    valueTrack.className = "dashboard-chart-track";

    const valueInner = document.createElement("div");
    valueInner.className = "dashboard-chart-fill";
    valueInner.style.width = "100%";
    valueInner.style.background = "linear-gradient(90deg, var(--am), var(--am-l))";

    valueTrack.appendChild(valueInner);

    const valueEl = document.createElement("span");
    valueEl.style.textAlign = "right";
    valueEl.textContent = value;

    row.append(labelEl, valueTrack, valueEl);
    wrap.appendChild(row);
  });

  preview.appendChild(wrap);
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

  toast("success", "Order form ready", "Static preview only");
}

function initFormBuilderPage() {
  if (PAGE !== "tool-form") return;

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

document.addEventListener("DOMContentLoaded", initFormBuilderPage);

window.calcDue = calcDue;
window.resetToolForm = resetToolForm;
