import { renderCatalogTopbar, renderFloatingCta, renderSharedFooter } from './modules/core/page-chrome.js';
import { initGalleryCatalogPage } from './modules/pages/gallery-catalog.js';

renderCatalogTopbar({
  logoHref: 'index.html#gallery',
  backHref: 'index.html#gallery'
});
renderSharedFooter({
  homeHref: 'index.html',
  homeAriaLabel: 'Shadhin Motor হোমপেজে যান',
  sectionBase: 'index.html#',
  creditHref: 'index.html'
});
renderFloatingCta();
initGalleryCatalogPage();
