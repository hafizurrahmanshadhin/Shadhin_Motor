function normalizeSampleFilter(value) {
  return ['all', 'rexine', 'leather'].includes(value) ? value : 'all';
}

function cleanLeadingIcon(text = '') {
  return String(text || '').replace(/^[^\u0980-\u09FFA-Za-z0-9]+/u, '').trim();
}

function replaceCatalogQuery(basePath, state = {}) {
  const params = new URLSearchParams();

  Object.entries(state).forEach(([key, rawValue]) => {
    if (rawValue === null || rawValue === undefined) return;

    const value = typeof rawValue === 'string'
      ? rawValue.trim()
      : String(rawValue).trim();

    if (!value) return;
    params.set(key, value);
  });

  const query = params.toString();
  history.replaceState(null, '', query ? `${basePath}?${query}` : basePath);
}

function syncPressedState(buttons, isActive) {
  buttons.forEach(button => {
    const active = Boolean(isActive(button));
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
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

  const getFilterLabel = filterValue => {
    const button = filterButtons.find(item => item.dataset.filter === filterValue);
    return cleanLeadingIcon(button?.textContent || filterButtons[0]?.textContent || '') || '';
  };

  const updateCatalogSummary = () => {
    if (countEl) countEl.textContent = String(getVisibleItems().length);
    if (currentLabelEl) currentLabelEl.textContent = getFilterLabel(currentFilter);
  };

  const syncQueryParams = () => {
    replaceCatalogQuery('samples-all.html', {
      material: currentFilter === 'all' ? '' : currentFilter,
      q: currentSearch
    });
  };

  const applyFilters = () => {
    const query = currentSearch.trim().toLowerCase();

    getItems().forEach(item => {
      const matchesFilter = currentFilter === 'all' || item.dataset.material === currentFilter;
      const matchesSearch = !query || (item.dataset.search || '').includes(query);
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
