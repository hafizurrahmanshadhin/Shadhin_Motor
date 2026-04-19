export function initHomeNavigation() {
  const navbar = document.getElementById('navbar');
  const navLinksContainer = document.getElementById('navLinks');
  const hamburgerBtn = document.getElementById('hamburger');
  const navLinks = Array.from(navLinksContainer?.querySelectorAll('a[href^="#"]') || []);
  const topAnchors = Array.from(document.querySelectorAll('a[href="#hero"]'));
  const trackedSections = Array.from(document.querySelectorAll('main section[id]'))
    .filter(section => navLinks.some(link => link.getAttribute('href') === `#${section.id}`));
  const trackedSectionStates = new Map();
  let navHeight = navbar?.offsetHeight || 0;
  let measurementFrame = 0;
  let sectionObserver = null;
  let anchorCorrectionTimer = 0;

  function syncNavbarMobileOffset() {
    if (!navbar) return;

    navHeight = navbar.offsetHeight || 0;
    const mobileOffset = Math.max(56, Math.ceil(navHeight));
    document.documentElement.style.setProperty('--navbar-mobile-offset', `${mobileOffset}px`);
  }

  function updateNavToggleButtonState(isOpen) {
    if (!hamburgerBtn) return;

    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    const openLabel = hamburgerBtn.dataset.openLabel || hamburgerBtn.getAttribute('aria-label') || '';
    const closeLabel = hamburgerBtn.dataset.closeLabel || openLabel;
    hamburgerBtn.setAttribute('aria-label', isOpen ? closeLabel : openLabel);
  }

  function setActiveNavLink(targetId = '') {
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === targetId;
      link.classList.toggle('active', isActive);

      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function updateNavbarState() {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }
  }

  function getTargetScrollOffset(target) {
    if (!(target instanceof HTMLElement)) {
      return navHeight + 18;
    }

    const styles = window.getComputedStyle(target);
    const targetScrollMargin = parseFloat(styles.scrollMarginTop || '0') || 0;
    const fallbackOffset = navHeight + (window.innerWidth <= 900 ? 18 : 22);
    return Math.max(targetScrollMargin, fallbackOffset);
  }

  function scrollToHashTarget(targetId, {
    updateHash = false,
    behavior
  } = {}) {
    if (!targetId || !targetId.startsWith('#')) return;

    const target = document.querySelector(targetId);
    if (!(target instanceof HTMLElement)) return;

    syncNavbarMobileOffset();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resolvedBehavior = behavior || (reduceMotion ? 'auto' : 'smooth');

    const performScroll = nextBehavior => {
      const offset = getTargetScrollOffset(target);
      const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
      window.scrollTo({ top, behavior: nextBehavior });
    };

    if (updateHash) {
      if (targetId === '#hero') {
        history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      } else if (window.location.hash !== targetId) {
        history.pushState(null, '', targetId);
      } else {
        history.replaceState(null, '', targetId);
      }
    }

    performScroll(resolvedBehavior);

    window.clearTimeout(anchorCorrectionTimer);
    anchorCorrectionTimer = window.setTimeout(() => {
      performScroll('auto');
      requestMeasurements();
    }, reduceMotion ? 0 : 420);
  }

  function updateActiveNavLink() {
    const firstSection = trackedSections[0];
    const beforeFirstSection = firstSection instanceof HTMLElement
      ? firstSection.getBoundingClientRect().top > navHeight + Math.max(24, Math.round(window.innerHeight * 0.08))
      : window.scrollY < 40;

    if (beforeFirstSection) {
      setActiveNavLink('');
      return;
    }

    const visibleSections = Array.from(trackedSectionStates.entries())
      .filter(([, state]) => state.isIntersecting)
      .sort((left, right) => {
        return Math.abs(left[1].top) - Math.abs(right[1].top);
      });

    if (visibleSections.length) {
      setActiveNavLink(visibleSections[0][0]);
      return;
    }

    const lastSection = trackedSections.at(-1);
    const isNearPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 32;
    if (isNearPageBottom && lastSection) {
      setActiveNavLink(`#${lastSection.id}`);
    }
  }

  function buildSectionObserver() {
    syncNavbarMobileOffset();

    if (sectionObserver) {
      sectionObserver.disconnect();
      sectionObserver = null;
    }

    trackedSectionStates.clear();

    if (!trackedSections.length || typeof IntersectionObserver !== 'function') {
      updateActiveNavLink();
      return;
    }

    sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        trackedSectionStates.set(`#${entry.target.id}`, {
          isIntersecting: entry.isIntersecting,
          top: entry.boundingClientRect.top
        });
      });

      updateActiveNavLink();
    }, {
      rootMargin: `-${navHeight + 110}px 0px -55% 0px`,
      threshold: [0, 0.15, 0.35, 0.6, 0.85]
    });

    trackedSections.forEach(section => sectionObserver?.observe(section));
  }

  function requestMeasurements() {
    if (measurementFrame) return;

    measurementFrame = window.requestAnimationFrame(() => {
      measurementFrame = 0;
      buildSectionObserver();
      updateActiveNavLink();
    });
  }

  function toggleNav(forceOpen) {
    if (!navLinksContainer) return;

    const nextState = typeof forceOpen === 'boolean'
      ? forceOpen
      : !navLinksContainer.classList.contains('open');

    if (nextState) syncNavbarMobileOffset();

    navLinksContainer.classList.toggle('open', nextState);
    updateNavToggleButtonState(nextState);
  }

  buildSectionObserver();
  window.addEventListener('scroll', () => {
    updateNavbarState();
    updateActiveNavLink();
  }, { passive: true });
  window.addEventListener('load', requestMeasurements);
  window.addEventListener('resize', requestMeasurements);
  window.addEventListener('hashchange', () => {
    scrollToHashTarget(window.location.hash, { updateHash: false, behavior: 'auto' });
    requestMeasurements();
  });

  if (typeof ResizeObserver === 'function') {
    const resizeObserver = new ResizeObserver(() => requestMeasurements());
    if (navbar) resizeObserver.observe(navbar);
  }

  updateNavbarState();
  updateActiveNavLink();

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => toggleNav());
  }

  navLinks.forEach(anchor => {
    anchor.addEventListener('click', event => {
      toggleNav(false);

      const targetId = anchor.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        event.preventDefault();
        setActiveNavLink(targetId);
        scrollToHashTarget(targetId, { updateHash: true });
      }
    });
  });

  topAnchors.forEach(anchor => {
    anchor.addEventListener('click', event => {
      event.preventDefault();
      toggleNav(false);
      setActiveNavLink('');
      scrollToHashTarget('#hero', { updateHash: true });
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

  if (window.location.hash) {
    window.requestAnimationFrame(() => {
      scrollToHashTarget(window.location.hash, { updateHash: false, behavior: 'auto' });
    });
  }

  return {
    setActiveNavLink,
    updateActiveNavLink,
    toggleNav
  };
}
