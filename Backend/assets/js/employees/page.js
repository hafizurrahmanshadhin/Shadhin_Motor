import { initEmployeesPage } from './modules/controller.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEmployeesPage, { once: true });
} else {
  initEmployeesPage();
}
