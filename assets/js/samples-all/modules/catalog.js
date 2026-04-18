import { createSamplesCatalogFilters } from './filters.js';
import { createSamplesCatalogModal } from './sample-modal.js';

export function initSamplesCatalogPage() {
  const grid = document.getElementById('samplesCatalogGrid');
  const filterButtons = Array.from(document.querySelectorAll('.sample-filter-btn[data-filter]'));
  const searchInput = document.getElementById('samplesCatalogSearchInput');
  const resetBtn = document.getElementById('samplesCatalogResetBtn');
  const uiTextRoot = document.getElementById('samplesCatalogUiText');

  if (!grid || !searchInput || !resetBtn) return;

  const getUiText = key => {
    const value = uiTextRoot?.querySelector(`[data-key="${key}"]`)?.textContent?.trim();
    return value || '';
  };

  const filters = createSamplesCatalogFilters({
    grid,
    filterButtons,
    searchInput,
    resetBtn,
    countEl: document.getElementById('samplesCatalogCount'),
    currentLabelEl: document.getElementById('samplesCatalogCurrentLabel')
  });

  createSamplesCatalogModal({ grid, getUiText });
  filters.initFromSearchParams(new URLSearchParams(window.location.search));
}
