import { initFinancePage } from './modules/finance-behavior.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFinancePage, { once: true });
} else {
  initFinancePage();
}
