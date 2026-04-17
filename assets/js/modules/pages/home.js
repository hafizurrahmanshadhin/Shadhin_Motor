/**
 * Homepage interaction controller.
 *
 * This file now focuses on page orchestration:
 * - navigation state
 * - shared overlay helpers
 * - feature module bootstrap (about, gallery, samples, reviews)
 */
import { storageKeys as siteStorageKeys } from '../../site-config.js';
import { FOCUSABLE_SELECTOR } from '../core/dom-helpers.js';
import { initHomeAboutTeam } from '../home/about-team.js';
import { initHomeGallery } from '../home/gallery.js';
import { initHomeSamples } from '../home/samples.js';
import { initHomeReviews } from '../home/reviews.js';

export function initHomePage() {
  const ORDER_STORAGE_KEY = siteStorageKeys.orders || 'ac_orders';

  // ─── NAVBAR ─────────────────────────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  const navLinksContainer = document.getElementById('navLinks');
  const hamburgerBtn = document.getElementById('hamburger');
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const trackedSections = Array.from(document.querySelectorAll('section[id]'))
    .filter(section => navLinks.some(link => link.getAttribute('href') === `#${section.id}`));

  function updateNavToggleButtonState(isOpen) {
    if (!hamburgerBtn) return;
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    hamburgerBtn.setAttribute('aria-label', isOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন');
  }

  function setActiveNavLink(targetId = '') {
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === targetId;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function updateActiveNavLink() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);

    const navHeight = navbar?.offsetHeight || 0;
    const scrollMark = window.scrollY + navHeight + 120;
    let activeId = '';

    trackedSections.forEach(section => {
      if (scrollMark >= section.offsetTop) activeId = `#${section.id}`;
    });

    setActiveNavLink(activeId);
  }

  window.addEventListener('scroll', updateActiveNavLink);
  window.addEventListener('load', updateActiveNavLink);
  window.addEventListener('hashchange', updateActiveNavLink);
  updateActiveNavLink();

  function toggleNav(forceOpen) {
    if (!navLinksContainer) return;

    const nextState = typeof forceOpen === 'boolean'
      ? forceOpen
      : !navLinksContainer.classList.contains('open');

    navLinksContainer.classList.toggle('open', nextState);
    updateNavToggleButtonState(nextState);
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => toggleNav());
  }

  document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', () => {
      toggleNav(false);
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId.startsWith('#')) setActiveNavLink(targetId);
    });
  });

  document.addEventListener('click', event => {
    if (!navLinksContainer || !hamburgerBtn || !navbar) return;
    if (!navLinksContainer.classList.contains('open')) return;

    const clickTarget = event.target;
    if (clickTarget instanceof Node && navbar.contains(clickTarget)) return;
    toggleNav(false);
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!navLinksContainer || !navLinksContainer.classList.contains('open')) return;

    toggleNav(false);
    hamburgerBtn?.focus();
  });

  updateNavToggleButtonState(false);

  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      document.querySelectorAll('.faq-item').forEach(other => {
        if (other !== item) other.open = false;
      });
    });
  });

  // ─── SCROLL REVEAL ──────────────────────────────────────────────────────────
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.08 });

  function observeRevealElements(root = document) {
    root.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
  }

  observeRevealElements();

  // ─── SHARED OVERLAY HELPERS ────────────────────────────────────────────────
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
    const firstFocusable = getFirstFocusable(container);
    focusWithoutScroll(firstFocusable);
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

    if (root) root.style.scrollBehavior = 'auto';
    if (scrollRoot instanceof HTMLElement) scrollRoot.style.scrollBehavior = 'auto';

    if (scrollRoot) {
      scrollRoot.scrollLeft = restoreX;
      scrollRoot.scrollTop = restoreY;
    }

    window.scrollTo({ left: restoreX, top: restoreY, behavior: 'auto' });

    requestAnimationFrame(() => {
      if (root) root.style.scrollBehavior = previousRootBehavior;
      if (scrollRoot instanceof HTMLElement) scrollRoot.style.scrollBehavior = previousScrollRootBehavior;
    });
  }

  function scheduleViewportRestore(viewport) {
    if (!viewport) return;

    requestAnimationFrame(() => {
      restoreViewportPosition(viewport);
      requestAnimationFrame(() => restoreViewportPosition(viewport));
    });
  }

  function openOverlayDialog(dialog) {
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

  function closeOverlayDialog(dialog) {
    if (!dialog) return;

    dialog.classList.remove('open');

    if (typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  }

  const BODY_SCROLL_LOCK_OVERLAYS = [
    'lightboxOverlay',
    'sampleModal',
    'sampleConfirmModal',
    'reviewSubmitModal',
    'reviewSubmitConfirmOverlay',
    'reviewMediaPreviewOverlay',
    'aboutTeamPreviewOverlay'
  ];

  const bodyScrollLockState = {
    locked: false,
    x: 0,
    y: 0,
    scrollbarGap: 0
  };

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

  function unlockBodyScroll(root, body) {
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
    const shouldLock = BODY_SCROLL_LOCK_OVERLAYS.some(id => {
      const el = document.getElementById(id);
      return !!el && el.classList.contains('open');
    });

    if (!root || !body) return;

    if (shouldLock) {
      lockBodyScroll(root, body);
      return;
    }

    unlockBodyScroll(root, body);
  }

  // ─── TOAST ──────────────────────────────────────────────────────────────────
  function showToast(title, msg, duration = 4000) {
    const toastEl = document.getElementById('toast');
    const titleEl = document.getElementById('toastTitle');
    const msgEl = document.getElementById('toastMsg');
    if (!toastEl || !titleEl || !msgEl) return;

    titleEl.textContent = title;
    msgEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), duration);
  }

  // ─── INIT ───────────────────────────────────────────────────────────────────
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  window.addEventListener('load', () => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  });

  window.addEventListener('pageshow', syncBodyScrollLockState);
  window.addEventListener('resize', syncBodyScrollLockState);
  window.addEventListener('orientationchange', syncBodyScrollLockState);
  syncBodyScrollLockState();

  initHomeAboutTeam({
    openDialog: openOverlayDialog,
    closeDialog: closeOverlayDialog,
    focusWithoutScroll,
    restoreFocus,
    captureViewportPosition,
    scheduleViewportRestore,
    syncBodyScrollLockState
  });

  initHomeGallery({
    openDialog: openOverlayDialog,
    closeDialog: closeOverlayDialog,
    focusWithoutScroll,
    restoreFocus,
    captureViewportPosition,
    scheduleViewportRestore,
    syncBodyScrollLockState
  });

  initHomeSamples({
    orderStorageKey: ORDER_STORAGE_KEY,
    openDialog: openOverlayDialog,
    closeDialog: closeOverlayDialog,
    focusWithoutScroll,
    restoreFocus,
    captureViewportPosition,
    scheduleViewportRestore,
    syncBodyScrollLockState,
    showToast
  });

  initHomeReviews({
    openOverlayDialog,
    closeOverlayDialog,
    focusFirstIn,
    restoreFocus,
    captureViewportPosition,
    scheduleViewportRestore,
    syncBodyScrollLockState,
    observeRevealElements,
    showToast
  });
}
