/**
 * Gallery catalog page controller.
 *
 * Responsibilities:
 * - normalize gallery data coming from localStorage/admin panel
 * - handle filter/search/model query state
 * - render cards and accessible lightbox navigation
 */
(function () {
  'use strict';

    const siteConfig = window.ShadhinMotorSiteConfig || {};
    const storageKeys = siteConfig.storageKeys || {};
    const GALLERY_STORAGE_KEY = storageKeys.gallery || 'ac_gallery';
    const CAT_LABELS = { car: 'প্রাইভেট কার', bike: 'মোটরসাইকেল', repair: 'রিপেয়ার', all: 'সব' };
    const CAT_ICONS = { car: '🚗', bike: '🏍️', repair: '🔧' };

    const DEFAULT_GALLERY = Array.isArray(siteConfig.defaultGallery)
      ? siteConfig.defaultGallery.map(item => ({ ...item }))
      : [];

    let allGallery = [];
    let currentFilter = 'all';
    let currentModel = '';
    let currentSearch = '';
    let displayedGalleryItems = [];
    let galleryGroupCountMap = new Map();
    let lightboxItems = [];
    let lightboxIdx = 0;
    let lastLightboxTrigger = null;
    const FOCUSABLE_SELECTOR = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    const ACTIVATION_KEYS = new Set(['Enter', ' ']);

    function getValidIndex(rawValue) {
      const idx = Number(rawValue || '-1');
      return Number.isInteger(idx) && idx >= 0 ? idx : null;
    }

    function isActivationKey(event) {
      return ACTIVATION_KEYS.has(event.key);
    }

    function normalizeFilter(value) {
      return ['all', 'car', 'bike', 'repair'].includes(value) ? value : 'all';
    }

    function escapeHTML(value) {
      return String(value ?? '').replace(/[&<>"']/g, char => {
        if (char === '&') return '&amp;';
        if (char === '<') return '&lt;';
        if (char === '>') return '&gt;';
        if (char === '"') return '&quot;';
        return '&#39;';
      });
    }

    function escapeAttr(value) {
      return escapeHTML(value).replace(/`/g, '&#96;');
    }

    function normalizeModels(item) {
      const fromArray = Array.isArray(item.models) ? item.models : [];
      const fromStrings = [item.model, item.vehicleModel]
        .filter(value => typeof value === 'string' && value.trim())
        .flatMap(value => value.split(/[,;|]+/));

      return [...new Set([...fromArray, ...fromStrings]
        .map(value => String(value).trim())
        .filter(Boolean))];
    }

    function normalizeGalleryItem(item, index) {
      const safeCat = ['car', 'bike', 'repair'].includes(item.cat) ? item.cat : 'car';
      return {
        ...item,
        id: item.id || `G${index + 1}`,
        title: item.title || item.name || `${CAT_LABELS[safeCat]} ডিজাইন ${String(index + 1).padStart(2, '0')}`,
        desc: item.desc || item.description || 'ডিটেইল দেখতে ক্লিক করুন',
        cat: safeCat,
        img: typeof item.img === 'string' ? item.img : '',
        models: normalizeModels(item),
      };
    }

    function getPrimaryModel(item) {
      return Array.isArray(item.models) && item.models.length ? String(item.models[0]).trim() : '';
    }

    function getGroupLabel(item) {
      const explicit = [item.groupLabel, item.galleryGroup, item.groupKey]
        .find(value => typeof value === 'string' && value.trim());
      return explicit ? explicit.trim() : (getPrimaryModel(item) || item.title);
    }

    function getGroupKey(item) {
      return getGroupLabel(item).toLowerCase();
    }

    function buildGroupCountMap(items) {
      const map = new Map();
      items.forEach(item => {
        const key = getGroupKey(item);
        map.set(key, (map.get(key) || 0) + 1);
      });
      return map;
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

    function getSearchText(item) {
      return [
        item.title,
        item.desc,
        CAT_LABELS[item.cat] || item.cat,
        ...(Array.isArray(item.models) ? item.models : []),
      ].join(' ').toLowerCase();
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
      const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
      try {
        const parsed = stored ? JSON.parse(stored) : DEFAULT_GALLERY;
        const storedItems = Array.isArray(parsed) ? parsed.map(normalizeGalleryItem) : [];
        const hasStoredImages = storedItems.some(item => item.img.trim());
        allGallery = hasStoredImages ? storedItems : DEFAULT_GALLERY.map(normalizeGalleryItem);
      } catch {
        allGallery = DEFAULT_GALLERY.map(normalizeGalleryItem);
      }
      renderGalleryPage();
    }

    function getFilteredGallery() {
      const q = currentSearch.trim().toLowerCase();
      return getCategoryScopedGallery().filter(item => {
        const matchModel = !currentModel || (Array.isArray(item.models) && item.models.includes(currentModel));
        const matchSearch = !q || getSearchText(item).includes(q);
        return matchModel && matchSearch;
      });
    }

    function setFilter(nextFilter) {
      currentFilter = normalizeFilter(nextFilter);
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
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const firstFocusable = overlay.querySelector(FOCUSABLE_SELECTOR);
      if (firstFocusable) firstFocusable.focus();
    }

    function closeLightbox(event) {
      const overlay = document.getElementById('lightboxOverlay');
      if (!overlay) return;
      if (event && event.target !== overlay) return;

      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
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
    document.getElementById('lightboxPrevBtn')?.addEventListener('click', () => lightboxNav(-1));
    document.getElementById('lightboxNextBtn')?.addEventListener('click', () => lightboxNav(+1));
    document.getElementById('lightboxCloseBtn')?.addEventListener('click', () => closeLightbox());

    document.addEventListener('keydown', (event) => {
      if (!document.getElementById('lightboxOverlay').classList.contains('open')) return;
      if (event.key === 'ArrowRight') lightboxNav(+1);
      if (event.key === 'ArrowLeft') lightboxNav(-1);
      if (event.key === 'Escape') closeLightbox();
    });

    const initialParams = new URLSearchParams(window.location.search);
    currentFilter = normalizeFilter(initialParams.get('cat') || 'all');
    currentModel = initialParams.get('model') || '';
    currentSearch = initialParams.get('q') || '';
    document.getElementById('catalogSearchInput').value = currentSearch;
    loadGallery();

  })();


