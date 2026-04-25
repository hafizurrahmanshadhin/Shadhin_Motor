import { initEmployeesPage } from './modules/employees-behavior.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEmployeesPage, { once: true });
} else {
  initEmployeesPage();
}
