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

function normalizeGalleryFilter(value) {
  return ['all', 'car', 'bike', 'repair'].includes(value) ? value : 'all';
}

export function createGalleryCatalogFilters({
  grid,
  filterButtons,
  modelSelect,
  searchInput,
  resetBtn,
  currentLabelEl,
  countEl
}) {
  let currentFilter = 'all';
  let currentModel = '';
  let currentSearch = '';

  const getItems = () => Array.from(grid.querySelectorAll('.gallery-card-item'));

  const getFilterLabel = filterValue => {
    const button = filterButtons.find(item => item.dataset.filter === filterValue);
    return cleanLeadingIcon(button?.textContent || filterButtons[0]?.textContent || '') || '';
  };

  const getVisibleTriggers = () => {
    return getItems()
      .filter(item => !item.hidden)
      .map(item => item.querySelector('.gallery-card-trigger'))
      .filter(Boolean);
  };

  const updateSummary = () => {
    if (currentLabelEl) currentLabelEl.textContent = getFilterLabel(currentFilter);
    if (countEl) countEl.textContent = String(getVisibleTriggers().length);
  };

  const syncQueryParams = () => {
    replaceCatalogQuery('gallery-all.html', {
      cat: currentFilter === 'all' ? '' : currentFilter,
      model: currentModel,
      q: currentSearch
    });
  };

  const applyFilters = () => {
    const query = currentSearch.trim().toLowerCase();

    getItems().forEach(item => {
      const matchesFilter = currentFilter === 'all' || item.dataset.cat === currentFilter;
      const modelList = (item.dataset.models || '').split('|').filter(Boolean);
      const matchesModel = !currentModel || modelList.includes(currentModel);
      const matchesSearch = !query || (item.dataset.search || '').includes(query);
      item.hidden = !(matchesFilter && matchesModel && matchesSearch);
    });

    syncPressedState(filterButtons, button => button.dataset.filter === currentFilter);
    modelSelect.value = currentModel;
    searchInput.value = currentSearch;
    updateSummary();
    syncQueryParams();
  };

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = normalizeGalleryFilter(button.dataset.filter || 'all');
      applyFilters();
    });
  });

  modelSelect.addEventListener('change', event => {
    currentModel = event.target.value;
    applyFilters();
  });

  searchInput.addEventListener('input', event => {
    currentSearch = event.target.value.trim();
    applyFilters();
  });

  resetBtn.addEventListener('click', () => {
    currentFilter = 'all';
    currentModel = '';
    currentSearch = '';
    applyFilters();
  });

  const initFromSearchParams = params => {
    currentFilter = normalizeGalleryFilter(params.get('cat') || 'all');
    currentModel = params.get('model') || '';
    currentSearch = params.get('q') || '';
    applyFilters();
  };

  return {
    getFilterLabel,
    getVisibleTriggers,
    initFromSearchParams
  };
}
