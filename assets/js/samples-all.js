import { renderCatalogTopbar, renderFloatingCta, renderSharedFooter } from './modules/core/page-chrome.js';
import { initSamplesCatalogPage } from './modules/pages/samples-catalog.js';

renderCatalogTopbar({
  variant: 'samples',
  logoHref: 'index.html#samples',
  backHref: 'index.html#samples'
});
renderSharedFooter({
  homeHref: 'index.html',
  homeAriaLabel: 'Shadhin Motor হোমপেজে যান',
  sectionBase: 'index.html#',
  creditHref: 'index.html'
});
renderFloatingCta();
initSamplesCatalogPage();
