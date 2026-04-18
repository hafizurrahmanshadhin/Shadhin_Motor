import { cleanLeadingIcon, replaceUrlState, syncPressedState } from '../../shared/page-helpers.js';

function normalizeSampleFilter(value) {
  return ['all', 'rexine', 'leather'].includes(value) ? value : 'all';
}

export function createSamplesCatalogFilters({
  grid,
  filterButtons,
  searchInput,
  resetBtn,
  countEl,
  currentLabelEl
}) {
  let currentFilter = 'all';
  let currentSearch = '';

  const getItems = () => Array.from(grid.querySelectorAll('.sample-card-item'));
  const getVisibleItems = () => getItems().filter(item => !item.hidden);
  const getItemSearchText = item => {
    const explicitSearch = String(item.dataset.search || '').trim();
    const fallbackSearch = item.textContent || '';
    return (explicitSearch || fallbackSearch).toLowerCase();
  };

  const getFilterLabel = filterValue => {
    const button = filterButtons.find(item => item.dataset.filter === filterValue);
    return cleanLeadingIcon(button?.textContent || filterButtons[0]?.textContent || '') || '';
  };

  const updateCatalogSummary = () => {
    if (countEl) countEl.textContent = String(getVisibleItems().length);
    if (currentLabelEl) currentLabelEl.textContent = getFilterLabel(currentFilter);
  };

  const syncQueryParams = () => {
    replaceUrlState(window.location.href, {
      material: currentFilter === 'all' ? '' : currentFilter,
      q: currentSearch
    });
  };

  const applyFilters = () => {
    const query = currentSearch.trim().toLowerCase();

    getItems().forEach(item => {
      const matchesFilter = currentFilter === 'all' || item.dataset.material === currentFilter;
      const matchesSearch = !query || getItemSearchText(item).includes(query);
      item.hidden = !(matchesFilter && matchesSearch);
    });

    syncPressedState(filterButtons, button => button.dataset.filter === currentFilter);
    searchInput.value = currentSearch;
    updateCatalogSummary();
    syncQueryParams();
  };

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = normalizeSampleFilter(button.dataset.filter || 'all');
      applyFilters();
    });
  });

  searchInput.addEventListener('input', event => {
    currentSearch = event.target.value.trim();
    applyFilters();
  });

  resetBtn.addEventListener('click', () => {
    currentFilter = 'all';
    currentSearch = '';
    applyFilters();
  });

  const initFromSearchParams = params => {
    currentFilter = normalizeSampleFilter(params.get('material') || 'all');
    currentSearch = params.get('q') || '';
    applyFilters();
  };

  return {
    initFromSearchParams
  };
}
