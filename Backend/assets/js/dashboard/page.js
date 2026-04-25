import { initDashboardPage } from './modules/controller.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboardPage, { once: true });
} else {
  initDashboardPage();
}
