const PAGE_NAME = window.SMAdmin?.page || document.body?.dataset.page || "";

function resetEmployeeModal() {
  const modal = document.getElementById("moEmp");
  if (!modal) return;

  modal.querySelectorAll("input:not([type='hidden']), textarea").forEach(field => {
    field.value = "";
  });

  modal.querySelectorAll("select").forEach(select => {
    select.selectedIndex = 0;
  });

  modal.querySelectorAll("input[type='hidden']").forEach(field => {
    field.value = "";
  });
}

function openEmpMo(trigger) {
  resetEmployeeModal();
  const titleEl = document.querySelector("#moEmp .modal-title");
  if (titleEl) titleEl.textContent = trigger?.dataset?.employeeModalTitle || "Employee";
  window.SMAdmin?.shell?.openMo?.("moEmp");
}

function saveEmp() {
  window.SMAdmin?.shell?.closeMo?.("moEmp");
  window.SMAdmin?.ui?.toast?.("success", "Employee profile saved", "Static preview only");
}

export function initEmployeesPage() {
  if (PAGE_NAME !== "employees") return;

  document.querySelectorAll("[data-employee-modal]").forEach(button => {
    button.addEventListener("click", () => openEmpMo(button));
  });

  document.querySelector('[data-action="employee-save"]')?.addEventListener("click", saveEmp);

  if (window.location.hash === "#add-employee") {
    openEmpMo(document.querySelector("[data-employee-modal]"));
  }
}
