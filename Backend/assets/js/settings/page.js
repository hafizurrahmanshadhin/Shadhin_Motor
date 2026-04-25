import { initSettingsPage } from './modules/controller.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSettingsPage, { once: true });
} else {
  initSettingsPage();
}
