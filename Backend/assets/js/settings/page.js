import { initSettingsPage } from './modules/settings-behavior.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSettingsPage, { once: true });
} else {
  initSettingsPage();
}
