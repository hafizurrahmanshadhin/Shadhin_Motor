import { cleanLeadingIcon, replaceUrlState, syncPressedState } from '../../shared/page-helpers.js';

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function normalizeSampleFilter(value) {
  return ['all', 'rexine', 'leather'].includes(value) ? value : 'all';
}

function normalizePositiveInteger(value, fallback = 1) {
  const parsedValue = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function normalizePerPageValue(value) {
  const parsedValue = normalizePositiveInteger(value, PER_PAGE_OPTIONS[0]);
  return PER_PAGE_OPTIONS.includes(parsedValue) ? parsedValue : PER_PAGE_OPTIONS[0];
}

function buildPageTokens(totalPages, currentPage) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}

export function createSamplesCatalogFilters({
  grid,
  filterButtons,
  perPageSelect,
  searchInput,
  resetBtn,
  countEl,
  currentLabelEl,
  displayMetaEl,
  paginationEl,
  emptyStateEl
}) {
  const items = Array.from(grid.querySelectorAll('.sample-card-item'));

  let currentFilter = 'all';
  let currentSearch = '';
  let currentPage = 1;
  let currentPerPage = PER_PAGE_OPTIONS[0];
  let filteredCount = items.length;

  const getItemSearchText = item => {
    const explicitSearch = String(item.dataset.search || '').trim();
    const fallbackSearch = item.textContent || '';
    return (explicitSearch || fallbackSearch).toLowerCase();
  };

  const getFilterLabel = filterValue => {
    const button = filterButtons.find(item => item.dataset.filter === filterValue);
    return cleanLeadingIcon(button?.textContent || filterButtons[0]?.textContent || '') || '';
  };

  const updateCatalogSummary = total => {
    if (countEl) countEl.textContent = String(total);
    if (currentLabelEl) currentLabelEl.textContent = getFilterLabel(currentFilter);
  };

  const updateDisplayMeta = (total, from, to) => {
    if (!displayMetaEl) return;

    if (!total) {
      displayMetaEl.textContent = 'কোনো স্যাম্পল পাওয়া যায়নি';
      return;
    }

    if (total <= currentPerPage) {
      displayMetaEl.textContent = `মোট ${total} টি স্যাম্পল দেখানো হচ্ছে`;
      return;
    }

    displayMetaEl.textContent = `${from}-${to} টি দেখানো হচ্ছে, মোট ${total}`;
  };

  const createPaginationButton = ({
    label,
    page,
    action,
    disabled = false,
    isActive = false
  }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'samples-catalog-page-btn';
    button.textContent = label;
    button.disabled = disabled;

    if (page) {
      button.dataset.page = String(page);
      button.setAttribute('aria-label', `পেজ ${page}`);
    }

    if (action) {
      button.dataset.action = action;
      button.setAttribute('aria-label', action === 'prev' ? 'আগের পেজ' : 'পরের পেজ');
    }

    if (isActive) {
      button.classList.add('active');
      button.setAttribute('aria-current', 'page');
    }

    return button;
  };

  const renderPagination = totalPages => {
    if (!paginationEl) return;

    if (!filteredCount || totalPages <= 1) {
      paginationEl.hidden = true;
      paginationEl.replaceChildren();
      return;
    }

    paginationEl.hidden = false;
    const tokens = buildPageTokens(totalPages, currentPage);
    const controls = [];

    controls.push(createPaginationButton({
      label: '‹',
      action: 'prev',
      disabled: currentPage <= 1
    }));

    tokens.forEach(token => {
      if (token === 'ellipsis') {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'samples-catalog-page-ellipsis';
        ellipsis.textContent = '…';
        controls.push(ellipsis);
        return;
      }

      controls.push(createPaginationButton({
        label: String(token),
        page: token,
        isActive: token === currentPage
      }));
    });

    controls.push(createPaginationButton({
      label: '›',
      action: 'next',
      disabled: currentPage >= totalPages
    }));

    paginationEl.replaceChildren(...controls);
  };

  const syncQueryParams = () => {
    replaceUrlState(window.location.href, {
      material: currentFilter === 'all' ? '' : currentFilter,
      q: currentSearch,
      page: currentPage > 1 ? String(currentPage) : '',
      perPage: currentPerPage !== PER_PAGE_OPTIONS[0] ? String(currentPerPage) : ''
    });
  };

  const applyFilters = () => {
    const query = currentSearch.trim().toLowerCase();
    const filteredItems = items.filter(item => {
      const matchesFilter = currentFilter === 'all' || item.dataset.material === currentFilter;
      const matchesSearch = !query || getItemSearchText(item).includes(query);
      return matchesFilter && matchesSearch;
    });

    filteredCount = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(filteredCount / currentPerPage));
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    const startIndex = (currentPage - 1) * currentPerPage;
    const endIndex = startIndex + currentPerPage;
    const pageItems = filteredItems.slice(startIndex, endIndex);
    const visibleItems = new Set(pageItems);

    items.forEach(item => {
      item.hidden = !visibleItems.has(item);
    });

    syncPressedState(filterButtons, button => button.dataset.filter === currentFilter);
    perPageSelect.value = String(currentPerPage);
    searchInput.value = currentSearch;

    if (emptyStateEl) {
      emptyStateEl.hidden = filteredCount > 0;
    }

    updateCatalogSummary(filteredCount);
    updateDisplayMeta(
      filteredCount,
      filteredCount ? startIndex + 1 : 0,
      filteredCount ? Math.min(endIndex, filteredCount) : 0
    );
    renderPagination(totalPages);
    syncQueryParams();
  };

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = normalizeSampleFilter(button.dataset.filter || 'all');
      currentPage = 1;
      applyFilters();
    });
  });

  perPageSelect.addEventListener('change', event => {
    currentPerPage = normalizePerPageValue(event.target.value);
    currentPage = 1;
    applyFilters();
  });

  searchInput.addEventListener('input', event => {
    currentSearch = event.target.value.trim();
    currentPage = 1;
    applyFilters();
  });

  resetBtn.addEventListener('click', () => {
    currentFilter = 'all';
    currentSearch = '';
    currentPage = 1;
    applyFilters();
  });

  paginationEl?.addEventListener('click', event => {
    const button = event.target instanceof Element
      ? event.target.closest('.samples-catalog-page-btn')
      : null;

    if (!(button instanceof HTMLButtonElement) || button.disabled) return;

    if (button.dataset.action === 'prev') {
      currentPage = Math.max(1, currentPage - 1);
      applyFilters();
      return;
    }

    if (button.dataset.action === 'next') {
      currentPage += 1;
      applyFilters();
      return;
    }

    currentPage = normalizePositiveInteger(button.dataset.page, currentPage);
    applyFilters();
  });

  const initFromSearchParams = params => {
    currentFilter = normalizeSampleFilter(params.get('material') || 'all');
    currentSearch = String(params.get('q') || '').trim();
    currentPage = normalizePositiveInteger(params.get('page') || 1, 1);
    currentPerPage = normalizePerPageValue(params.get('perPage') || PER_PAGE_OPTIONS[0]);
    applyFilters();
  };

  return {
    initFromSearchParams
  };
}
