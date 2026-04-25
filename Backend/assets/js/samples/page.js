import { initSamplesPage } from './modules/controller.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSamplesPage, { once: true });
} else {
  initSamplesPage();
}
