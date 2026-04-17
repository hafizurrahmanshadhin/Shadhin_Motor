import { escapeAttr, escapeHTML } from '../core/dom-helpers.js';
import { loadGalleryFromStorage } from '../data/gallery-store.js';

const CAT_LABELS = Object.freeze({
  car: 'প্রাইভেট কার',
  bike: 'মোটরসাইকেল',
  repair: 'রিপেয়ার'
});

const CAT_ICONS = Object.freeze({
  car: '🚗',
  bike: '🏍️',
  repair: '🔧'
});

export function initHomeGallery({
  openDialog,
  closeDialog,
  focusWithoutScroll,
  restoreFocus,
  captureViewportPosition,
  scheduleViewportRestore,
  syncBodyScrollLockState
}) {
  let allGallery = [];
  let galleryFilter = 'all';
  let lightboxItems = [];
  let lightboxIdx = 0;
  let lastLightboxTrigger = null;
  let lightboxViewport = null;
  let galleryResizeFrame = 0;
  let galleryMotionRaf = 0;
  let galleryMotionLastTs = 0;
  let galleryMotionOffset = 0;
  let galleryMotionCycle = 0;
  let galleryHovered = false;
  let galleryDragging = false;
  let galleryDragMoved = false;
  let galleryPointerDown = false;
  let galleryPointerId = null;
  let galleryDragStartX = 0;
  let galleryDragStartOffset = 0;
  let gallerySuppressClick = false;

  const galleryMotionSpeed = 34;

  function loadGallery() {
    allGallery = loadGalleryFromStorage(localStorage);
    renderGallery();
  }

  function setActiveGalleryFilterButton(filterValue) {
    document.querySelectorAll('[data-gallery-filter]').forEach(button => {
      const isActive = button.dataset.galleryFilter === filterValue;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function filterGallery(category, button) {
    galleryFilter = category;
    if (button) setActiveGalleryFilterButton(button.dataset.galleryFilter || category);
    else setActiveGalleryFilterButton(category);
    renderGallery();
  }

  function getFilteredGallery() {
    return galleryFilter === 'all'
      ? allGallery
      : allGallery.filter(item => item.cat === galleryFilter);
  }

  function renderGallery() {
    const filtered = getFilteredGallery();
    const grid = document.getElementById('galleryGrid');

    lightboxItems = filtered;
    setActiveGalleryFilterButton(galleryFilter);

    if (!grid) return;

    if (!filtered.length) {
      grid.innerHTML = `<li class="gallery-empty">
      <span class="gallery-empty-icon">📷</span>
      <p>এই ক্যাটাগরিতে কোনো ছবি নেই।</p>
    </li>`;
      updateGalleryCount(0);
      return;
    }

    const primaryGroup = `<ul class="gallery-marquee-group" role="list">${filtered.map((item, index) => galleryCard(item, index)).join('')}</ul>`;
    const duplicateGroup = filtered.length > 1
      ? `<ul class="gallery-marquee-group" aria-hidden="true">${filtered.map((item, index) => galleryCard(item, index)).join('')}</ul>`
      : '';

    grid.innerHTML = `<li class="gallery-marquee-shell-item">
      <div class="gallery-marquee-shell">
        <div class="gallery-marquee-viewport">
          <div class="gallery-marquee-track" id="galleryMarqueeTrack">
            ${primaryGroup}
            ${duplicateGroup}
          </div>
        </div>
      </div>
    </li>`;

    updateGalleryCount(filtered.length);
    syncGalleryMarquee();
    bindGalleryCardAccessibility(grid);
    bindGalleryCardImages(grid);
  }

  function updateGalleryCount(total) {
    const countEl = document.getElementById('galleryTotalCount');
    if (countEl) countEl.textContent = total;
    updateGalleryViewAllLink();
  }

  function updateGalleryViewAllLink() {
    const viewAllBtn = document.getElementById('galleryViewAllBtn');
    if (!viewAllBtn) return;
    viewAllBtn.href = `gallery-all.html?cat=${encodeURIComponent(galleryFilter)}`;
  }

  function destroyGalleryMotion() {
    cancelAnimationFrame(galleryMotionRaf);
    galleryMotionRaf = 0;
    galleryMotionLastTs = 0;
  }

  function syncGalleryMarquee() {
    const track = document.getElementById('galleryMarqueeTrack');
    destroyGalleryMotion();
    if (!track) return;

    const groups = track.querySelectorAll('.gallery-marquee-group');
    if (groups.length < 2 || lightboxItems.length < 2) {
      galleryMotionCycle = 0;
      galleryMotionOffset = 0;
      bindGalleryInteractions();
      applyGalleryOffset();
      return;
    }

    const computedStyle = getComputedStyle(track);
    const gap = parseFloat(computedStyle.gap || computedStyle.columnGap || 18) || 18;
    const groupWidth = groups[0].scrollWidth;

    galleryMotionCycle = groupWidth + gap;
    galleryMotionOffset = normalizeGalleryOffset(galleryMotionOffset);
    bindGalleryInteractions();
    applyGalleryOffset();
    startGalleryMotion();
  }

  function normalizeGalleryOffset(offset) {
    if (!galleryMotionCycle) return 0;

    let nextOffset = offset % galleryMotionCycle;
    if (nextOffset < 0) nextOffset += galleryMotionCycle;
    return nextOffset;
  }

  function applyGalleryOffset() {
    const track = document.getElementById('galleryMarqueeTrack');
    if (!track) return;
    track.style.transform = `translate3d(${-galleryMotionOffset}px, 0, 0)`;
  }

  function startGalleryMotion() {
    if (!galleryMotionCycle || galleryMotionRaf) return;

    const step = timestamp => {
      if (!galleryMotionLastTs) galleryMotionLastTs = timestamp;
      const delta = (timestamp - galleryMotionLastTs) / 1000;
      galleryMotionLastTs = timestamp;

      if (!galleryHovered && !galleryDragging) {
        galleryMotionOffset = normalizeGalleryOffset(galleryMotionOffset + (galleryMotionSpeed * delta));
        applyGalleryOffset();
      }

      galleryMotionRaf = requestAnimationFrame(step);
    };

    galleryMotionRaf = requestAnimationFrame(step);
  }

  function bindGalleryInteractions() {
    const shell = document.querySelector('.gallery-marquee-shell');
    const viewport = document.querySelector('.gallery-marquee-viewport');
    if (!shell || !viewport) return;

    const endDrag = event => {
      const hadDrag = galleryDragging && galleryDragMoved;

      if (event && galleryDragging && viewport.hasPointerCapture && viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }

      galleryPointerDown = false;
      galleryPointerId = null;

      if (galleryDragging) {
        galleryDragging = false;
        shell.classList.remove('is-dragging');
      }

      if (hadDrag) {
        gallerySuppressClick = true;
        setTimeout(() => {
          gallerySuppressClick = false;
        }, 220);
      }

      galleryDragMoved = false;
      if (!viewport.matches(':hover')) galleryHovered = false;
    };

    viewport.onpointerenter = () => {
      galleryHovered = true;
    };

    viewport.onpointerleave = () => {
      if (!galleryDragging) galleryHovered = false;
    };

    viewport.onpointerdown = event => {
      if (event.pointerType !== 'mouse') return;
      if (event.button !== 0) return;

      galleryPointerDown = true;
      galleryPointerId = event.pointerId;
      galleryDragging = false;
      galleryDragMoved = false;
      galleryHovered = true;
      galleryDragStartX = event.clientX;
      galleryDragStartOffset = galleryMotionOffset;
    };

    viewport.onpointermove = event => {
      if (!galleryPointerDown || event.pointerId !== galleryPointerId) return;
      const deltaX = event.clientX - galleryDragStartX;

      if (!galleryDragging) {
        if (Math.abs(deltaX) <= 6) return;
        galleryDragging = true;
        galleryDragMoved = true;
        shell.classList.add('is-dragging');
        viewport.setPointerCapture(event.pointerId);
      }

      event.preventDefault();
      galleryMotionOffset = normalizeGalleryOffset(galleryDragStartOffset - deltaX);
      applyGalleryOffset();
    };

    viewport.onpointerup = event => endDrag(event);
    viewport.onpointercancel = event => endDrag(event);
    viewport.onlostpointercapture = event => endDrag(event);
    viewport.ondragstart = () => false;
  }

  function bindGalleryCardAccessibility(root) {
    if (!root) return;

    root.querySelectorAll('.gallery-item-trigger[data-idx]').forEach(trigger => {
      trigger.addEventListener('click', event => {
        event.preventDefault();
        const index = Number(trigger.dataset.idx || '-1');
        if (!Number.isInteger(index) || index < 0) return;
        openLightbox(index, trigger);
      });

      trigger.addEventListener('keydown', event => {
        if (event.key !== ' ') return;
        event.preventDefault();

        const index = Number(trigger.dataset.idx || '-1');
        if (!Number.isInteger(index) || index < 0) return;
        openLightbox(index, trigger);
      });
    });
  }

  function bindGalleryCardImages(root) {
    if (!root) return;

    root.querySelectorAll('.gallery-item-img').forEach(img => {
      const item = img.closest('.gallery-item');
      const placeholder = item?.querySelector('.gallery-item-placeholder');
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

  function galleryCard(item, index) {
    const catLabel = CAT_LABELS[item.cat] || item.cat;
    const catIcon = CAT_ICONS[item.cat] || '📷';
    const inner = item.img
      ? `<img class="gallery-item-img" src="${escapeAttr(item.img)}" alt="${escapeAttr(item.title)}" loading="lazy" decoding="async">`
      : '';
    const placeholder = `<div class="gallery-item-placeholder">
      <span class="gallery-item-placeholder-icon">${catIcon}</span>
      <span class="gallery-item-placeholder-label">${escapeHTML(catLabel)}</span>
    </div>`;

    return `<li class="gallery-item-shell">
    <article class="gallery-item" data-cat="${escapeAttr(item.cat)}">
      <a class="gallery-item-trigger" href="#lightboxOverlay" data-idx="${index}" aria-label="${escapeAttr(`${catLabel}: ${item.title}`)}">
        ${inner}
        ${placeholder}
        <div class="gallery-overlay">
          <div class="gallery-overlay-zoom">🔍</div>
          <div class="gallery-overlay-cat">${escapeHTML(catLabel)}</div>
          <h3 class="gallery-overlay-title">${escapeHTML(item.title)}</h3>
          <div class="gallery-overlay-desc">${escapeHTML(item.desc || 'ডিটেইল দেখতে ক্লিক করুন')}</div>
        </div>
      </a>
    </article>
  </li>`;
  }

  function openLightbox(index, triggerEl = null) {
    if (gallerySuppressClick) return;

    const overlay = document.getElementById('lightboxOverlay');
    if (!overlay) return;

    lastLightboxTrigger = triggerEl instanceof HTMLElement
      ? triggerEl
      : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    lightboxViewport = captureViewportPosition();
    lightboxIdx = index;
    renderLightbox();
    openDialog(overlay);
    syncBodyScrollLockState();
    focusWithoutScroll(document.getElementById('lightboxCloseBtn'));
    scheduleViewportRestore(lightboxViewport);
  }

  function closeLightbox(event) {
    const overlay = document.getElementById('lightboxOverlay');
    if (!overlay) return;
    if (event && event.target !== overlay) return;

    const viewport = lightboxViewport || captureViewportPosition();

    closeDialog(overlay);
    syncBodyScrollLockState();
    restoreFocus(lastLightboxTrigger);
    scheduleViewportRestore(viewport);
    lightboxViewport = null;
  }

  function lightboxNav(direction) {
    if (!lightboxItems.length) return;
    lightboxIdx = (lightboxIdx + direction + lightboxItems.length) % lightboxItems.length;
    renderLightbox();
  }

  function renderLightbox() {
    const item = lightboxItems[lightboxIdx];
    if (!item) return;

    const catLabel = CAT_LABELS[item.cat] || item.cat;
    const catEl = document.getElementById('lightboxCat');
    const titleEl = document.getElementById('lightboxTitle');
    const counterEl = document.getElementById('lightboxCounter');
    const wrap = document.getElementById('lightboxImgWrap');

    if (catEl) catEl.textContent = catLabel;
    if (titleEl) titleEl.textContent = item.title;
    if (counterEl) counterEl.textContent = `${lightboxIdx + 1} / ${lightboxItems.length}`;
    if (!wrap) return;

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
      return;
    }

    wrap.innerHTML = `<div class="lightbox-placeholder-full">
      <span>${CAT_ICONS[item.cat] || '📷'}</span>
      <small style="font-size:14px;color:var(--cream-dim)">${escapeHTML(item.title)}</small>
    </div>`;
  }

  const lightboxOverlay = document.getElementById('lightboxOverlay');
  lightboxOverlay?.addEventListener('click', event => {
    if (event.target === lightboxOverlay) closeLightbox(event);
  });
  lightboxOverlay?.addEventListener('cancel', event => {
    event.preventDefault();
    closeLightbox();
  });

  document.getElementById('lightboxPrevBtn')?.addEventListener('click', () => lightboxNav(-1));
  document.getElementById('lightboxNextBtn')?.addEventListener('click', () => lightboxNav(1));
  document.getElementById('lightboxCloseBtn')?.addEventListener('click', () => closeLightbox());

  document.addEventListener('keydown', event => {
    if (!lightboxOverlay?.classList.contains('open')) return;
    if (event.key === 'ArrowRight') lightboxNav(1);
    if (event.key === 'ArrowLeft') lightboxNav(-1);
    if (event.key === 'Escape') closeLightbox();
  });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(galleryResizeFrame);
    galleryResizeFrame = requestAnimationFrame(syncGalleryMarquee);
  });

  window.addEventListener('load', syncGalleryMarquee);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncGalleryMarquee);
  }

  document.querySelectorAll('[data-gallery-filter]').forEach(button => {
    button.addEventListener('click', () => {
      filterGallery(button.dataset.galleryFilter || 'all', button);
    });
  });

  loadGallery();

  return {
    closeLightbox
  };
}
