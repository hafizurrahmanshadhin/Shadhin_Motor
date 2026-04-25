import { initDataTablePage } from './modules/controller.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDataTablePage, { once: true });
} else {
  initDataTablePage();
}
