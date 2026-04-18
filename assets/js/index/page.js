import { initHomeLocalSeo } from './modules/local-seo.js';
import { initHomeNavigation } from './modules/navigation.js';
import { initHomeAboutTeam } from './modules/about-team.js';
import { initHomeGallery } from './modules/gallery.js';
import { initHomeSamples } from './modules/samples.js';
import { initHomeReviews } from './modules/reviews.js';

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

export function initHomePage() {
  if (!document.body?.classList.contains('home-page')) return;

  initHomeNavigation();
  initHomeLocalSeo();
  observePageRevealElements();

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  window.addEventListener('load', () => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  });

  initHomeAboutTeam();
  initHomeGallery();
  initHomeSamples();
  initHomeReviews();
}

if (document.body?.classList.contains('home-page')) {
  initHomePage();
}
