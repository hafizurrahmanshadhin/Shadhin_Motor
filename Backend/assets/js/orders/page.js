import { initOrdersPage } from './modules/orders-behavior.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initOrdersPage, { once: true });
} else {
  initOrdersPage();
}
