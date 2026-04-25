import { initGalleryPage } from './modules/gallery-behavior.js';

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGalleryPage, { once: true });
} else {
  initGalleryPage();
}
