/**
 * Gallery catalog page controller.
 *
 * Responsibilities:
 * - normalize gallery data coming from localStorage/admin panel
 * - handle filter/search/model query state
 * - render cards and accessible lightbox navigation
 */
import { escapeAttr, escapeHTML, FOCUSABLE_SELECTOR, isActivationKey } from '../core/dom-helpers.js';
import {
  buildGroupCountMap,
  CAT_ICONS,
  CAT_LABELS,
  getGallerySearchText,
  getGroupKey,
  getGroupLabel,
  loadGalleryFromStorage,
  normalizeGalleryFilter
} from '../data/gallery-store.js';

function openDialogModal(dialog) {
  if (!dialog) return;

  if (typeof dialog.showModal === 'function' && !dialog.open) {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }

  dialog.classList.add('open');
}

function closeDialogModal(dialog) {
  if (!dialog) return;

  dialog.classList.remove('open');

  if (typeof dialog.close === 'function' && dialog.open) {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
}

export function initGalleryCatalogPage() {
    let allGallery = [];
    let currentFilter = 'all';
    let currentModel = '';
    let currentSearch = '';
    let displayedGalleryItems = [];
    let galleryGroupCountMap = new Map();
    let lightboxItems = [];
    let lightboxIdx = 0;
    let lastLightboxTrigger = null;

    function getValidIndex(rawValue) {
      const idx = Number(rawValue || '-1');
      return Number.isInteger(idx) && idx >= 0 ? idx : null;
    }

    function getRelatedGroupItems(item) {
      // When multiple photos belong to one model group, keep lightbox navigation scoped to that group.
      const key = getGroupKey(item);
      const related = allGallery.filter(candidate => candidate.cat === item.cat && getGroupKey(candidate) === key);
      return related.length ? related : [item];
    }

    function getCategoryScopedGallery() {
      return currentFilter === 'all' ? allGallery : allGallery.filter(item => item.cat === currentFilter);
    }

    function getAvailableModels(items) {
      return [...new Set(items.flatMap(item => Array.isArray(item.models) ? item.models : []))]
        .sort((a, b) => a.localeCompare(b, 'bn'));
    }

    function populateModelOptions(items) {
      const select = document.getElementById('catalogModelSelect');
      const models = getAvailableModels(items);

      if (currentModel && !models.includes(currentModel)) {
        currentModel = '';
      }

      select.innerHTML = ['<option value="">সব মডেল</option>', ...models.map(model =>
        `<option value="${escapeAttr(model)}">${escapeHTML(model)}</option>`)].join('');
      select.value = currentModel;
    }

    function syncQueryParams() {
      const params = new URLSearchParams();
      if (currentFilter !== 'all') params.set('cat', currentFilter);
      if (currentModel) params.set('model', currentModel);
      if (currentSearch) params.set('q', currentSearch);
      const query = params.toString();
      history.replaceState(null, '', query ? `gallery-all.html?${query}` : 'gallery-all.html');
    }

    function loadGallery() {
      allGallery = loadGalleryFromStorage(localStorage);
      renderGalleryPage();
    }

    function getFilteredGallery() {
      const q = currentSearch.trim().toLowerCase();
      return getCategoryScopedGallery().filter(item => {
        const matchModel = !currentModel || (Array.isArray(item.models) && item.models.includes(currentModel));
        const matchSearch = !q || getGallerySearchText(item).includes(q);
        return matchModel && matchSearch;
      });
    }

    function setFilter(nextFilter) {
      currentFilter = normalizeGalleryFilter(nextFilter);
      renderGalleryPage();
    }

    function renderGalleryPage() {
      const grid = document.getElementById('galleryPageGrid');
      const categoryScoped = getCategoryScopedGallery();
      galleryGroupCountMap = buildGroupCountMap(categoryScoped);
      populateModelOptions(categoryScoped);
      const filtered = getFilteredGallery();
      displayedGalleryItems = filtered;
      syncQueryParams();

      document.querySelectorAll('.filter-btn').forEach(btn => {
        const isActive = btn.dataset.filter === currentFilter;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });

      document.getElementById('catalogCurrentLabel').textContent = CAT_LABELS[currentFilter] || 'সব';
      document.getElementById('catalogCount').textContent = filtered.length;

      if (!filtered.length) {
        grid.innerHTML = `<div class="gallery-empty">
          <span class="gallery-empty-icon">📷</span>
          <p>এই ক্যাটাগরিতে এখনো কোনো ডিজাইন যোগ করা হয়নি।</p>
        </div>`;
        return;
      }

      grid.innerHTML = filtered.map((item, idx) => galleryCard(item, idx)).join('');
      bindGalleryCardInteractions(grid);
      bindGalleryCardImages(grid);
    }

    function bindGalleryCardInteractions(root) {
      if (!root) return;

      root.querySelectorAll('.gallery-card[data-gallery-index]').forEach(card => {
        card.addEventListener('click', () => {
          const idx = getValidIndex(card.dataset.galleryIndex);
          if (idx === null) return;
          openLightbox(idx, card);
        });

        card.addEventListener('keydown', event => {
          if (!isActivationKey(event)) return;
          event.preventDefault();

          const idx = getValidIndex(card.dataset.galleryIndex);
          if (idx === null) return;
          openLightbox(idx, card);
        });
      });
    }

    function bindGalleryCardImages(root) {
      if (!root) return;

      root.querySelectorAll('.gallery-card-img').forEach(img => {
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
    }

    function galleryCard(item, idx) {
      const catLabel = CAT_LABELS[item.cat] || item.cat;
      const catIcon = CAT_ICONS[item.cat] || '📷';
      const groupCount = galleryGroupCountMap.get(getGroupKey(item)) || 1;
      const groupBadge = groupCount > 1 ? `<div class="gallery-card-group-badge">${groupCount} ছবি</div>` : '';
      const safeCatLabel = escapeHTML(catLabel);
      const safeTitle = escapeHTML(item.title);
      const safeDesc = escapeHTML(item.desc || 'ডিটেইল দেখতে ক্লিক করুন');
      const safeAriaLabel = escapeAttr(`${catLabel}: ${item.title}`);
      const modelPills = Array.isArray(item.models) && item.models.length
        ? `<div class="gallery-card-models">${item.models.map(model => `<span class="gallery-card-model-pill">${escapeHTML(model)}</span>`).join('')}</div>`
        : '';
      const imageHtml = item.img
        ? `<img class="gallery-card-img" src="${escapeAttr(item.img)}" alt="${escapeAttr(item.title)}" loading="lazy" decoding="async">`
        : '';

      return `<article class="gallery-card" data-cat="${item.cat}" data-gallery-index="${idx}" role="button" tabindex="0" aria-label="${safeAriaLabel}">
        ${imageHtml}
        ${groupBadge}
        <div class="gallery-card-placeholder">
          <span class="gallery-card-placeholder-icon">${catIcon}</span>
          <span class="gallery-card-placeholder-label">${safeCatLabel}</span>
        </div>
        <div class="gallery-card-overlay">
          <div class="gallery-card-cat">${safeCatLabel}</div>
          <h3 class="gallery-card-title">${safeTitle}</h3>
          ${modelPills}
          <p class="gallery-card-desc">${safeDesc}</p>
        </div>
      </article>`;
    }

    function openLightbox(idx, triggerEl = null) {
      const sourceItem = displayedGalleryItems[idx];
      if (!sourceItem) return;
      lastLightboxTrigger = triggerEl instanceof HTMLElement
        ? triggerEl
        : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
      lightboxItems = getRelatedGroupItems(sourceItem);
      lightboxIdx = Math.max(0, lightboxItems.findIndex(item => item.id === sourceItem.id));
      renderLightbox();
      const overlay = document.getElementById('lightboxOverlay');
      if (!overlay) return;
      openDialogModal(overlay);
      const firstFocusable = overlay.querySelector(FOCUSABLE_SELECTOR);
      if (firstFocusable) firstFocusable.focus();
    }

    function closeLightbox(event) {
      const overlay = document.getElementById('lightboxOverlay');
      if (!overlay) return;
      if (event && event.target !== overlay) return;

      closeDialogModal(overlay);
      if (lastLightboxTrigger) lastLightboxTrigger.focus();
    }

    function lightboxNav(dir) {
      if (!lightboxItems.length) return;
      lightboxIdx = (lightboxIdx + dir + lightboxItems.length) % lightboxItems.length;
      renderLightbox();
    }

    function renderLightbox() {
      const item = lightboxItems[lightboxIdx];
      if (!item) return;

      document.getElementById('lightboxCat').textContent = [CAT_LABELS[item.cat] || item.cat, getGroupLabel(item)].filter(Boolean).join(' · ');
      document.getElementById('lightboxTitle').textContent = item.title;
      document.getElementById('lightboxCounter').textContent = `${lightboxIdx + 1} / ${lightboxItems.length}`;

      const wrap = document.getElementById('lightboxImgWrap');
      if (item.img) {
        wrap.innerHTML = `<img src="${escapeAttr(item.img)}" alt="${escapeAttr(item.title)}">`;
        const image = wrap.querySelector('img');
        if (image) {
          image.addEventListener('error', () => {
            wrap.innerHTML = `<div class="lightbox-placeholder-full">
          <span>${CAT_ICONS[item.cat] || '📷'}</span>
          <small style="font-size:14px;color:var(--cream-dim)">${escapeHTML(item.title)}</small>
        </div>`;
          }, { once: true });
        }
      } else {
        wrap.innerHTML = `<div class="lightbox-placeholder-full">
          <span>${CAT_ICONS[item.cat] || '📷'}</span>
          <small style="font-size:14px;color:var(--cream-dim)">${escapeHTML(item.title)}</small>
        </div>`;
      }
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });

    document.getElementById('catalogModelSelect').addEventListener('change', (event) => {
      currentModel = event.target.value;
      renderGalleryPage();
    });

    document.getElementById('catalogSearchInput').addEventListener('input', (event) => {
      currentSearch = event.target.value.trim();
      renderGalleryPage();
    });

    document.getElementById('catalogResetBtn').addEventListener('click', () => {
      currentModel = '';
      currentSearch = '';
      document.getElementById('catalogSearchInput').value = '';
      renderGalleryPage();
    });

    const lightboxOverlay = document.getElementById('lightboxOverlay');
    lightboxOverlay?.addEventListener('click', event => {
      if (event.target === lightboxOverlay) closeLightbox(event);
    });
    lightboxOverlay?.addEventListener('cancel', event => {
      event.preventDefault();
      closeLightbox();
    });
    document.getElementById('lightboxPrevBtn')?.addEventListener('click', () => lightboxNav(-1));
    document.getElementById('lightboxNextBtn')?.addEventListener('click', () => lightboxNav(+1));
    document.getElementById('lightboxCloseBtn')?.addEventListener('click', () => closeLightbox());

    document.addEventListener('keydown', (event) => {
      if (!document.getElementById('lightboxOverlay').classList.contains('open')) return;
      if (event.key === 'ArrowRight') lightboxNav(+1);
      if (event.key === 'ArrowLeft') lightboxNav(-1);
    });

    const initialParams = new URLSearchParams(window.location.search);
    currentFilter = normalizeGalleryFilter(initialParams.get('cat') || 'all');
    currentModel = initialParams.get('model') || '';
    currentSearch = initialParams.get('q') || '';
    document.getElementById('catalogSearchInput').value = currentSearch;
    loadGallery();
}


