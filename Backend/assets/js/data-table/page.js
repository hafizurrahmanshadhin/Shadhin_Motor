import { initDataTablePage } from './modules/data-table-behavior.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDataTablePage, { once: true });
} else {
  initDataTablePage();
}
