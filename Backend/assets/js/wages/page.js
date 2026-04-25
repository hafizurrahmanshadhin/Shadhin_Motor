import { initWagesPage } from './modules/wages-behavior.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWagesPage, { once: true });
} else {
  initWagesPage();
}
