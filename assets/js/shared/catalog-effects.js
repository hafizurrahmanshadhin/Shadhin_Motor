const MAGNETIC_TARGETS = new WeakSet();
const GLOW_TARGETS = new WeakSet();
const REVEAL_TARGETS = new WeakSet();

const PAGE_CONFIGS = [
  {
    bodyClass: 'gallery-catalog-page',
    magneticSelectors: [
      '.back-link',
      '.filter-btn',
      '.catalog-reset-btn',
      '.catalog-page-btn'
    ],
    glowSelectors: [
      '.gallery-card',
      '.lightbox-inner',
      '.lightbox-img-wrap'
    ],
    revealGroups: [
      { selector: '.gallery-grid .gallery-card', step: 0.028, maxDelay: 0.26 },
      { selector: '.catalog-results-footer', step: 0, maxDelay: 0 },
      { selector: '#sharedFooter .footer-brand, #sharedFooter .footer-col', step: 0.06, maxDelay: 0.24 }
    ],
    mutationRoots: ['#catalogPagination']
  },
  {
    bodyClass: 'samples-catalog-page',
    magneticSelectors: [
      '.samples-catalog-back-link',
      '.sample-filter-btn',
      '.samples-catalog-order-link',
      '.samples-catalog-reset-btn',
      '.samples-catalog-page-btn',
      '.sample-card-order-btn'
    ],
    glowSelectors: [
      '.sample-card',
      '.samples-catalog-hero-note',
      '.sample-modal',
      '.sample-modal-swatch'
    ],
    revealGroups: [
      { selector: '.samples-grid .sample-card', step: 0.028, maxDelay: 0.26 },
      { selector: '.samples-catalog-results-footer', step: 0, maxDelay: 0 },
      { selector: '#sharedFooter .footer-brand, #sharedFooter .footer-col', step: 0.06, maxDelay: 0.24 }
    ],
    mutationRoots: ['#samplesCatalogPagination']
  }
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function supportsFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
    || window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initPageAmbient(target) {
  if (!(target instanceof HTMLElement)) return;

  let frame = 0;
  let nextX = window.innerWidth * 0.5;
  let nextY = window.innerHeight * 0.28;

  const apply = () => {
    frame = 0;
    target.style.setProperty('--page-light-x', `${Math.round(nextX)}px`);
    target.style.setProperty('--page-light-y', `${Math.round(nextY)}px`);
  };

  const show = () => {
    target.style.setProperty('--page-light-opacity', '0.58');
  };

  const hide = () => {
    target.style.setProperty('--page-light-opacity', '0');
  };

  const queueApply = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(apply);
  };

  const updateFromPointer = event => {
    nextX = event.clientX;
    nextY = event.clientY;
    show();
    queueApply();
  };

  apply();
  document.addEventListener('pointermove', updateFromPointer, { passive: true });
  document.addEventListener('mousemove', updateFromPointer, { passive: true });
  document.addEventListener('mouseenter', show);
  window.addEventListener('mouseout', event => {
    if (event.relatedTarget === null) hide();
  });
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') hide();
  });
  window.addEventListener('resize', () => {
    nextX = Math.min(nextX, window.innerWidth);
    nextY = Math.min(nextY, window.innerHeight);
    queueApply();
  }, { passive: true });
}

function bindMagneticTarget(target) {
  if (!(target instanceof HTMLElement) || MAGNETIC_TARGETS.has(target)) return;

  MAGNETIC_TARGETS.add(target);

  let frame = 0;
  let nextX = 0;
  let nextY = 0;

  const apply = () => {
    frame = 0;
    target.style.setProperty('--btn-shift-x', `${nextX}px`);
    target.style.setProperty('--btn-shift-y', `${nextY}px`);
  };

  const queueApply = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(apply);
  };

  const handleMove = event => {
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);

    nextX = clamp(offsetX * 0.12, -8, 8);
    nextY = clamp(offsetY * 0.12, -6, 6);
    queueApply();
  };

  const reset = () => {
    nextX = 0;
    nextY = 0;
    queueApply();
  };

  apply();
  target.addEventListener('pointermove', handleMove);
  target.addEventListener('pointerleave', reset);
  target.addEventListener('blur', reset);
}

function bindGlowTarget(target, enablePointerTracking) {
  if (!(target instanceof HTMLElement) || GLOW_TARGETS.has(target)) return;

  GLOW_TARGETS.add(target);
  target.dataset.glowSurface = 'true';

  if (!enablePointerTracking) return;

  let frame = 0;
  let nextX = '50%';
  let nextY = '50%';

  const apply = () => {
    frame = 0;
    target.style.setProperty('--surface-glow-x', nextX);
    target.style.setProperty('--surface-glow-y', nextY);
  };

  const queueApply = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(apply);
  };

  const update = event => {
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    nextX = `${clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100).toFixed(2)}%`;
    nextY = `${clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100).toFixed(2)}%`;
    queueApply();
  };

  const reset = () => {
    nextX = '50%';
    nextY = '50%';
    queueApply();
  };

  apply();
  target.addEventListener('pointermove', update, { passive: true });
  target.addEventListener('pointerleave', reset);
  target.addEventListener('blur', reset);
}

function shouldRevealImmediately(target) {
  if (!(target instanceof HTMLElement)) return true;
  const rect = target.getBoundingClientRect();
  return rect.top <= window.innerHeight * 0.88;
}

function createRevealObserver() {
  if (prefersReducedMotion() || typeof IntersectionObserver !== 'function') return null;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -10% 0px'
  });

  return observer;
}

function bindRevealTarget(target, observer, delay) {
  if (!(target instanceof HTMLElement) || REVEAL_TARGETS.has(target)) return;

  REVEAL_TARGETS.add(target);
  target.classList.add('reveal');
  target.style.setProperty('--reveal-delay', `${delay.toFixed(3)}s`);

  if (!observer || shouldRevealImmediately(target)) {
    target.classList.add('visible');
    return;
  }

  observer.observe(target);
}

function applyConfig(config, observer, enablePointerTracking) {
  config.glowSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(target => {
      bindGlowTarget(target, enablePointerTracking);
    });
  });

  config.revealGroups.forEach(group => {
    const targets = Array.from(document.querySelectorAll(group.selector));
    targets.forEach((target, index) => {
      const delay = Math.min(index * group.step, group.maxDelay);
      bindRevealTarget(target, observer, delay);
    });
  });

  if (enablePointerTracking) {
    config.magneticSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(target => {
        bindMagneticTarget(target);
      });
    });
  }
}

function initDynamicSync(config, observer, enablePointerTracking) {
  if (typeof MutationObserver !== 'function') return;

  const roots = config.mutationRoots
    .map(selector => document.querySelector(selector))
    .filter(root => root instanceof HTMLElement);

  if (!roots.length) return;

  let frame = 0;
  const scheduleSync = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      applyConfig(config, observer, enablePointerTracking);
    });
  };

  const mutationObserver = new MutationObserver(scheduleSync);
  roots.forEach(root => mutationObserver.observe(root, { childList: true, subtree: true }));
}

export function initCatalogPageEffects() {
  const body = document.body;
  if (!(body instanceof HTMLElement)) return;

  const config = PAGE_CONFIGS.find(entry => body.classList.contains(entry.bodyClass));
  if (!config) return;

  if (body.dataset.catalogEffectsReady === 'true') return;
  body.dataset.catalogEffectsReady = 'true';

  const enablePointerTracking = supportsFinePointer() && !prefersReducedMotion();
  const observer = createRevealObserver();

  if (enablePointerTracking) {
    initPageAmbient(body);
  }

  applyConfig(config, observer, enablePointerTracking);
  initDynamicSync(config, observer, enablePointerTracking);
}
