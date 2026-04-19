import { initSamplesCatalogPage } from './modules/catalog.js';
import { initSharedExperience } from '../shared/experience.js';
import { initPageLocalization } from '../shared/i18n.js';

function scheduleAccessibilityTools() {
  const load = () => import('../shared/accessibility-tools.js').catch(() => {});

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(load, { timeout: 1200 });
  } else {
    window.addEventListener('load', load, { once: true });
  }
}

if (document.body?.classList.contains('samples-catalog-page')) {
  initPageLocalization('samples-catalog');
  initSharedExperience();
  scheduleAccessibilityTools();
  initSamplesCatalogPage();
}
