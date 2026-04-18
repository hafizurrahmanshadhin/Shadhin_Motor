import { createOverlayRuntime } from '../shared/core/overlay-runtime.js';
import { createRevealObserver } from '../shared/core/reveal-observer.js';
import { initHomeLocalSeo } from './modules/local-seo.js';
import { initHomeNavigation } from './modules/navigation.js';
import { initHomeAboutTeam } from './modules/about-team.js';
import { initHomeGallery } from './modules/gallery.js';
import { initHomeSamples } from './modules/samples.js';
import { initHomeReviews } from './modules/reviews.js';

export function initHomePage() {
  const overlayRuntime = createOverlayRuntime();
  const { observeRevealElements } = createRevealObserver();

  initHomeNavigation();
  initHomeLocalSeo();
  observeRevealElements();

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  window.addEventListener('load', () => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  });

  window.addEventListener('pageshow', overlayRuntime.syncBodyScrollLockState);
  window.addEventListener('resize', overlayRuntime.syncBodyScrollLockState);
  window.addEventListener('orientationchange', overlayRuntime.syncBodyScrollLockState);
  overlayRuntime.syncBodyScrollLockState();

  initHomeAboutTeam({
    openDialog: overlayRuntime.openDialog,
    closeDialog: overlayRuntime.closeDialog,
    focusWithoutScroll: overlayRuntime.focusWithoutScroll,
    restoreFocus: overlayRuntime.restoreFocus,
    captureViewportPosition: overlayRuntime.captureViewportPosition,
    scheduleViewportRestore: overlayRuntime.scheduleViewportRestore,
    syncBodyScrollLockState: overlayRuntime.syncBodyScrollLockState
  });

  initHomeGallery({
    openDialog: overlayRuntime.openDialog,
    closeDialog: overlayRuntime.closeDialog,
    focusWithoutScroll: overlayRuntime.focusWithoutScroll,
    restoreFocus: overlayRuntime.restoreFocus,
    captureViewportPosition: overlayRuntime.captureViewportPosition,
    scheduleViewportRestore: overlayRuntime.scheduleViewportRestore,
    syncBodyScrollLockState: overlayRuntime.syncBodyScrollLockState
  });

  initHomeSamples({
    openDialog: overlayRuntime.openDialog,
    closeDialog: overlayRuntime.closeDialog,
    focusWithoutScroll: overlayRuntime.focusWithoutScroll,
    restoreFocus: overlayRuntime.restoreFocus,
    captureViewportPosition: overlayRuntime.captureViewportPosition,
    scheduleViewportRestore: overlayRuntime.scheduleViewportRestore,
    syncBodyScrollLockState: overlayRuntime.syncBodyScrollLockState,
    showToast: overlayRuntime.showToast
  });

  initHomeReviews({
    openOverlayDialog: overlayRuntime.openDialog,
    closeOverlayDialog: overlayRuntime.closeDialog,
    focusFirstIn: overlayRuntime.focusFirstIn,
    restoreFocus: overlayRuntime.restoreFocus,
    captureViewportPosition: overlayRuntime.captureViewportPosition,
    scheduleViewportRestore: overlayRuntime.scheduleViewportRestore,
    syncBodyScrollLockState: overlayRuntime.syncBodyScrollLockState,
    observeRevealElements,
    showToast: overlayRuntime.showToast
  });
}

initHomePage();
