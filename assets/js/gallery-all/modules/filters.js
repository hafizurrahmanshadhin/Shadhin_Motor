import { cleanLeadingIcon, replaceUrlState, syncPressedState } from '../../shared/page-helpers.js';

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

  const normalizeModelValue = value => String(value || '').trim().toLowerCase();
  const getItemSearchText = item => {
    const explicitSearch = String(item.dataset.search || '').trim();
    const fallbackSearch = item.textContent || '';
    return (explicitSearch || fallbackSearch).toLowerCase();
  };
  const getItemModelList = item => {
    const explicitModels = String(item.dataset.models || '')
      .split('|')
      .map(value => normalizeModelValue(value))
      .filter(Boolean);

    if (explicitModels.length) {
      return explicitModels;
    }

    return Array.from(item.querySelectorAll('.gallery-card-model-pill'))
      .map(node => normalizeModelValue(node.textContent || ''))
      .filter(Boolean);
  };
  const resolveModelValue = value => {
    const normalizedValue = normalizeModelValue(value);
    if (!normalizedValue) return '';

    const matchedOption = Array.from(modelSelect.options).find(option => {
      return normalizeModelValue(option.value) === normalizedValue;
    });

    return matchedOption?.value || '';
  };

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
    replaceUrlState(window.location.href, {
      cat: currentFilter === 'all' ? '' : currentFilter,
      model: currentModel,
      q: currentSearch
    });
  };

  const applyFilters = () => {
    const query = currentSearch.trim().toLowerCase();
    const normalizedModel = resolveModelValue(currentModel);

    getItems().forEach(item => {
      const matchesFilter = currentFilter === 'all' || item.dataset.cat === currentFilter;
      const modelList = getItemModelList(item);
      const matchesModel = !normalizedModel || modelList.includes(normalizeModelValue(normalizedModel));
      const matchesSearch = !query || getItemSearchText(item).includes(query);
      item.hidden = !(matchesFilter && matchesModel && matchesSearch);
    });

    syncPressedState(filterButtons, button => button.dataset.filter === currentFilter);
    modelSelect.value = normalizedModel;
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
    currentModel = resolveModelValue(event.target.value);
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
    currentModel = resolveModelValue(params.get('model') || '');
    currentSearch = params.get('q') || '';
    applyFilters();
  };

  return {
    getFilterLabel,
    getVisibleTriggers,
    initFromSearchParams
  };
}
