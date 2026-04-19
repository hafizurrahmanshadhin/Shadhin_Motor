const ABOUT_TEAM_MOTION_SPEED = 34;

function isPrimaryDragPointer(event) {
  if (event.isPrimary === false) return false;
  return event.pointerType !== 'mouse' || event.button === 0;
}

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
  const currentX = window.scrollX || window.pageXOffset || 0;
  const currentY = window.scrollY || window.pageYOffset || 0;

  if (Math.abs(currentX - restoreX) < 1 && Math.abs(currentY - restoreY) < 1) return;

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
  if (!root || !body) return;

  body.classList.add('body-scroll-locked');
  body.dataset.scrollLockActive = 'true';
  root.style.overflowY = 'hidden';
}

function unlockBodyScroll(root, body) {
  if (!root || !body) return;

  body.classList.remove('body-scroll-locked');
  body.style.removeProperty('overflow');
  root.style.removeProperty('overflow-y');

  if (body.dataset.scrollLockActive !== 'true') return;

  delete body.dataset.scrollLockActive;

  body.style.removeProperty('position');
  body.style.removeProperty('top');
  body.style.removeProperty('left');
  body.style.removeProperty('right');
  body.style.removeProperty('width');
  body.style.removeProperty('padding-right');
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

  unlockBodyScroll(root, body);
}

export function initHomeAboutTeam() {
  const aboutSection = document.getElementById('about');
  const slider = document.getElementById('aboutTeamSlider');
  const track = document.getElementById('aboutTeamGrid');
  const viewport = document.getElementById('aboutTeamMarqueeViewport');
  const previewOverlay = document.getElementById('aboutTeamPreviewOverlay');

  if (!aboutSection || !slider || !track || !viewport) {
    return {
      closeAboutTeamPreview() {}
    };
  }

  const fallbackImage = previewOverlay?.dataset.fallbackImage?.trim()
    || track.querySelector('.about-team-photo')?.getAttribute('src')?.trim()
    || '';

  const state = {
    motionRaf: 0,
    motionLastTs: 0,
    motionOffset: 0,
    motionCycle: 0,
    pauseReasons: new Set(),
    resizeTick: 0,
    dragging: false,
    dragMoved: false,
    pointerDown: false,
    pointerId: null,
    dragStartX: 0,
    dragStartOffset: 0,
    suppressClick: false
  };

  let previewTrigger = null;
  let previewViewport = null;
  let previewShouldKeepFocusPause = false;

  function isFocusVisible(target) {
    if (!(target instanceof HTMLElement)) return false;

    try {
      return target.matches(':focus-visible');
    } catch {
      return false;
    }
  }

  function updatePauseState() {
    slider.classList.toggle('is-paused', state.pauseReasons.size > 0);
  }

  function setPaused(reason, paused) {
    if (!reason) return;
    if (paused) state.pauseReasons.add(reason);
    else state.pauseReasons.delete(reason);
    updatePauseState();
  }

  function destroyMotion() {
    cancelAnimationFrame(state.motionRaf);
    state.motionRaf = 0;
    state.motionLastTs = 0;
  }

  function normalizeOffset(offset) {
    if (!state.motionCycle) return 0;

    let nextOffset = offset % state.motionCycle;
    if (nextOffset < 0) nextOffset += state.motionCycle;
    return nextOffset;
  }

  function applyOffset() {
    track.style.transform = `translate3d(${-state.motionOffset}px, 0, 0)`;
  }

  function startMotion() {
    if (!state.motionCycle || state.motionRaf) return;

    const step = timestamp => {
      if (!state.motionLastTs) state.motionLastTs = timestamp;
      const delta = (timestamp - state.motionLastTs) / 1000;
      state.motionLastTs = timestamp;

      if (state.pauseReasons.size === 0) {
        state.motionOffset = normalizeOffset(state.motionOffset + (ABOUT_TEAM_MOTION_SPEED * delta));
        applyOffset();
      }

      state.motionRaf = requestAnimationFrame(step);
    };

    state.motionRaf = requestAnimationFrame(step);
  }

  function bindDragInteractions() {
    const shell = slider.querySelector('.about-team-marquee-shell');
    if (!shell) return;

    const endDrag = event => {
      const hadDrag = state.dragging && state.dragMoved;

      if (event && state.dragging && viewport.hasPointerCapture && viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }

      state.pointerDown = false;
      state.pointerId = null;

      if (state.dragging) {
        state.dragging = false;
        shell.classList.remove('is-dragging');
      }

      if (hadDrag) {
        state.suppressClick = true;
        window.setTimeout(() => {
          state.suppressClick = false;
        }, 220);
      }

      state.dragMoved = false;
      setPaused('pointer', false);
    };

    viewport.onpointerdown = event => {
      if (!isPrimaryDragPointer(event) || !state.motionCycle) return;

      state.pointerDown = true;
      state.pointerId = event.pointerId;
      state.dragging = false;
      state.dragMoved = false;
      state.dragStartX = event.clientX;
      state.dragStartOffset = state.motionOffset;
      setPaused('pointer', true);
    };

    viewport.onpointermove = event => {
      if (!state.pointerDown || event.pointerId !== state.pointerId || !state.motionCycle) return;
      const deltaX = event.clientX - state.dragStartX;

      if (!state.dragging) {
        if (Math.abs(deltaX) <= 6) return;
        state.dragging = true;
        state.dragMoved = true;
        shell.classList.add('is-dragging');
        viewport.setPointerCapture(event.pointerId);
      }

      event.preventDefault();
      state.motionOffset = normalizeOffset(state.dragStartOffset - deltaX);
      applyOffset();
    };

    viewport.onpointerup = event => endDrag(event);
    viewport.onpointercancel = event => endDrag(event);
    viewport.onlostpointercapture = event => endDrag(event);
    viewport.ondragstart = () => false;
  }

  function bindImageFallbacks(root = document) {
    root.querySelectorAll('.about-team-photo').forEach(img => {
      if (img.dataset.aboutTeamFallbackBound === 'true') return;
      img.dataset.aboutTeamFallbackBound = 'true';

      img.addEventListener('error', () => {
        if (!fallbackImage || img.src.includes(fallbackImage)) return;
        img.src = fallbackImage;
      }, { once: true });
    });
  }

  function prepareCloneGroup(group) {
    if (!(group instanceof HTMLElement)) return;

    group.dataset.marqueeClone = 'true';
    group.setAttribute('aria-hidden', 'true');

    group.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(node => {
      if (node instanceof HTMLElement) node.tabIndex = -1;
    });
  }

  function ensureLoopGroups() {
    const baseGroup = track.querySelector('.about-team-marquee-group:not([data-marquee-clone="true"])');
    if (!(baseGroup instanceof HTMLElement)) return [];

    track.querySelectorAll('.about-team-marquee-group[data-marquee-clone="true"]').forEach(group => {
      group.remove();
    });

    const computedStyle = getComputedStyle(track);
    const gap = parseFloat(computedStyle.gap || computedStyle.columnGap || 12) || 12;
    const baseWidth = baseGroup.scrollWidth || 0;
    const viewportWidth = viewport.clientWidth || slider.clientWidth || baseWidth || 0;
    const cycleWidth = baseWidth > 0 ? baseWidth + gap : 0;
    const requiredGroups = cycleWidth > 0
      ? Math.max(2, Math.ceil(viewportWidth / cycleWidth) + 2)
      : 2;

    const groups = [baseGroup];

    for (let index = 1; index < requiredGroups; index += 1) {
      const clone = baseGroup.cloneNode(true);
      prepareCloneGroup(clone);
      track.append(clone);
      groups.push(clone);
    }

    bindImageFallbacks(track);
    return groups;
  }

  function syncMarquee() {
    const groups = ensureLoopGroups();
    destroyMotion();

    if (groups.length < 2) {
      state.motionCycle = 0;
      state.motionOffset = 0;
      applyOffset();
      return;
    }

    const computedStyle = getComputedStyle(track);
    const gap = parseFloat(computedStyle.gap || computedStyle.columnGap || 12) || 12;
    const groupWidth = groups[0]?.scrollWidth || 0;

    if (groupWidth <= 0) {
      state.motionCycle = 0;
      state.motionOffset = 0;
      applyOffset();
      return;
    }

    state.motionCycle = groupWidth + gap;
    state.motionOffset = normalizeOffset(state.motionOffset);
    applyOffset();
    startMotion();
  }

  function openAboutTeamPreview(imageSrc, name, role, triggerEl = null) {
    const overlay = previewOverlay;
    const image = document.getElementById('aboutTeamPreviewImage');
    const nameEl = document.getElementById('aboutTeamPreviewName');
    const roleEl = document.getElementById('aboutTeamPreviewRole');

    if (!overlay || !image || !nameEl || !roleEl) return;

    previewTrigger = triggerEl instanceof HTMLElement
      ? triggerEl
      : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    previewViewport = captureViewportPosition();
    previewShouldKeepFocusPause = isFocusVisible(previewTrigger);

    const defaultName = overlay.dataset.defaultName || nameEl.textContent || '';
    const defaultRole = overlay.dataset.defaultRole || roleEl.textContent || '';
    const previewAltSuffix = overlay.dataset.previewAltSuffix || image.dataset.previewAltSuffix || '';

    image.src = imageSrc || fallbackImage;
    image.alt = [name || defaultName, previewAltSuffix].filter(Boolean).join(' - ');
    image.onerror = () => {
      if (!fallbackImage || image.src.includes(fallbackImage)) return;
      image.src = fallbackImage;
    };

    nameEl.textContent = name || defaultName;
    roleEl.textContent = role || defaultRole;

    setPaused('preview', true);
    openDialog(overlay);
    syncBodyScrollLockState();
    focusWithoutScroll(document.getElementById('aboutTeamPreviewCloseBtn'));
  }

  function closeAboutTeamPreview() {
    const overlay = previewOverlay;
    if (!overlay) return;

    const viewportState = previewViewport || captureViewportPosition();
    const triggerToRestore = previewTrigger;
    const keepFocusPause = previewShouldKeepFocusPause;

    closeDialog(overlay);
    syncBodyScrollLockState();
    restoreFocus(triggerToRestore);
    restoreViewportPosition(viewportState);
    previewTrigger = null;
    previewViewport = null;
    setPaused('preview', false);

    requestAnimationFrame(() => {
      if (!keepFocusPause && triggerToRestore instanceof HTMLElement) {
        triggerToRestore.blur();
        setPaused('focus', false);
        return;
      }

      setPaused('focus', document.activeElement instanceof Node && slider.contains(document.activeElement));
    });
  }

  bindImageFallbacks(aboutSection);
  bindDragInteractions();
  syncMarquee();

  track.addEventListener('click', event => {
    if (state.suppressClick) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const trigger = event.target.closest('[data-team-preview-src]');
    if (!trigger || !track.contains(trigger)) return;

    openAboutTeamPreview(
      trigger.dataset.teamPreviewSrc || fallbackImage,
      trigger.dataset.teamPreviewName || '',
      trigger.dataset.teamPreviewRole || '',
      trigger
    );
  });

  track.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    const trigger = event.target.closest('[data-team-preview-src]');
    if (!trigger || !track.contains(trigger)) return;

    event.preventDefault();
    openAboutTeamPreview(
      trigger.dataset.teamPreviewSrc || fallbackImage,
      trigger.dataset.teamPreviewName || '',
      trigger.dataset.teamPreviewRole || '',
      trigger
    );
  });
  previewOverlay?.addEventListener('click', event => {
    if (event.target === previewOverlay) closeAboutTeamPreview();
  });
  previewOverlay?.addEventListener('cancel', event => {
    event.preventDefault();
    closeAboutTeamPreview();
  });

  document.getElementById('aboutTeamPreviewCloseBtn')?.addEventListener('click', closeAboutTeamPreview);

  const ownerPreviewTrigger = aboutSection.querySelector('.about-owner-photo-btn[data-team-preview-src]');
  ownerPreviewTrigger?.addEventListener('click', () => {
    openAboutTeamPreview(
      ownerPreviewTrigger.dataset.teamPreviewSrc || fallbackImage,
      ownerPreviewTrigger.dataset.teamPreviewName || '',
      ownerPreviewTrigger.dataset.teamPreviewRole || '',
      ownerPreviewTrigger
    );
  });

  slider.addEventListener('mouseenter', () => setPaused('hover', true));
  slider.addEventListener('mouseleave', () => setPaused('hover', false));
  slider.addEventListener('focusin', () => setPaused('focus', true));
  slider.addEventListener('focusout', event => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && slider.contains(nextTarget)) return;
    setPaused('focus', false);
  });

  document.addEventListener('visibilitychange', () => {
    setPaused('hidden', document.hidden);
  });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(state.resizeTick);
    state.resizeTick = requestAnimationFrame(syncMarquee);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncMarquee);
  }

  window.addEventListener('pageshow', syncBodyScrollLockState);
  window.addEventListener('resize', syncBodyScrollLockState);
  window.addEventListener('orientationchange', syncBodyScrollLockState);
  syncBodyScrollLockState();
  setPaused('hidden', document.hidden);

  return {
    closeAboutTeamPreview
  };
}
