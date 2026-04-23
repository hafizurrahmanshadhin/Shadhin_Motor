const TOOL_TABLE_COLUMNS = ["#", "Customer", "Phone", "Vehicle", "Service", "Sample", "Total", "Advance", "Status", "Date", "Actions"];

let activeEditRow = null;

function getTableWrap() {
  return document.getElementById("toolTableWrap");
}

function getTableBody() {
  return document.getElementById("toolTableBody");
}

function getTableRows() {
  return Array.from(document.querySelectorAll("#toolTableBody tr[data-row]"));
}

function formatCurrency(value) {
  return `৳${Number(value || 0).toLocaleString("en-US")}`;
}

function formatSample(sample) {
  if (!sample || sample === "—" || sample === "-") return "—";
  return `<span class="chip">${sample}</span>`;
}

function getStatusBadgeClass(status) {
  switch ((status || "").toLowerCase()) {
    case "completed":
      return "b-gr";
    case "in progress":
      return "b-bl";
    default:
      return "b-am";
  }
}

function getRowPayload(row) {
  return {
    row: Number(row.dataset.row || "0"),
    customer: row.dataset.customer || "-",
    phone: row.dataset.phone || "-",
    vehicle: row.dataset.vehicle || "-",
    service: row.dataset.service || "-",
    sample: row.dataset.sample || "—",
    total: Number(row.dataset.total || "0"),
    advance: Number(row.dataset.advance || "0"),
    status: row.dataset.status || "Pending",
    date: row.dataset.date || "",
    note: row.dataset.note || "Static preview row."
  };
}

function applyTableLabels() {
  getTableRows().forEach(row => {
    Array.from(row.children).forEach((cell, index) => {
      cell.dataset.label = TOOL_TABLE_COLUMNS[index] || "Value";
    });
  });
}

function buildPageList(totalPages, currentPage) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("ellipsis-start");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("ellipsis-end");

  pages.push(totalPages);
  return pages;
}

function createPagerButton(label, page, options = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `btn2 ${options.active ? "b2-gd active" : "b2-out"} b2-sm atbl-page-btn${options.edge ? " atbl-page-edge" : ""}`;
  button.dataset.page = String(page);

  if (options.icon) {
    button.innerHTML = options.icon;
  } else {
    button.textContent = label;
  }

  if (options.disabled) {
    button.disabled = true;
  }

  return button;
}

function renderTablePagination(totalPages, currentPage) {
  const pager = document.getElementById("toolTablePagination");
  if (!pager) return;

  pager.textContent = "";

  if (totalPages <= 1) return;

  const fragment = document.createDocumentFragment();
  fragment.appendChild(createPagerButton("Previous", Math.max(1, currentPage - 1), {
    disabled: currentPage === 1,
    edge: true,
    icon: '<i class="bi bi-chevron-left"></i><span>Previous</span>'
  }));

  buildPageList(totalPages, currentPage).forEach(item => {
    if (typeof item !== "number") {
      const dot = document.createElement("span");
      dot.className = "atbl-page-dots";
      dot.textContent = "...";
      fragment.appendChild(dot);
      return;
    }

    fragment.appendChild(createPagerButton(String(item), item, { active: item === currentPage }));
  });

  fragment.appendChild(createPagerButton("Next", Math.min(totalPages, currentPage + 1), {
    disabled: currentPage === totalPages,
    edge: true,
    icon: '<span>Next</span><i class="bi bi-chevron-right"></i>'
  }));

  pager.appendChild(fragment);
}

function updateMeta(totalMatches, currentPage, perPage) {
  const meta = document.getElementById("toolTableMeta");
  if (!meta) return;

  if (!totalMatches) {
    meta.textContent = "No matching entries";
    return;
  }

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(totalMatches, start + perPage - 1);
  meta.textContent = `Showing ${start} to ${end} of ${totalMatches} entries`;
}

function updateRowNumbers(rows) {
  rows.forEach((row, index) => {
    const numberCell = row.querySelector(".atbl-row-no");
    if (numberCell) numberCell.textContent = String(index + 1);
  });
}

function toggleEmptyState(isEmpty) {
  const emptyRow = document.getElementById("toolTableEmptyRow");
  if (!emptyRow) return;
  emptyRow.hidden = !isEmpty;
}

function applyTableState(page = null) {
  const wrap = getTableWrap();
  const search = document.getElementById("toolTableSearch");
  const perPageEl = document.getElementById("toolTablePerPage");
  const tbody = getTableBody();

  if (!wrap || !search || !perPageEl || !tbody) return;

  const rows = getTableRows();
  const query = search.value.trim().toLowerCase();
  const perPage = Number(perPageEl.value || "10");
  let currentPage = page ?? Number(wrap.dataset.page || "1");

  rows.forEach(row => {
    tbody.appendChild(row);
  });

  const matchedRows = rows.filter(row => row.textContent.toLowerCase().includes(query));
  updateRowNumbers(matchedRows);

  const totalPages = Math.max(1, Math.ceil(matchedRows.length / perPage));
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  wrap.dataset.page = String(currentPage);

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const visibleRows = new Set(matchedRows.slice(startIndex, endIndex));

  rows.forEach(row => {
    row.style.display = visibleRows.has(row) ? "" : "none";
  });

  toggleEmptyState(matchedRows.length === 0);
  updateMeta(matchedRows.length, currentPage, perPage);
  renderTablePagination(totalPages, currentPage);
}

function getNextRowId() {
  return getTableRows().reduce((max, row) => Math.max(max, Number(row.dataset.row || "0")), 0) + 1;
}

function createActionButtons() {
  return `
    <div class="atbl-actions">
      <button class="btn2 b2-out b2-xs atbl-act atbl-act-view" type="button" data-bs-toggle="modal" data-bs-target="#moATView" data-table-mode="view"><i class="bi bi-eye"></i><span>View</span></button>
      <button class="btn2 b2-gr b2-xs atbl-act atbl-act-edit" type="button" data-bs-toggle="modal" data-bs-target="#moATRecord" data-table-mode="edit"><i class="bi bi-pencil"></i><span>Edit</span></button>
      <button class="btn2 b2-re b2-xs atbl-act atbl-act-delete" type="button" data-table-action="delete"><i class="bi bi-trash"></i><span>Delete</span></button>
    </div>
  `;
}

function buildRowMarkup(data) {
  return `
    <td class="atbl-row-no">${data.row}</td>
    <td>${data.customer}</td>
    <td>${data.phone}</td>
    <td>${data.vehicle}</td>
    <td>${data.service}</td>
    <td>${formatSample(data.sample)}</td>
    <td class="atbl-amount">${formatCurrency(data.total)}</td>
    <td>${formatCurrency(data.advance)}</td>
    <td><span class="bdg ${getStatusBadgeClass(data.status)}">${data.status}</span></td>
    <td>${data.date || "-"}</td>
    <td>${createActionButtons()}</td>
  `;
}

function syncRow(row, data) {
  row.dataset.customer = data.customer;
  row.dataset.phone = data.phone;
  row.dataset.vehicle = data.vehicle;
  row.dataset.service = data.service;
  row.dataset.sample = data.sample || "—";
  row.dataset.total = String(data.total);
  row.dataset.advance = String(data.advance);
  row.dataset.status = data.status;
  row.dataset.date = data.date;
  row.dataset.note = data.note;
  row.innerHTML = buildRowMarkup(data);
}

function createRow(data) {
  const row = document.createElement("tr");
  row.dataset.row = String(data.row);
  syncRow(row, data);
  return row;
}

function getFormData() {
  return {
    customer: document.getElementById("tr_customer")?.value.trim() || "",
    phone: document.getElementById("tr_phone")?.value.trim() || "",
    vehicle: document.getElementById("tr_vehicle")?.value.trim() || "",
    service: document.getElementById("tr_service")?.value.trim() || "",
    sample: document.getElementById("tr_sample")?.value.trim() || "—",
    total: Number(document.getElementById("tr_total")?.value || "0"),
    advance: Number(document.getElementById("tr_advance")?.value || "0"),
    status: document.getElementById("tr_status")?.value || "Pending",
    date: document.getElementById("tr_date")?.value || "",
    note: document.getElementById("tr_note")?.value.trim() || "No extra notes added."
  };
}

function populateRecordForm(data) {
  document.getElementById("tr_customer").value = data.customer;
  document.getElementById("tr_phone").value = data.phone;
  document.getElementById("tr_vehicle").value = data.vehicle;
  document.getElementById("tr_service").value = data.service;
  document.getElementById("tr_sample").value = data.sample === "—" ? "" : data.sample;
  document.getElementById("tr_total").value = String(data.total || "");
  document.getElementById("tr_advance").value = String(data.advance || "");
  document.getElementById("tr_status").value = data.status;
  document.getElementById("tr_date").value = data.date;
  document.getElementById("tr_note").value = data.note;
}

function resetRecordForm() {
  const form = document.getElementById("tableRecordForm");
  form?.reset();
  form?.classList.remove("was-validated");
  document.getElementById("tr_status").value = "Pending";
  activeEditRow = null;
}

function prepareRecordModal(trigger) {
  const title = document.getElementById("tableRecordTitle");
  const submitLabel = document.querySelector("#tableRecordSubmit span");
  const mode = trigger?.dataset.tableMode || "add";

  resetRecordForm();
  if (!title || !submitLabel) return;

  if (mode === "edit") {
    activeEditRow = trigger?.closest("tr") || null;
    if (activeEditRow) {
      populateRecordForm(getRowPayload(activeEditRow));
      title.textContent = "Edit Order";
      submitLabel.textContent = "Save Changes";
      return;
    }
  }

  title.textContent = "Add New Order";
  submitLabel.textContent = "Save Record";
}

function createViewItem(label, value, fullWidth = false) {
  const item = document.createElement("div");
  item.className = `atbl-view-item${fullWidth ? " full" : ""}`;

  const labelEl = document.createElement("div");
  labelEl.className = "atbl-view-lbl";
  labelEl.textContent = label;

  const valueEl = document.createElement("div");
  valueEl.className = "atbl-view-val";
  valueEl.textContent = value;

  item.append(labelEl, valueEl);
  return item;
}

function prepareViewModal(trigger) {
  const row = trigger?.closest("tr");
  const body = document.getElementById("atViewBody");
  const title = document.getElementById("atViewTitle");
  if (!row || !body || !title) return;

  const data = getRowPayload(row);
  title.textContent = data.customer;
  body.textContent = "";

  const grid = document.createElement("div");
  grid.className = "atbl-view-grid";
  grid.append(
    createViewItem("Customer", data.customer),
    createViewItem("Phone", data.phone),
    createViewItem("Vehicle", data.vehicle),
    createViewItem("Service", data.service),
    createViewItem("Sample", data.sample),
    createViewItem("Status", data.status),
    createViewItem("Total", formatCurrency(data.total)),
    createViewItem("Advance", formatCurrency(data.advance)),
    createViewItem("Date", data.date || "-"),
    createViewItem("Notes", data.note, true)
  );

  body.appendChild(grid);
}

function bindRecordForm() {
  const form = document.getElementById("tableRecordForm");
  const recordModal = document.getElementById("moATRecord");
  if (!form || !recordModal) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    event.stopPropagation();
    form.classList.add("was-validated");

    if (!form.checkValidity()) return;

    const base = getFormData();
    const rowData = {
      ...base,
      row: activeEditRow ? Number(activeEditRow.dataset.row || "0") : getNextRowId()
    };

    if (activeEditRow) {
      syncRow(activeEditRow, rowData);
      toast("success", "Order updated", "Row updated in this static preview.");
    } else {
      const row = createRow(rowData);
      getTableBody()?.appendChild(row);
      toast("success", "Order added", "New row added to the table preview.");
    }

    applyTableLabels();
    applyTableState(activeEditRow ? Number(getTableWrap()?.dataset.page || "1") : 1);
    bootstrap.Modal.getInstance(recordModal)?.hide();
  });
}

function bindTableModalEvents() {
  const recordModal = document.getElementById("moATRecord");
  const viewModal = document.getElementById("moATView");

  recordModal?.addEventListener("show.bs.modal", event => {
    event.relatedTarget?.blur?.();
    prepareRecordModal(event.relatedTarget);
  });

  recordModal?.addEventListener("hidden.bs.modal", () => {
    resetRecordForm();
  });

  recordModal?.addEventListener("shown.bs.modal", () => {
    document.getElementById("tr_customer")?.focus({ preventScroll: true });
  });

  viewModal?.addEventListener("show.bs.modal", event => {
    event.relatedTarget?.blur?.();
    prepareViewModal(event.relatedTarget);
  });
}

function bindDeleteActions() {
  document.addEventListener("click", async event => {
    const deleteButton = event.target.closest('[data-table-action="delete"]');
    if (!deleteButton) return;

    event.preventDefault();
    const row = deleteButton.closest("tr");
    if (!row) return;

    const ok = await confirm2("Delete this row?", "This will remove the row from the current static preview.");
    if (!ok) return;

    row.remove();
    applyTableLabels();
    applyTableState();
    toast("success", "Row removed", "The row was deleted from this preview.");
  });
}

function initDataTablePage() {
  if (PAGE !== "tool-table") return;

  applyTableLabels();
  bindTableModalEvents();
  bindRecordForm();
  bindDeleteActions();
  applyTableState();

  document.getElementById("toolTableSearch")?.addEventListener("input", () => {
    applyTableState(1);
  });

  document.getElementById("toolTablePerPage")?.addEventListener("change", () => {
    applyTableState(1);
  });

  document.getElementById("toolTablePagination")?.addEventListener("click", event => {
    const button = event.target.closest("button[data-page]");
    if (!button || button.disabled) return;
    applyTableState(Number(button.dataset.page || "1"));
  });
}

document.addEventListener("DOMContentLoaded", initDataTablePage);
