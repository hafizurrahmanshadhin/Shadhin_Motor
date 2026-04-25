import { initWagesPage } from './modules/controller.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWagesPage, { once: true });
} else {
  initWagesPage();
}
