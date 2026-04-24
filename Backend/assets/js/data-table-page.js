/*
 * Yajra-safe table helpers.
 * This file does not own table data, pagination, filtering, or row rendering.
 * Laravel/Yajra DataTables can initialize the same table without fighting this
 * script; these helpers only read existing HTML and wire Bootstrap UI behavior.
 */

function getAdminTable(trigger = null) {
  return trigger?.closest(".atbl-wrap")?.querySelector("[data-admin-table]")
    || document.querySelector("[data-admin-table]");
}

function getTableHeadings(table) {
  return Array.from(table?.querySelectorAll("thead th") || [])
    .map((th, index) => th.textContent.trim() || `Column ${index + 1}`);
}

function stripCellText(cell) {
  return cell?.textContent.replace(/\s+/g, " ").trim() || "-";
}

function applyTableLabels(table) {
  const headings = getTableHeadings(table);
  table?.querySelectorAll("tbody tr").forEach(row => {
    Array.from(row.children).forEach((cell, index) => {
      if (!cell.dataset.label) {
        cell.dataset.label = headings[index] || `Column ${index + 1}`;
      }
    });
  });
}

function getRowDetails(row) {
  const table = row?.closest("table");
  const headings = getTableHeadings(table);
  const cells = Array.from(row?.children || []);

  return cells.map((cell, index) => ({
    label: headings[index] || `Column ${index + 1}`,
    value: stripCellText(cell),
    image: cell.querySelector("img")?.getAttribute("src") || "",
    hidden: cell.classList.contains("atbl-actions-col")
  })).filter(item => !item.hidden);
}

function getRowTitle(row) {
  return row?.dataset.customer
    || stripCellText(row?.querySelector(".atbl-customer"))
    || "Record Details";
}

function createViewItem(label, value, fullWidth = false) {
  const item = document.createElement("div");
  item.className = `atbl-view-item${fullWidth ? " full" : ""}`;

  const labelEl = document.createElement("div");
  labelEl.className = "atbl-view-lbl";
  labelEl.textContent = label;

  const valueEl = document.createElement("div");
  valueEl.className = "atbl-view-val";
  valueEl.textContent = value || "-";

  item.append(labelEl, valueEl);
  return item;
}

function renderViewModal(trigger) {
  const row = trigger?.closest("tr");
  const body = document.getElementById("atViewBody");
  const title = document.getElementById("atViewTitle");
  if (!row || !body || !title) return;

  const details = getRowDetails(row);
  const avatar = row.querySelector(".atbl-avatar")?.getAttribute("src") || "";
  const customer = getRowTitle(row);
  const phone = row.dataset.phone || details.find(item => item.label.toLowerCase() === "phone")?.value || "";

  title.textContent = customer;
  body.textContent = "";

  if (avatar) {
    const profile = document.createElement("div");
    profile.className = "atbl-view-profile";
    const image = document.createElement("img");
    image.src = avatar;
    image.alt = "";
    image.width = 54;
    image.height = 54;
    image.loading = "lazy";
    image.decoding = "async";

    const meta = document.createElement("div");
    const nameEl = document.createElement("div");
    nameEl.className = "atbl-view-person";
    nameEl.textContent = customer;
    const subEl = document.createElement("div");
    subEl.className = "atbl-view-sub";
    subEl.textContent = phone || "Selected table record";

    meta.append(nameEl, subEl);
    profile.append(image, meta);
    body.appendChild(profile);
  }

  const grid = document.createElement("div");
  grid.className = "atbl-view-grid";
  details.forEach(item => {
    if (item.image) return;
    grid.appendChild(createViewItem(item.label, item.value, item.value.length > 70));
  });

  body.appendChild(grid);
}

function fillRecordFormFromRow(trigger) {
  const mode = trigger?.dataset.tableMode || "add";
  const title = document.getElementById("tableRecordTitle");
  const submitLabel = document.querySelector("#tableRecordSubmit span");
  const form = document.getElementById("tableRecordForm");

  form?.reset();
  form?.classList.remove("was-validated");

  if (title) title.textContent = mode === "edit" ? "Edit Order" : "Add New Order";
  if (submitLabel) submitLabel.textContent = mode === "edit" ? "Save Changes" : "Save Record";

  if (mode !== "edit") return;

  const row = trigger?.closest("tr");
  if (!row) return;

  const fieldMap = {
    tr_customer: row.dataset.customer,
    tr_phone: row.dataset.phone,
    tr_vehicle: row.dataset.vehicle,
    tr_service: row.dataset.service,
    tr_sample: row.dataset.sample === "—" ? "" : row.dataset.sample,
    tr_total: row.dataset.total,
    tr_advance: row.dataset.advance,
    tr_status: row.dataset.status,
    tr_date: row.dataset.date,
    tr_note: row.dataset.note
  };

  Object.entries(fieldMap).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if (field && value !== undefined) field.value = value;
  });
}

function bindTableModals() {
  document.getElementById("moATRecord")?.addEventListener("show.bs.modal", event => {
    event.relatedTarget?.blur?.();
    fillRecordFormFromRow(event.relatedTarget);
  });

  document.getElementById("moATView")?.addEventListener("show.bs.modal", event => {
    event.relatedTarget?.blur?.();
    renderViewModal(event.relatedTarget);
  });

  document.getElementById("moATRecord")?.addEventListener("shown.bs.modal", () => {
    document.getElementById("tr_customer")?.focus({ preventScroll: true });
  });
}

function bindStaticRecordForm() {
  const form = document.getElementById("tableRecordForm");
  if (!form || form.dataset.staticForm !== "true") return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    event.stopPropagation();
    form.classList.add("was-validated");

    if (!form.checkValidity()) return;

    bootstrap.Modal.getInstance(document.getElementById("moATRecord"))?.hide();
    toast("info", "Static form preview", "In Laravel, submit this form to your controller or update the Yajra table after Ajax success.");
  });
}

function getSampleRows(table) {
  return Array.from(table?.querySelectorAll("tbody tr[data-row]") || []);
}

function updateStaticTableState(table) {
  if (!table) return;

  applyTableLabels(table);

  const rows = getSampleRows(table);
  const wrap = table.closest(".atbl-wrap");
  const meta = wrap?.querySelector(".atbl-meta");
  const emptyRow = table.querySelector(".atbl-empty")?.closest("tr");

  if (meta) {
    meta.textContent = `${rows.length} sample ${rows.length === 1 ? "row" : "rows"} in HTML`;
  }

  if (emptyRow) {
    emptyRow.hidden = rows.length > 0;
  }
}

function bindStaticDeleteActions() {
  document.addEventListener("click", async event => {
    const trigger = event.target.closest("[data-static-delete]");
    if (!trigger) return;

    event.preventDefault();

    const row = trigger.closest("tr");
    const table = row?.closest("table");
    if (!row || !table) return;

    const confirmed = await confirm2(
      trigger.dataset.confirmTitle || "Delete this row?",
      trigger.dataset.confirmText || "This removes only the static preview row. In Laravel, call your delete route and reload the Yajra table."
    );

    if (!confirmed) return;

    row.remove();
    updateStaticTableState(table);
    toast("success", "Row removed", "The row was deleted from this static preview.");
  });
}

function bindConfirmActions() {
  document.addEventListener("click", async event => {
    const trigger = event.target.closest("[data-table-confirm]");
    if (!trigger) return;

    const confirmed = await confirm2(
      trigger.dataset.confirmTitle || "Continue?",
      trigger.dataset.confirmText || "Laravel should handle this action on submit or Ajax success."
    );

    if (!confirmed) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (trigger.dataset.staticAction === "true") {
      event.preventDefault();
      toast("info", "Static action preview", "Replace this button with a route, form submit, or Ajax call in Blade.");
    }
  });
}

function initDataTablePage() {
  if (window.PAGE && PAGE !== "tool-table") return;

  document.querySelectorAll("[data-admin-table]").forEach(updateStaticTableState);
  bindTableModals();
  bindStaticRecordForm();
  bindStaticDeleteActions();
  bindConfirmActions();
}

document.addEventListener("DOMContentLoaded", initDataTablePage);
