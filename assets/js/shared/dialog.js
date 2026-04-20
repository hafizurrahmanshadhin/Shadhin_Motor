const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

export function openDialog(dialog) {
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

export function closeDialog(dialog) {
  if (!dialog) return;

  dialog.classList.remove('open');

  if (typeof dialog.close === 'function' && dialog.open) {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
}

export function focusWithoutScroll(target) {
  if (!(target instanceof HTMLElement) || typeof target.focus !== 'function') return;

  try {
    target.focus({ preventScroll: true });
  } catch {
    target.focus();
  }
}

export function focusFirstIn(container, selector = FOCUSABLE_SELECTOR) {
  focusWithoutScroll(container?.querySelector(selector) || null);
}

export function restoreFocus(target) {
  focusWithoutScroll(target);
}

export function isFocusVisible(target) {
  if (!(target instanceof HTMLElement)) return false;

  try {
    return target.matches(':focus-visible');
  } catch {
    return false;
  }
}

export function captureViewportPosition() {
  const scrollRoot = document.scrollingElement || document.documentElement || document.body;

  return {
    x: scrollRoot?.scrollLeft || window.scrollX || window.pageXOffset || 0,
    y: scrollRoot?.scrollTop || window.scrollY || window.pageYOffset || 0
  };
}

export function restoreViewportPosition(viewport) {
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

export function syncBodyScrollLockState() {
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

export function initDialogGlobals() {
  if (document.documentElement.dataset.dialogGlobalsReady === 'true') return;

  document.documentElement.dataset.dialogGlobalsReady = 'true';
  window.addEventListener('pageshow', syncBodyScrollLockState);
  window.addEventListener('resize', syncBodyScrollLockState);
  window.addEventListener('orientationchange', syncBodyScrollLockState);
}
