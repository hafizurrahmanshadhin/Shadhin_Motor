import { initGalleryCatalogPage } from './modules/catalog.js';

function scheduleAccessibilityTools() {
  const load = () => import('../shared/accessibility-tools.js').catch(() => {});

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(load, { timeout: 1200 });
  } else {
    window.addEventListener('load', load, { once: true });
  }
}

if (document.body?.classList.contains('gallery-catalog-page')) {
  scheduleAccessibilityTools();
  initGalleryCatalogPage();
}
