import { initFormBuilderPage } from './modules/form-builder-behavior.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFormBuilderPage, { once: true });
} else {
  initFormBuilderPage();
}
