/*
 * Yajra-safe table helpers.
 * This file does not own server data or Ajax rendering. Laravel/Yajra DataTables
 * can initialize the same table without fighting this script; static pagination
 * and filters run only when the wrapper opts in with data-static-table="true".
 */

const PAGE_NAME = window.SMAdmin?.page || window.PAGE || "";

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

function blankIfDash(value) {
  return value === "—" || value === "-" ? "" : value;
}

function numericText(value) {
  return (value || "").replace(/[^\d.]/g, "");
}

function norm(value) {
  return (value || "").toString().trim().toLowerCase();
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
  return blankIfDash(stripCellText(row?.querySelector(".atbl-customer")))
    || row?.dataset.customer
    || "Record Details";
}

function getDetailMap(row) {
  return getRowDetails(row).reduce((map, item) => {
    map[item.label] = item.value;
    return map;
  }, {});
}

function setViewField(name, value) {
  const target = document.querySelector(`[data-view-value="${name}"]`);
  if (target) target.textContent = value || "-";
}

function renderViewModal(trigger) {
  const row = trigger?.closest("tr");
  const body = document.getElementById("atViewBody");
  const title = document.getElementById("atViewTitle");
  if (!row || !body || !title) return;

  const details = getDetailMap(row);
  const avatar = row.querySelector(".atbl-avatar")?.getAttribute("src") || "";
  const customer = getRowTitle(row);
  const phone = blankIfDash(details.Phone) || row.dataset.phone || "";

  title.textContent = customer;

  const profile = body.querySelector("[data-view-profile]");
  const image = document.getElementById("atViewAvatar");
  if (profile) profile.hidden = !avatar;
  if (image && avatar) {
    image.src = avatar;
    image.alt = `${customer} avatar`;
  }

  const person = document.getElementById("atViewPerson");
  if (person) person.textContent = customer;
  const sub = document.getElementById("atViewSub");
  if (sub) sub.textContent = phone || "Selected table record";

  setViewField("Customer", customer);
  setViewField("Phone", phone);
  setViewField("Vehicle", blankIfDash(details.Vehicle) || row.dataset.vehicle);
  setViewField("Service", blankIfDash(details.Service) || row.dataset.service);
  setViewField("Sample", blankIfDash(details.Sample) || row.dataset.sample);
  setViewField("Total", details["Total (৳)"]);
  setViewField("Advance", details["Advance (৳)"]);
  setViewField("Status", blankIfDash(details.Status) || row.dataset.status);
  setViewField("Date", blankIfDash(details.Date) || row.dataset.date);
  setViewField("Notes", row.dataset.note || "No note added for this static row.");
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

  const details = getDetailMap(row);
  const fieldMap = {
    tr_customer: blankIfDash(stripCellText(row.querySelector(".atbl-customer"))) || row.dataset.customer,
    tr_phone: blankIfDash(details.Phone) || row.dataset.phone,
    tr_vehicle: blankIfDash(details.Vehicle) || row.dataset.vehicle,
    tr_service: blankIfDash(details.Service) || row.dataset.service,
    tr_sample: blankIfDash(details.Sample) || blankIfDash(row.dataset.sample),
    tr_total: numericText(details["Total (৳)"]) || row.dataset.total,
    tr_advance: numericText(details["Advance (৳)"]) || row.dataset.advance,
    tr_status: blankIfDash(details.Status) || row.dataset.status,
    tr_date: blankIfDash(details.Date) || row.dataset.date,
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

    window.bootstrap?.Modal.getInstance(document.getElementById("moATRecord"))?.hide();
    window.toast?.("info", "Static form preview", "In Laravel, submit this form to your controller or update the Yajra table after Ajax success.");
  });
}

function getDataRows(table) {
  return Array.from(table?.querySelectorAll("tbody tr[data-row]") || []);
}

function isStaticTable(table) {
  const wrap = table?.closest(".atbl-wrap");
  return table?.dataset.staticTable === "true" || wrap?.dataset.staticTable === "true";
}

function getStaticControls(wrap) {
  return {
    length: wrap?.querySelector("[data-yajra-length]"),
    search: wrap?.querySelector("[data-yajra-search]"),
    filters: Array.from(wrap?.querySelectorAll("[data-yajra-filter]") || []),
    reset: wrap?.querySelector("[data-yajra-reset]"),
    pager: wrap?.querySelector("[data-yajra-pagination]")
  };
}

function detailValue(row, label) {
  return blankIfDash(getDetailMap(row)[label]);
}

function moneyNumber(value) {
  const parsed = Number.parseFloat(numericText(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getPerPage(wrap, fallbackCount) {
  const selected = Number.parseInt(getStaticControls(wrap).length?.value || "", 10);
  return Number.isFinite(selected) && selected > 0 ? selected : Math.max(fallbackCount, 1);
}

function sampleKind(value) {
  const sample = blankIfDash(value).toUpperCase();
  if (!sample) return "none";
  if (sample.startsWith("RX")) return "rexine";
  if (sample.startsWith("LT")) return "leather";
  return "other";
}

function paymentKind(row) {
  const total = moneyNumber(detailValue(row, "Total (৳)") || row.dataset.total);
  const advance = moneyNumber(detailValue(row, "Advance (৳)") || row.dataset.advance);
  return total > 0 && advance >= total ? "paid" : "due";
}

function matchesStaticFilters(row, wrap) {
  const controls = getStaticControls(wrap);
  const details = getDetailMap(row);
  const searchable = norm(row.textContent);
  const query = norm(controls.search?.value);

  if (query && !searchable.includes(query)) return false;

  return controls.filters.every((filter) => {
    const value = filter.value;
    if (!value || value === "all") return true;

    const name = filter.dataset.yajraFilter;
    if (name === "status") return norm(details.Status || row.dataset.status) === norm(value);
    if (name === "service") return norm(details.Service || row.dataset.service).includes(norm(value));
    if (name === "vehicle") return norm(details.Vehicle || row.dataset.vehicle).includes(norm(value));
    if (name === "sample") return sampleKind(details.Sample || row.dataset.sample) === value;
    if (name === "payment") return paymentKind(row) === value;

    return true;
  });
}

function pageNumbers(currentPage, pageCount) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set([1, pageCount, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = Array.from(pages)
    .filter(page => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b);

  return sorted.reduce((items, page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) items.push("dots");
    items.push(page);
    return items;
  }, []);
}

function makePageButton(label, targetPage, options = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `btn2 b2-out b2-sm atbl-page-btn${options.edge ? " atbl-page-edge" : ""}`;
  button.dataset.pageTarget = String(targetPage);
  button.disabled = Boolean(options.disabled);

  if (options.iconBefore) {
    const icon = document.createElement("i");
    icon.className = options.iconBefore;
    button.appendChild(icon);
  }

  const text = document.createElement("span");
  text.textContent = label;
  button.appendChild(text);

  if (options.iconAfter) {
    const icon = document.createElement("i");
    icon.className = options.iconAfter;
    button.appendChild(icon);
  }

  if (options.active) {
    button.classList.add("active");
    button.setAttribute("aria-current", "page");
  }

  return button;
}

function renderStaticPagination(wrap, currentPage, pageCount) {
  const pager = getStaticControls(wrap).pager;
  if (!pager) return;

  pager.textContent = "";
  pager.hidden = pageCount <= 1;
  if (pager.hidden) return;

  pager.appendChild(makePageButton("Previous", currentPage - 1, {
    edge: true,
    disabled: currentPage <= 1,
    iconBefore: "bi bi-chevron-left"
  }));

  pageNumbers(currentPage, pageCount).forEach(page => {
    if (page === "dots") {
      const dots = document.createElement("span");
      dots.className = "atbl-page-dots";
      dots.textContent = "...";
      pager.appendChild(dots);
      return;
    }

    pager.appendChild(makePageButton(String(page), page, {
      active: page === currentPage
    }));
  });

  pager.appendChild(makePageButton("Next", currentPage + 1, {
    edge: true,
    disabled: currentPage >= pageCount,
    iconAfter: "bi bi-chevron-right"
  }));
}

function updateStaticTableState(table) {
  if (!table) return;

  applyTableLabels(table);

  const rows = getDataRows(table);
  const wrap = table.closest(".atbl-wrap");
  const meta = wrap?.querySelector(".atbl-meta");
  const emptyRow = table.querySelector(".atbl-empty")?.closest("tr");

  if (!isStaticTable(table)) {
    if (meta) {
      meta.textContent = `${rows.length} sample ${rows.length === 1 ? "row" : "rows"} in HTML`;
    }

    if (emptyRow) {
      emptyRow.hidden = rows.length > 0;
    }

    return;
  }

  const perPage = getPerPage(wrap, rows.length);
  const filteredRows = rows.filter(row => matchesStaticFilters(row, wrap));
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / perPage));
  const currentPage = Math.min(Math.max(Number.parseInt(wrap?.dataset.page || "1", 10) || 1, 1), pageCount);
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const visibleRows = new Set(filteredRows.slice(start, end));

  if (wrap) wrap.dataset.page = String(currentPage);

  rows.forEach(row => {
    row.hidden = !visibleRows.has(row);
  });

  if (meta) {
    if (!rows.length) {
      meta.textContent = "No sample rows in HTML";
    } else if (!filteredRows.length) {
      meta.textContent = "No matching rows";
    } else {
      const showingStart = start + 1;
      const showingEnd = Math.min(end, filteredRows.length);
      const filterText = filteredRows.length === rows.length ? "" : `, filtered from ${rows.length}`;
      meta.textContent = `Showing ${showingStart}-${showingEnd} of ${filteredRows.length} rows${filterText}`;
    }
  }

  if (emptyRow) {
    emptyRow.hidden = filteredRows.length > 0;
  }

  renderStaticPagination(wrap, currentPage, pageCount);
}

function bindStaticTableControls(table) {
  const wrap = table?.closest(".atbl-wrap");
  if (!wrap || !isStaticTable(table) || wrap.dataset.staticBound === "true") return;

  const controls = getStaticControls(wrap);
  wrap.dataset.staticBound = "true";

  controls.length?.addEventListener("change", () => {
    wrap.dataset.page = "1";
    updateStaticTableState(table);
  });

  controls.search?.addEventListener("input", () => {
    wrap.dataset.page = "1";
    updateStaticTableState(table);
  });

  controls.filters.forEach(filter => {
    filter.addEventListener("change", () => {
      wrap.dataset.page = "1";
      updateStaticTableState(table);
    });
  });

  controls.reset?.addEventListener("click", () => {
    if (controls.search) controls.search.value = "";
    controls.filters.forEach(filter => {
      filter.value = "all";
    });
    wrap.dataset.page = "1";
    updateStaticTableState(table);
  });

  controls.pager?.addEventListener("click", event => {
    const button = event.target.closest("[data-page-target]");
    if (!button || button.disabled) return;
    wrap.dataset.page = button.dataset.pageTarget;
    updateStaticTableState(table);
  });
}

function bindStaticDeleteActions() {
  document.addEventListener("click", async event => {
    const trigger = event.target.closest("[data-static-delete]");
    if (!trigger) return;

    event.preventDefault();

    const row = trigger.closest("tr");
    if (!row) return;

    const confirmed = await window.confirm2(
      trigger.dataset.confirmTitle || "Delete this row?",
      trigger.dataset.confirmText || "Static rows stay fixed in HTML. In Laravel, call your delete route and reload the Yajra table after success."
    );

    if (!confirmed) return;

    window.toast?.("info", "Delete flow ready", "Static HTML data was not changed. Connect this button to a backend delete route later.");
  });
}

function bindConfirmActions() {
  document.addEventListener("click", async event => {
    const trigger = event.target.closest("[data-table-confirm]");
    if (!trigger) return;

    const confirmed = await window.confirm2(
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
      window.toast?.("info", "Static action preview", "Replace this button with a route, form submit, or Ajax call in Blade.");
    }
  });
}

export function initDataTablePage() {
  if (PAGE_NAME && PAGE_NAME !== "tool-table") return;

  document.querySelectorAll("[data-admin-table]").forEach(table => {
    bindStaticTableControls(table);
    updateStaticTableState(table);
  });
  bindTableModals();
  bindStaticRecordForm();
  bindStaticDeleteActions();
  bindConfirmActions();
}
