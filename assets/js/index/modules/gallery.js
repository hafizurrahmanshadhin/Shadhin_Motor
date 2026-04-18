import { buildRelativeUrl, cleanLeadingIcon, syncPressedState } from '../../shared/page-helpers.js';

function openDialog(dialog) {
  if (!dialog) return;

  try {
    if (typeof dialog.showModal === 'function' && !dialog.open) {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  } catch {
    dialog.setAttribute('open', '');
  }

  dialog.classList.add('open');
}

function closeDialog(dialog) {
  if (!dialog) return;

  dialog.classList.remove('open');

  if (typeof dialog.close === 'function' && dialog.open) {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
}

function focusWithoutScroll(target) {
  if (!(target instanceof HTMLElement) || typeof target.focus !== 'function') return;

  try {
    target.focus({ preventScroll: true });
  } catch {
    target.focus();
  }
}

function restoreFocus(target) {
  focusWithoutScroll(target);
}

function captureViewportPosition() {
  const scrollRoot = document.scrollingElement || document.documentElement || document.body;

  return {
    x: scrollRoot?.scrollLeft || window.scrollX || window.pageXOffset || 0,
    y: scrollRoot?.scrollTop || window.scrollY || window.pageYOffset || 0
  };
}

function restoreViewportPosition(viewport) {
  if (!viewport) return;

  const restoreX = Number.isFinite(viewport.x) ? viewport.x : 0;
  const restoreY = Number.isFinite(viewport.y) ? viewport.y : 0;
  const root = document.documentElement;
  const scrollRoot = document.scrollingElement || document.documentElement || document.body;
  const previousRootBehavior = root?.style.scrollBehavior || '';
  const previousScrollRootBehavior = scrollRoot instanceof HTMLElement ? scrollRoot.style.scrollBehavior : '';

  if (root) {
    root.style.scrollBehavior = 'auto';
  }

  if (scrollRoot instanceof HTMLElement) {
    scrollRoot.style.scrollBehavior = 'auto';
  }

  if (scrollRoot) {
    scrollRoot.scrollLeft = restoreX;
    scrollRoot.scrollTop = restoreY;
  }

  window.scrollTo({ left: restoreX, top: restoreY, behavior: 'auto' });

  requestAnimationFrame(() => {
    if (root) {
      root.style.scrollBehavior = previousRootBehavior;
    }

    if (scrollRoot instanceof HTMLElement) {
      scrollRoot.style.scrollBehavior = previousScrollRootBehavior;
    }
  });
}

function lockBodyScroll(root, body) {
  body.classList.add('body-scroll-locked');

  if (body.dataset.scrollLockActive !== 'true') {
    const viewport = captureViewportPosition();
    body.dataset.scrollLockActive = 'true';
    body.dataset.scrollLockX = String(viewport.x);
    body.dataset.scrollLockY = String(viewport.y);
    body.dataset.scrollLockGap = String(Math.max(0, window.innerWidth - root.clientWidth));
  }

  const restoreY = Number.parseInt(body.dataset.scrollLockY || '0', 10) || 0;
  const scrollbarGap = Number.parseInt(body.dataset.scrollLockGap || '0', 10) || 0;

  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${restoreY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';

  if (scrollbarGap > 0) {
    body.style.paddingRight = `${scrollbarGap}px`;
    return;
  }

  body.style.removeProperty('padding-right');
}

function unlockBodyScroll(body) {
  body.classList.remove('body-scroll-locked');
  body.style.removeProperty('overflow');

  if (body.dataset.scrollLockActive !== 'true') return;

  const restoreX = Number.parseInt(body.dataset.scrollLockX || '0', 10) || 0;
  const restoreY = Number.parseInt(body.dataset.scrollLockY || '0', 10) || 0;

  delete body.dataset.scrollLockActive;
  delete body.dataset.scrollLockX;
  delete body.dataset.scrollLockY;
  delete body.dataset.scrollLockGap;

  body.style.removeProperty('position');
  body.style.removeProperty('top');
  body.style.removeProperty('left');
  body.style.removeProperty('right');
  body.style.removeProperty('width');
  body.style.removeProperty('padding-right');

  window.scrollTo({ left: restoreX, top: restoreY, behavior: 'auto' });
}

function syncBodyScrollLockState() {
  const root = document.documentElement;
  const body = document.body;
  const shouldLock = Array.from(document.querySelectorAll('dialog')).some(dialog => {
    return dialog.open || dialog.classList.contains('open');
  });

  if (!root || !body) return;

  if (shouldLock) {
    lockBodyScroll(root, body);
    return;
  }

  unlockBodyScroll(body);
}

export function initHomeGallery() {
  const gallerySection = document.getElementById('gallery');
  const galleryGrid = document.getElementById('galleryGrid');
  const track = document.getElementById('galleryMarqueeTrack');
  const filterButtons = Array.from(gallerySection?.querySelectorAll('[data-gallery-filter]') || []);
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxTitleDefault = document.getElementById('lightboxTitle')?.textContent?.trim() || '';

  if (!gallerySection || !galleryGrid || !track) {
    return {
      closeLightbox() {}
    };
  }

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
  let lightboxShouldKeepFocus = false;

  function isFocusVisible(target) {
    if (!(target instanceof HTMLElement)) return false;

    try {
      return target.matches(':focus-visible');
    } catch {
      return false;
    }
  }

  function getShells({ includeClones = false } = {}) {
    return Array.from(galleryGrid.querySelectorAll('.gallery-item-shell')).filter(shell => {
      return includeClones || shell.dataset.marqueeClone !== 'true';
    });
  }

  function getVisibleTriggers() {
    return getShells()
      .filter(shell => !shell.hidden)
      .map(shell => shell.querySelector('.gallery-item-trigger'))
      .filter(Boolean);
  }

  function setActiveGalleryFilterButton(filterValue) {
    syncPressedState(filterButtons, button => button.dataset.galleryFilter === filterValue);
  }

  function getFilterLabel(filterValue) {
    const button = filterButtons.find(item => item.dataset.galleryFilter === filterValue);
    return cleanLeadingIcon(button?.textContent || filterButtons[0]?.textContent || '') || '';
  }

  function updateGalleryCount(total) {
    const countEl = gallerySection.querySelector('#galleryTotalCount');
    if (countEl) countEl.textContent = String(total);
  }

  function updateGalleryViewAllLink() {
    const viewAllBtn = gallerySection.querySelector('#galleryViewAllBtn');
    if (!viewAllBtn) return;

    if (!viewAllBtn.dataset.baseHref) {
      viewAllBtn.dataset.baseHref = viewAllBtn.getAttribute('href') || '';
    }

    viewAllBtn.href = buildRelativeUrl(viewAllBtn.dataset.baseHref || window.location.href, {
      cat: galleryFilter === 'all' ? '' : galleryFilter
    });
  }

  function applyFilter() {
    const shells = getShells({ includeClones: true });

    shells.forEach(shell => {
      const matches = galleryFilter === 'all' || shell.dataset.cat === galleryFilter;
      shell.hidden = !matches;
    });

    setActiveGalleryFilterButton(galleryFilter);
    updateGalleryCount(getVisibleTriggers().length);
    updateGalleryViewAllLink();
    syncGalleryMarquee();
  }

  function filterGallery(category) {
    galleryFilter = category || 'all';
    applyFilter();
  }

  function destroyGalleryMotion() {
    cancelAnimationFrame(galleryMotionRaf);
    galleryMotionRaf = 0;
    galleryMotionLastTs = 0;
  }

  function normalizeGalleryOffset(offset) {
    if (!galleryMotionCycle) return 0;

    let nextOffset = offset % galleryMotionCycle;
    if (nextOffset < 0) nextOffset += galleryMotionCycle;
    return nextOffset;
  }

  function applyGalleryOffset() {
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

  function prepareGalleryCloneGroup(group) {
    if (!(group instanceof HTMLElement)) return;

    group.dataset.marqueeClone = 'true';
    group.setAttribute('aria-hidden', 'true');

    group.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(node => {
      if (node instanceof HTMLElement) node.tabIndex = -1;
    });
  }

  function stampGallerySourceIndices(group) {
    if (!(group instanceof HTMLElement)) return;

    Array.from(group.querySelectorAll('.gallery-item-shell')).forEach((shell, index) => {
      const sourceIndex = String(index);
      shell.dataset.marqueeSourceIndex = sourceIndex;

      const trigger = shell.querySelector('.gallery-item-trigger');
      if (trigger instanceof HTMLElement) {
        trigger.dataset.marqueeSourceIndex = sourceIndex;
      }
    });
  }

  function ensureGalleryLoopGroups() {
    const baseGroup = track.querySelector('.gallery-marquee-group:not([data-marquee-clone="true"])');
    if (!(baseGroup instanceof HTMLElement)) return [];

    track.querySelectorAll('.gallery-marquee-group[data-marquee-clone="true"]').forEach(group => {
      group.remove();
    });

    stampGallerySourceIndices(baseGroup);

    const computedStyle = getComputedStyle(track);
    const gap = parseFloat(computedStyle.gap || computedStyle.columnGap || 18) || 18;
    const baseWidth = baseGroup.scrollWidth || 0;
    const viewportEl = galleryGrid.querySelector('.gallery-marquee-viewport');
    const viewportWidth = viewportEl?.clientWidth || galleryGrid.clientWidth || baseWidth || 0;
    const cycleWidth = baseWidth > 0 ? baseWidth + gap : 0;
    const requiredGroups = cycleWidth > 0
      ? Math.max(2, Math.ceil(viewportWidth / cycleWidth) + 2)
      : 2;

    const groups = [baseGroup];

    for (let index = 1; index < requiredGroups; index += 1) {
      const clone = baseGroup.cloneNode(true);
      prepareGalleryCloneGroup(clone);
      track.append(clone);
      groups.push(clone);
    }

    bindGalleryCardImages(track);
    return groups;
  }

  function syncGalleryMarquee() {
    const groups = ensureGalleryLoopGroups();
    destroyGalleryMotion();

    if (groups.length < 2) {
      galleryMotionCycle = 0;
      galleryMotionOffset = 0;
      applyGalleryOffset();
      return;
    }

    const computedStyle = getComputedStyle(track);
    const gap = parseFloat(computedStyle.gap || computedStyle.columnGap || 18) || 18;
    const groupWidth = groups[0]?.scrollWidth || 0;

    if (groupWidth <= 0) {
      galleryMotionCycle = 0;
      galleryMotionOffset = 0;
      applyGalleryOffset();
      return;
    }

    galleryMotionCycle = groupWidth + gap;
    galleryMotionOffset = normalizeGalleryOffset(galleryMotionOffset);
    applyGalleryOffset();
    startGalleryMotion();
  }

  function bindGalleryInteractions() {
    const shell = galleryGrid.querySelector('.gallery-marquee-shell');
    const viewport = galleryGrid.querySelector('.gallery-marquee-viewport');
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
        window.setTimeout(() => {
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
      if (event.pointerType !== 'mouse' || event.button !== 0 || !galleryMotionCycle) return;

      galleryPointerDown = true;
      galleryPointerId = event.pointerId;
      galleryDragging = false;
      galleryDragMoved = false;
      galleryHovered = true;
      galleryDragStartX = event.clientX;
      galleryDragStartOffset = galleryMotionOffset;
    };

    viewport.onpointermove = event => {
      if (!galleryPointerDown || event.pointerId !== galleryPointerId || !galleryMotionCycle) return;
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

  function bindGalleryCardImages(root = galleryGrid) {
    root.querySelectorAll('.gallery-item-img').forEach(img => {
      if (img.dataset.galleryPlaceholderBound === 'true') return;
      img.dataset.galleryPlaceholderBound = 'true';

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

  function getTriggerData(trigger) {
    const card = trigger.closest('.gallery-item, .gallery-card');
    const label = card?.querySelector('.gallery-overlay-cat, .gallery-card-cat')?.textContent?.trim()
      || getFilterLabel(trigger.dataset.galleryCat || 'all');
    const icon = card?.querySelector('.gallery-item-placeholder-icon, .gallery-card-placeholder-icon')?.textContent?.trim()
      || '';

    return {
      cat: trigger.dataset.galleryCat || 'car',
      label,
      icon,
      title: trigger.dataset.galleryTitle || lightboxTitleDefault,
      img: trigger.dataset.galleryImg || '',
      desc: trigger.dataset.galleryDesc || '',
      models: (trigger.dataset.galleryModels || '').split('|').filter(Boolean)
    };
  }

  function getTriggerSourceIndex(trigger) {
    if (!(trigger instanceof HTMLElement)) return '';

    return trigger.dataset.marqueeSourceIndex
      || trigger.closest('.gallery-item-shell')?.dataset.marqueeSourceIndex
      || '';
  }

  function resolveBaseTrigger(triggerEl) {
    const sourceIndex = getTriggerSourceIndex(triggerEl);
    if (!sourceIndex) return triggerEl;

    return getVisibleTriggers().find(trigger => getTriggerSourceIndex(trigger) === sourceIndex) || triggerEl;
  }

  function renderLightboxPlaceholder(wrap, item) {
    const placeholder = document.createElement('div');
    placeholder.className = 'lightbox-placeholder-full';

    const iconEl = document.createElement('span');
    iconEl.textContent = item.icon || '';

    const labelEl = document.createElement('small');
    labelEl.style.fontSize = '14px';
    labelEl.style.color = 'var(--cream-dim)';
    labelEl.textContent = item.title;

    placeholder.append(iconEl, labelEl);
    wrap.replaceChildren(placeholder);
  }

  function openLightbox(triggerEl) {
    if (!(triggerEl instanceof HTMLElement) || gallerySuppressClick) return;

    const visibleTriggers = getVisibleTriggers();
    const sourceTrigger = resolveBaseTrigger(triggerEl);
    const idx = visibleTriggers.indexOf(sourceTrigger);
    if (idx === -1) return;

    const overlay = lightboxOverlay;
    if (!overlay) return;

    lastLightboxTrigger = sourceTrigger;
    lightboxShouldKeepFocus = isFocusVisible(sourceTrigger);
    lightboxViewport = captureViewportPosition();
    lightboxItems = visibleTriggers;
    lightboxIdx = idx;
    renderLightbox();
    openDialog(overlay);
    syncBodyScrollLockState();
    focusWithoutScroll(document.getElementById('lightboxCloseBtn'));
  }

  function closeLightbox(event) {
    const overlay = lightboxOverlay;
    if (!overlay) return;
    if (event && event.target !== overlay) return;

    const viewportState = lightboxViewport || captureViewportPosition();
    const triggerToRestore = lastLightboxTrigger;
    const keepFocus = lightboxShouldKeepFocus;

    closeDialog(overlay);
    syncBodyScrollLockState();
    restoreFocus(triggerToRestore);
    restoreViewportPosition(viewportState);
    lightboxShouldKeepFocus = false;
    lightboxViewport = null;

    if (!keepFocus && triggerToRestore instanceof HTMLElement) {
      requestAnimationFrame(() => {
        triggerToRestore.blur();
      });
    }
  }

  function lightboxNav(direction) {
    if (!lightboxItems.length) return;
    lightboxIdx = (lightboxIdx + direction + lightboxItems.length) % lightboxItems.length;
    renderLightbox();
  }

  function renderLightbox() {
    const trigger = lightboxItems[lightboxIdx];
    if (!trigger) return;

    const item = getTriggerData(trigger);
    const catEl = document.getElementById('lightboxCat');
    const titleEl = document.getElementById('lightboxTitle');
    const counterEl = document.getElementById('lightboxCounter');
    const wrap = document.getElementById('lightboxImgWrap');

    if (catEl) catEl.textContent = item.label;
    if (titleEl) titleEl.textContent = item.title;
    if (counterEl) counterEl.textContent = `${lightboxIdx + 1} / ${lightboxItems.length}`;
    if (!wrap) return;

    if (item.img) {
      const image = document.createElement('img');
      image.src = item.img;
      image.alt = item.title;
      image.addEventListener('error', () => {
        renderLightboxPlaceholder(wrap, item);
      }, { once: true });
      wrap.replaceChildren(image);
      return;
    }

    renderLightboxPlaceholder(wrap, item);
  }

  galleryGrid.addEventListener('click', event => {
    const trigger = event.target.closest('.gallery-item-trigger');
    if (!trigger || !galleryGrid.contains(trigger)) return;

    event.preventDefault();
    openLightbox(trigger);
  });

  galleryGrid.addEventListener('keydown', event => {
    if (event.key !== ' ') return;

    const trigger = event.target.closest('.gallery-item-trigger');
    if (!trigger || !galleryGrid.contains(trigger)) return;

    event.preventDefault();
    openLightbox(trigger);
  });

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

  window.addEventListener('pageshow', syncBodyScrollLockState);
  window.addEventListener('resize', syncBodyScrollLockState);
  window.addEventListener('orientationchange', syncBodyScrollLockState);
  syncBodyScrollLockState();
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterGallery(button.dataset.galleryFilter || 'all');
    });
  });

  bindGalleryInteractions();
  bindGalleryCardImages();
  applyFilter();

  return {
    closeLightbox
  };
}
