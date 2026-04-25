import { initDashboardPage } from './modules/dashboard-behavior.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboardPage, { once: true });
} else {
  initDashboardPage();
}
