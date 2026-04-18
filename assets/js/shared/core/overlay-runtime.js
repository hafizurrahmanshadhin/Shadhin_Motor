import { openDialogModal, closeDialogModal } from './dialog-helpers.js';
import { FOCUSABLE_SELECTOR } from './dom-helpers.js';

const DEFAULT_OVERLAY_IDS = [
  'lightboxOverlay',
  'sampleModal',
  'sampleConfirmModal',
  'reviewSubmitModal',
  'reviewSubmitConfirmOverlay',
  'reviewMediaPreviewOverlay',
  'aboutTeamPreviewOverlay'
];

export function createOverlayRuntime({ bodyScrollLockOverlayIds = DEFAULT_OVERLAY_IDS } = {}) {
  const bodyScrollLockState = {
    locked: false,
    x: 0,
    y: 0,
    scrollbarGap: 0
  };

  let toastTimer = 0;

  function focusWithoutScroll(target) {
    if (!(target instanceof HTMLElement)) return;
    if (typeof target.focus !== 'function') return;

    try {
      target.focus({ preventScroll: true });
    } catch {
      target.focus();
    }
  }

  function getFirstFocusable(container) {
    return container?.querySelector(FOCUSABLE_SELECTOR) || null;
  }

  function focusFirstIn(container) {
    focusWithoutScroll(getFirstFocusable(container));
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

  function scheduleViewportRestore(viewport) {
    if (!viewport) return;

    requestAnimationFrame(() => {
      restoreViewportPosition(viewport);
      requestAnimationFrame(() => restoreViewportPosition(viewport));
    });
  }

  function openDialog(dialog) {
    openDialogModal(dialog);
  }

  function closeDialog(dialog) {
    closeDialogModal(dialog);
  }

  function lockBodyScroll(root, body) {
    body.classList.add('body-scroll-locked');

    if (!bodyScrollLockState.locked) {
      const viewport = captureViewportPosition();
      bodyScrollLockState.locked = true;
      bodyScrollLockState.x = viewport.x;
      bodyScrollLockState.y = viewport.y;
      bodyScrollLockState.scrollbarGap = Math.max(0, window.innerWidth - root.clientWidth);
    }

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${bodyScrollLockState.y}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';

    if (bodyScrollLockState.scrollbarGap > 0) {
      body.style.paddingRight = `${bodyScrollLockState.scrollbarGap}px`;
      return;
    }

    body.style.removeProperty('padding-right');
  }

  function unlockBodyScroll(body) {
    body.classList.remove('body-scroll-locked');
    body.style.removeProperty('overflow');

    if (!bodyScrollLockState.locked) return;

    const topOffset = Number.parseInt(body.style.top || '0', 10);
    const restoreX = bodyScrollLockState.x;
    const restoreY = bodyScrollLockState.y || Math.abs(Number.isNaN(topOffset) ? 0 : topOffset);

    bodyScrollLockState.locked = false;
    bodyScrollLockState.x = 0;
    bodyScrollLockState.y = 0;
    bodyScrollLockState.scrollbarGap = 0;

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
    const shouldLock = bodyScrollLockOverlayIds.some(id => {
      const element = document.getElementById(id);
      return !!element && element.classList.contains('open');
    });

    if (!root || !body) return;

    if (shouldLock) {
      lockBodyScroll(root, body);
      return;
    }

    unlockBodyScroll(body);
  }

  function showToast(title, message, duration = 4000) {
    const toastEl = document.getElementById('toast');
    const titleEl = document.getElementById('toastTitle');
    const messageEl = document.getElementById('toastMsg');

    if (!toastEl || !titleEl || !messageEl) return;

    window.clearTimeout(toastTimer);

    titleEl.textContent = title;
    messageEl.textContent = message;
    toastEl.classList.add('show');

    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove('show');
    }, duration);
  }

  return {
    openDialog,
    closeDialog,
    focusWithoutScroll,
    focusFirstIn,
    restoreFocus,
    captureViewportPosition,
    scheduleViewportRestore,
    syncBodyScrollLockState,
    showToast
  };
}
