import { createSamplesCatalogFilters } from './filters.js';
import { createSamplesCatalogModal } from './sample-modal.js';

export function initSamplesCatalogPage() {
  const grid = document.getElementById('samplesCatalogGrid');
  const panel = grid?.closest('.samples-catalog-panel');
  const filterButtons = Array.from(panel?.querySelectorAll('.sample-filter-btn[data-filter]') || []);
  const perPageSelect = document.getElementById('samplesCatalogPerPageSelect');
  const searchInput = document.getElementById('samplesCatalogSearchInput');
  const resetBtn = document.getElementById('samplesCatalogResetBtn');
  const uiTextRoot = document.getElementById('samplesCatalogUiText');

  if (!panel || !grid || !perPageSelect || !searchInput || !resetBtn) return;

  const getUiText = key => {
    const value = uiTextRoot?.querySelector(`[data-key="${key}"]`)?.textContent?.trim();
    return value || '';
  };

  const filters = createSamplesCatalogFilters({
    grid,
    filterButtons,
    perPageSelect,
    searchInput,
    resetBtn,
    countEl: document.getElementById('samplesCatalogCount'),
    currentLabelEl: document.getElementById('samplesCatalogCurrentLabel'),
    displayMetaEl: document.getElementById('samplesCatalogDisplayMeta'),
    paginationEl: document.getElementById('samplesCatalogPagination'),
    emptyStateEl: document.getElementById('samplesCatalogEmptyState')
  });

  createSamplesCatalogModal({ grid, getUiText });
  filters.initFromSearchParams(new URLSearchParams(window.location.search));
}
