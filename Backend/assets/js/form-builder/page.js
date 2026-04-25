import { initFormBuilderPage } from './modules/controller.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFormBuilderPage, { once: true });
} else {
  initFormBuilderPage();
}
