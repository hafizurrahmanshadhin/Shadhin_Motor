import { createGalleryCatalogFilters } from './filters.js';
import { createGalleryLightbox } from './lightbox.js';

export function initGalleryCatalogPage() {
  const grid = document.getElementById('galleryPageGrid');
  const panel = grid?.closest('.catalog-panel');
  const filterButtons = Array.from(panel?.querySelectorAll('.filter-btn') || []);
  const modelSelect = document.getElementById('catalogModelSelect');
  const perPageSelect = document.getElementById('catalogPerPageSelect');
  const searchInput = document.getElementById('catalogSearchInput');
  const resetBtn = document.getElementById('catalogResetBtn');

  if (!panel || !grid || !modelSelect || !perPageSelect || !searchInput || !resetBtn) return;

  const filters = createGalleryCatalogFilters({
    grid,
    filterButtons,
    modelSelect,
    perPageSelect,
    searchInput,
    resetBtn,
    currentLabelEl: document.getElementById('catalogCurrentLabel'),
    countEl: document.getElementById('catalogCount'),
    displayMetaEl: document.getElementById('catalogDisplayMeta'),
    paginationEl: document.getElementById('catalogPagination'),
    emptyStateEl: document.getElementById('galleryEmptyState')
  });

  createGalleryLightbox({
    grid,
    getVisibleTriggers: filters.getVisibleTriggers,
    getFilterLabel: filters.getFilterLabel
  });

  grid.querySelectorAll('.gallery-card-img').forEach(img => {
    const card = img.closest('.gallery-card');
    const placeholder = card?.querySelector('.gallery-card-placeholder');
    if (!placeholder) return;

    const hidePlaceholder = () => {
      placeholder.style.display = 'none';
      img.style.display = '';
    };

    const showPlaceholder = () => {
      placeholder.style.display = 'flex';
      img.style.display = 'none';
    };

    img.addEventListener('load', hidePlaceholder, { once: true });
    img.addEventListener('error', showPlaceholder, { once: true });

    if (img.complete && img.naturalWidth > 0) hidePlaceholder();
  });

  filters.initFromSearchParams(new URLSearchParams(window.location.search));
}
