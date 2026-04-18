export function initHomeNavigation() {
  const navbar = document.getElementById('navbar');
  const navLinksContainer = document.getElementById('navLinks');
  const hamburgerBtn = document.getElementById('hamburger');
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const trackedSections = Array.from(document.querySelectorAll('section[id]'))
    .filter(section => navLinks.some(link => link.getAttribute('href') === `#${section.id}`));

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

  function updateActiveNavLink() {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }

    const navHeight = navbar?.offsetHeight || 0;
    const scrollMark = window.scrollY + navHeight + 120;
    let activeId = '';

    trackedSections.forEach(section => {
      if (scrollMark >= section.offsetTop) {
        activeId = `#${section.id}`;
      }
    });

    setActiveNavLink(activeId);
  }

  function toggleNav(forceOpen) {
    if (!navLinksContainer) return;

    const nextState = typeof forceOpen === 'boolean'
      ? forceOpen
      : !navLinksContainer.classList.contains('open');

    navLinksContainer.classList.toggle('open', nextState);
    updateNavToggleButtonState(nextState);
  }

  window.addEventListener('scroll', updateActiveNavLink);
  window.addEventListener('load', updateActiveNavLink);
  window.addEventListener('hashchange', updateActiveNavLink);
  updateActiveNavLink();

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => toggleNav());
  }

  document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', () => {
      toggleNav(false);

      const targetId = anchor.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        setActiveNavLink(targetId);
      }
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

  return {
    setActiveNavLink,
    updateActiveNavLink,
    toggleNav
  };
}
