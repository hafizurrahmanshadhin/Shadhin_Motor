function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function initHomeLocalSeo() {
  const section = document.getElementById('local-seo');
  if (!section) return;

  const headerBlock = section.querySelector('.section-header');
  const title = section.querySelector('#localSeoTitle');
  const layoutGrid = section.querySelector('.local-seo-grid');
  const faqList = section.querySelector('.faq-list');
  const copyPanel = section.querySelector('.local-seo-copy');
  const sourceItems = Array.from(faqList?.querySelectorAll('.faq-item') || []);
  if (!faqList || !sourceItems.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const templates = sourceItems.map((item, index) => {
    const clone = item.cloneNode(true);
    clone.dataset.faqSource = String(index);
    clone.open = false;
    return clone;
  });

  faqList.textContent = '';

  const track = document.createElement('div');
  track.className = 'faq-scroll-track';
  faqList.append(track);

  let renderedItems = [];
  let hovered = false;
  let focusWithin = false;
  let sectionVisible = true;
  let rafId = 0;
  let resizeRaf = 0;
  let lastTimestamp = 0;
  let offset = 0;
  let running = false;

  function applyViewportHeight() {
    let nextHeight = 0;
    let nextOffset = 0;

    if (window.innerWidth > 1180) {
      const gridRect = layoutGrid instanceof HTMLElement ? layoutGrid.getBoundingClientRect() : null;
      const titleRect = title instanceof HTMLElement ? title.getBoundingClientRect() : null;
      const copyRect = copyPanel instanceof HTMLElement ? copyPanel.getBoundingClientRect() : null;
      const currentFaqRect = faqList.getBoundingClientRect();
      const fallbackHeight = clamp(window.innerHeight * 0.5, 320, 720);

      if (gridRect && titleRect && copyRect) {
        const measuredOverflow = faqList.classList.contains('visible') && copyPanel?.classList.contains('visible')
          ? Math.max(0, currentFaqRect.bottom - copyRect.bottom)
          : 0;

        nextOffset = Math.round(titleRect.top - gridRect.top);
        nextHeight = Math.max(280, copyRect.bottom - titleRect.top - measuredOverflow - 2);
      } else {
        nextHeight = fallbackHeight;
      }
    } else if (window.innerWidth > 900) {
      const copyHeight = copyPanel instanceof HTMLElement ? copyPanel.offsetHeight : 0;
      const desktopMax = Math.max(320, Math.min(window.innerHeight * 0.62, 520));
      const desktopMin = Math.min(300, desktopMax);
      nextHeight = copyHeight > 0
        ? clamp(copyHeight, desktopMin, desktopMax)
        : desktopMax;
    } else if (window.innerWidth > 640) {
      nextHeight = clamp(window.innerHeight * 0.48, 300, 420);
    } else {
      nextHeight = clamp(window.innerHeight * 0.42, 250, 340);
    }

    faqList.style.setProperty('--faq-list-offset-top', `${Math.round(nextOffset)}px`);
    faqList.style.setProperty('--faq-list-height', `${Math.round(nextHeight)}px`);
  }

  function getViewportHeight() {
    return faqList.getBoundingClientRect().height || faqList.clientHeight || 0;
  }

  function getGapSize() {
    const styles = window.getComputedStyle(track);
    return parseFloat(styles.rowGap || styles.gap || '0') || 0;
  }

  function getSpeed() {
    if (window.innerWidth <= 640) return 24;
    if (window.innerWidth <= 1180) return 28;
    return 34;
  }

  function getRenderedOpenItem() {
    return renderedItems.find(item => item.open) || null;
  }

  function setTrackTransform() {
    track.style.transform = `translate3d(0, ${-offset.toFixed(2)}px, 0)`;
  }

  function getItemBlockSize(item) {
    if (!(item instanceof HTMLElement)) return 0;
    return item.getBoundingClientRect().height + getGapSize();
  }

  function normalizeTrackOffset() {
    let firstItem = track.firstElementChild;
    let guard = 0;

    while (firstItem instanceof HTMLElement && offset >= getItemBlockSize(firstItem) && guard < renderedItems.length + 4) {
      offset -= getItemBlockSize(firstItem);
      track.append(firstItem);
      firstItem = track.firstElementChild;
      guard += 1;
    }
  }

  function keepItemInView(item) {
    if (!(item instanceof HTMLElement)) return;

    requestAnimationFrame(() => {
      const viewportRect = faqList.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const padding = window.innerWidth <= 640 ? 14 : 18;

      if (itemRect.bottom > viewportRect.bottom - padding) {
        offset += itemRect.bottom - (viewportRect.bottom - padding);
      } else if (itemRect.top < viewportRect.top + padding) {
        offset = Math.max(0, offset - ((viewportRect.top + padding) - itemRect.top));
      }

      normalizeTrackOffset();
      setTrackTransform();
    });
  }

  function closeOtherItems(activeItem) {
    renderedItems.forEach(item => {
      if (item !== activeItem && item.open) {
        item.open = false;
      }
    });
  }

  function stopAutoScroll() {
    running = false;
    lastTimestamp = 0;

    if (!rafId) return;

    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function tick(timestamp) {
    if (!running) return;

    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    const elapsed = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
    lastTimestamp = timestamp;
    offset += getSpeed() * elapsed;
    normalizeTrackOffset();
    setTrackTransform();
    rafId = requestAnimationFrame(tick);
  }

  function startAutoScroll() {
    if (running) return;
    running = true;
    lastTimestamp = 0;
    rafId = requestAnimationFrame(tick);
  }

  function syncAutoScrollState() {
    const hasOpenItem = Boolean(getRenderedOpenItem());
    const canScroll = !prefersReducedMotion.matches
      && sectionVisible
      && templates.length > 0
      && !hovered
      && !focusWithin
      && !hasOpenItem;

    faqList.classList.toggle('is-open', hasOpenItem);
    faqList.classList.toggle('is-paused', !canScroll);
    faqList.dataset.scrollState = canScroll ? 'running' : 'paused';

    if (canScroll) {
      startAutoScroll();
    } else {
      stopAutoScroll();
      setTrackTransform();
    }
  }

  function bindRenderedItemEvents() {
    renderedItems.forEach(item => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          closeOtherItems(item);
          keepItemInView(item);
        }

        syncAutoScrollState();
      });
    });
  }

  function buildTrack() {
    const openSource = getRenderedOpenItem()?.dataset.faqSource || '';
    const minViewportHeight = Math.max(getViewportHeight(), 320);
    const minCycles = prefersReducedMotion.matches
      ? 1
      : templates.length === 1
        ? 4
        : templates.length <= 4
          ? 2
          : 1;

    track.textContent = '';
    offset = 0;
    faqList.dataset.scrollState = 'paused';

    let cycles = 0;
    while (cycles < minCycles || (!prefersReducedMotion.matches && track.scrollHeight < minViewportHeight * 1.85)) {
      templates.forEach((template, index) => {
        const item = template.cloneNode(true);
        item.dataset.faqSource = String(index);
        item.open = false;
        track.append(item);
      });

      cycles += 1;

      if (cycles >= 12) {
        break;
      }
    }

    renderedItems = Array.from(track.querySelectorAll('.faq-item'));

    if (openSource) {
      const firstMatch = renderedItems.find(item => item.dataset.faqSource === openSource);
      if (firstMatch) {
        firstMatch.open = true;
      }
    }

    bindRenderedItemEvents();
    setTrackTransform();
    syncAutoScrollState();
  }

  function scheduleRebuild() {
    if (resizeRaf) return;

    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      applyViewportHeight();
      buildTrack();
    });
  }

  faqList.addEventListener('mouseenter', () => {
    hovered = true;
    syncAutoScrollState();
  });

  faqList.addEventListener('mouseleave', () => {
    hovered = false;
    syncAutoScrollState();
  });

  faqList.addEventListener('focusin', () => {
    focusWithin = true;
    syncAutoScrollState();
  });

  faqList.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      focusWithin = faqList.contains(document.activeElement);
      syncAutoScrollState();
    });
  });

  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(entries => {
      sectionVisible = entries.some(entry => entry.isIntersecting);

      if (sectionVisible) {
        scheduleRebuild();
      }

      syncAutoScrollState();
    }, {
      threshold: 0.12
    });

    observer.observe(faqList);
  }

  if (typeof ResizeObserver === 'function') {
    const resizeObserver = new ResizeObserver(() => scheduleRebuild());
    resizeObserver.observe(faqList);
    if (headerBlock instanceof HTMLElement) {
      resizeObserver.observe(headerBlock);
    }
    if (title instanceof HTMLElement) {
      resizeObserver.observe(title);
    }
    if (copyPanel instanceof HTMLElement) {
      resizeObserver.observe(copyPanel);
    }
    if (layoutGrid instanceof HTMLElement) {
      resizeObserver.observe(layoutGrid);
    }
  } else {
    window.addEventListener('resize', scheduleRebuild);
  }

  if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', scheduleRebuild);
  }

  applyViewportHeight();
  buildTrack();
}
