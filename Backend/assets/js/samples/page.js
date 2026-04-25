import { initSamplesPage } from './modules/samples-behavior.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSamplesPage, { once: true });
} else {
  initSamplesPage();
}
