import { renderFloatingCta, renderSharedFooter } from './modules/core/page-chrome.js';
import { initHomePage } from './modules/pages/home.js';

renderSharedFooter({
  homeHref: '#hero',
  homeAriaLabel: 'Shadhin Motor হোম সেকশনে যান',
  sectionBase: '#',
  creditHref: '#hero'
});
renderFloatingCta();
initHomePage();
