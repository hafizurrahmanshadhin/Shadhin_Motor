function supportsFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
    || window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initPageAmbient() {
  const target = document.body;
  if (!(target instanceof HTMLElement) || !target.classList.contains('home-page')) return;

  let frame = 0;
  let nextX = window.innerWidth * 0.5;
  let nextY = window.innerHeight * 0.28;

  const apply = () => {
    frame = 0;
    target.style.setProperty('--page-light-x', `${Math.round(nextX)}px`);
    target.style.setProperty('--page-light-y', `${Math.round(nextY)}px`);
  };

  const show = () => {
    target.style.setProperty('--page-light-opacity', '0.62');
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

  const reset = () => {
    hide();
  };

  apply();
  document.addEventListener('pointermove', updateFromPointer, { passive: true });
  document.addEventListener('mousemove', updateFromPointer, { passive: true });
  document.addEventListener('mouseenter', show);
  window.addEventListener('mouseout', event => {
    if (event.relatedTarget === null) reset();
  });
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') reset();
  });
  window.addEventListener('resize', () => {
    nextX = Math.min(nextX, window.innerWidth);
    nextY = Math.min(nextY, window.innerHeight);
    queueApply();
  }, { passive: true });
}

function initMagneticActions() {
  const targets = Array.from(document.querySelectorAll('.hero-actions > a, .hero-actions > button'));
  if (!targets.length) return;

  targets.forEach(target => {
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

      nextX = Math.max(-8, Math.min(8, offsetX * 0.12));
      nextY = Math.max(-6, Math.min(6, offsetY * 0.12));
      queueApply();
    };

    const reset = () => {
      nextX = 0;
      nextY = 0;
      queueApply();
    };

    target.addEventListener('pointermove', handleMove);
    target.addEventListener('pointerleave', reset);
    target.addEventListener('blur', reset);
  });
}

export function initHomeAmbientEffects() {
  if (!supportsFinePointer() || prefersReducedMotion()) return;

  initPageAmbient();
  initMagneticActions();
}
