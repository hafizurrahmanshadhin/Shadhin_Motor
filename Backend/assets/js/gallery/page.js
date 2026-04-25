import { initGalleryPage } from './modules/controller.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGalleryPage, { once: true });
} else {
  initGalleryPage();
}
