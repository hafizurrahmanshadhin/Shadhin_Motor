function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function initScrollProgress() {
  const root = document.documentElement;
  let rafId = 0;

  const update = () => {
    rafId = 0;
    const scrollRange = Math.max(1, root.scrollHeight - window.innerHeight);
    const nextValue = clamp((window.scrollY || window.pageYOffset || 0) / scrollRange, 0, 1);
    root.style.setProperty('--scroll-progress', nextValue.toFixed(4));
  };

  const scheduleUpdate = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate, { once: true });
}

export function initSharedExperience() {
  if (document.documentElement.dataset.sharedExperienceReady === 'true') return;

  document.documentElement.dataset.sharedExperienceReady = 'true';
  initScrollProgress();
}
