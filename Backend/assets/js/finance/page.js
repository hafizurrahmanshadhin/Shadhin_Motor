import { initFinancePage } from './modules/controller.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFinancePage, { once: true });
} else {
  initFinancePage();
}
