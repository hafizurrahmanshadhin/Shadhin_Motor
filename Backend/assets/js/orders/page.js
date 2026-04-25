import { initOrdersPage } from './modules/controller.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initOrdersPage, { once: true });
} else {
  initOrdersPage();
}
