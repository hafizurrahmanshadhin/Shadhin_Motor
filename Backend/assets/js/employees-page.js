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
  openMo("moEmp");
}

function saveEmp() {
  closeMo("moEmp");
  toast("success", "Employee profile saved", "Static preview only");
}

function initEmployeesPage() {
  if (PAGE !== "employees") return;

  document.querySelectorAll("[data-employee-modal]").forEach(button => {
    button.addEventListener("click", () => openEmpMo(button));
  });

  document.querySelector('[data-action="employee-save"]')?.addEventListener("click", saveEmp);

  if (window.location.hash === "#add-employee") {
    openEmpMo(document.querySelector("[data-employee-modal]"));
  }
}

document.addEventListener("DOMContentLoaded", initEmployeesPage);

window.openEmpMo = openEmpMo;
window.saveEmp = saveEmp;
