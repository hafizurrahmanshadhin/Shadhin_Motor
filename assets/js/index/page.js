import { initHomeNavigation } from './modules/navigation.js';

const loadedStylesheets = new Map();

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

function loadStylesheetOnce(href) {
  const absoluteHref = new URL(href, document.baseURI).href;
  const cachedPromise = loadedStylesheets.get(absoluteHref);
  if (cachedPromise) return cachedPromise;

  const existingLink = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .find(link => link.href === absoluteHref);

  if (existingLink) {
    const resolved = Promise.resolve(existingLink);
    loadedStylesheets.set(absoluteHref, resolved);
    return resolved;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = absoluteHref;

  const stylesheetPromise = new Promise(resolve => {
    link.addEventListener('load', () => resolve(link), { once: true });
    link.addEventListener('error', () => resolve(link), { once: true });
  });

  loadedStylesheets.set(absoluteHref, stylesheetPromise);
  document.head.appendChild(link);
  return stylesheetPromise;
}

function loadStylesheetGroup(hrefs = []) {
  return Promise.all(hrefs.map(loadStylesheetOnce));
}

function scheduleHomeDeferredAssets() {
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    loadStylesheetOnce('assets/css/index/async.css');
    import('../shared/accessibility-tools.js').catch(() => {});
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 1200 });
  }

  window.addEventListener('load', start, { once: true });
}

export function initHomePage() {
  if (!document.body?.classList.contains('home-page')) return;

  document.documentElement.setAttribute('data-enhanced', 'true');
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
    rootMargin = '420px 0px',
    styles = []
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
      loadStylesheetGroup(styles)
        .then(() => loader())
        .catch(() => {});
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
    immediate: activeHash === 'about',
    styles: ['assets/css/index/modules/about.css']
  });

  queueHomeModule('gallery', async () => {
    const { initHomeGallery } = await import('./modules/gallery.js');
    initHomeGallery();
  }, {
    immediate: activeHash === 'gallery',
    styles: ['assets/css/index/modules/gallery.css']
  });

  queueHomeModule(['samples', 'contact'], async () => {
    const { initHomeSamples } = await import('./modules/samples.js');
    initHomeSamples();
  }, {
    immediate: hasSampleQuery || activeHash === 'samples' || activeHash === 'contact',
    styles: [
      'assets/css/index/modules/samples.css',
      'assets/css/index/modules/contact.css'
    ]
  });

  queueHomeModule('local-seo', async () => {
    const { initHomeLocalSeo } = await import('./modules/local-seo.js');
    initHomeLocalSeo();
  }, {
    immediate: activeHash === 'local-seo',
    styles: ['assets/css/index/modules/local-seo.css']
  });

  queueHomeModule('reviews', async () => {
    const { initHomeReviews } = await import('./modules/reviews.js');
    initHomeReviews();
  }, {
    immediate: activeHash === 'reviews',
    styles: ['assets/css/index/modules/reviews.css']
  });
}

if (document.body?.classList.contains('home-page')) {
  initHomePage();
}
