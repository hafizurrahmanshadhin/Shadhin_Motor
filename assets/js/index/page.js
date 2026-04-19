import { initHomeNavigation } from './modules/navigation.js';
import { initSharedExperience } from '../shared/experience.js';
import { initPageLocalization } from '../shared/i18n.js';

function observePageRevealElements(root = document) {
  if (typeof IntersectionObserver !== 'function') {
    root.querySelectorAll('.reveal').forEach(element => {
      element.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.08 });

  root.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

function scheduleHomeDeferredAssets() {
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    import('../shared/accessibility-tools.js').catch(() => {});
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 1200 });
  }

  window.addEventListener('load', start, { once: true });
}

export function initHomePage() {
  if (!document.body?.classList.contains('home-page')) return;

  initPageLocalization('home');
  document.documentElement.setAttribute('data-enhanced', 'true');
  initSharedExperience();
  initHomeNavigation();
  observePageRevealElements();
  scheduleHomeDeferredAssets();

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  window.addEventListener('load', () => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  });

  function queueHomeModule(keys, loader, {
    immediate = false,
    rootMargin = '420px 0px'
  } = {}) {
    const queueKeys = Array.isArray(keys) ? keys : [keys];
    const sections = queueKeys
      .map(key => document.getElementById(key))
      .filter(Boolean);

    if (!sections.length) return;

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      Promise.resolve(loader()).catch(() => {});
    };

    if (immediate || typeof IntersectionObserver !== 'function') {
      start();
      return;
    }

    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      start();
    }, {
      rootMargin,
      threshold: 0.01
    });

    sections.forEach(section => observer.observe(section));
  }

  const activeHash = window.location.hash.replace(/^#/, '');
  const hasSampleQuery = new URLSearchParams(window.location.search).has('sample');

  queueHomeModule('about', async () => {
    const { initHomeAboutTeam } = await import('./modules/about-team.js');
    initHomeAboutTeam();
  }, {
    immediate: activeHash === 'about'
  });

  queueHomeModule('gallery', async () => {
    const { initHomeGallery } = await import('./modules/gallery.js');
    initHomeGallery();
  }, {
    immediate: activeHash === 'gallery'
  });

  queueHomeModule(['samples', 'contact'], async () => {
    const { initHomeSamples } = await import('./modules/samples.js');
    initHomeSamples();
  }, {
    immediate: hasSampleQuery || activeHash === 'samples' || activeHash === 'contact'
  });

  queueHomeModule('local-seo', async () => {
    const { initHomeLocalSeo } = await import('./modules/local-seo.js');
    initHomeLocalSeo();
  }, {
    immediate: activeHash === 'local-seo'
  });

  queueHomeModule('reviews', async () => {
    const { initHomeReviews } = await import('./modules/reviews.js');
    initHomeReviews();
  }, {
    immediate: activeHash === 'reviews'
  });
}

if (document.body?.classList.contains('home-page')) {
  initHomePage();
}
