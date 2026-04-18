const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

function openOverlayDialog(dialog) {
  if (!dialog) return;

  try {
    if (typeof dialog.showModal === 'function' && !dialog.open) {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  } catch {
    dialog.setAttribute('open', '');
  }

  dialog.classList.add('open');
}

function closeOverlayDialog(dialog) {
  if (!dialog) return;

  dialog.classList.remove('open');

  if (typeof dialog.close === 'function' && dialog.open) {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
}

function focusWithoutScroll(target) {
  if (!(target instanceof HTMLElement) || typeof target.focus !== 'function') return;

  try {
    target.focus({ preventScroll: true });
  } catch {
    target.focus();
  }
}

function focusFirstIn(container) {
  focusWithoutScroll(container?.querySelector(FOCUSABLE_SELECTOR) || null);
}

function restoreFocus(target) {
  focusWithoutScroll(target);
}

function captureViewportPosition() {
  const scrollRoot = document.scrollingElement || document.documentElement || document.body;

  return {
    x: scrollRoot?.scrollLeft || window.scrollX || window.pageXOffset || 0,
    y: scrollRoot?.scrollTop || window.scrollY || window.pageYOffset || 0
  };
}

function restoreViewportPosition(viewport) {
  if (!viewport) return;

  const restoreX = Number.isFinite(viewport.x) ? viewport.x : 0;
  const restoreY = Number.isFinite(viewport.y) ? viewport.y : 0;
  const root = document.documentElement;
  const scrollRoot = document.scrollingElement || document.documentElement || document.body;
  const previousRootBehavior = root?.style.scrollBehavior || '';
  const previousScrollRootBehavior = scrollRoot instanceof HTMLElement ? scrollRoot.style.scrollBehavior : '';

  if (root) {
    root.style.scrollBehavior = 'auto';
  }

  if (scrollRoot instanceof HTMLElement) {
    scrollRoot.style.scrollBehavior = 'auto';
  }

  if (scrollRoot) {
    scrollRoot.scrollLeft = restoreX;
    scrollRoot.scrollTop = restoreY;
  }

  window.scrollTo({ left: restoreX, top: restoreY, behavior: 'auto' });

  requestAnimationFrame(() => {
    if (root) {
      root.style.scrollBehavior = previousRootBehavior;
    }

    if (scrollRoot instanceof HTMLElement) {
      scrollRoot.style.scrollBehavior = previousScrollRootBehavior;
    }
  });
}

function scheduleViewportRestore(viewport) {
  if (!viewport) return;

  requestAnimationFrame(() => {
    restoreViewportPosition(viewport);
    requestAnimationFrame(() => restoreViewportPosition(viewport));
  });
}

function lockBodyScroll(root, body) {
  body.classList.add('body-scroll-locked');

  if (body.dataset.scrollLockActive !== 'true') {
    const viewport = captureViewportPosition();
    body.dataset.scrollLockActive = 'true';
    body.dataset.scrollLockX = String(viewport.x);
    body.dataset.scrollLockY = String(viewport.y);
    body.dataset.scrollLockGap = String(Math.max(0, window.innerWidth - root.clientWidth));
  }

  const restoreY = Number.parseInt(body.dataset.scrollLockY || '0', 10) || 0;
  const scrollbarGap = Number.parseInt(body.dataset.scrollLockGap || '0', 10) || 0;

  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${restoreY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';

  if (scrollbarGap > 0) {
    body.style.paddingRight = `${scrollbarGap}px`;
    return;
  }

  body.style.removeProperty('padding-right');
}

function unlockBodyScroll(body) {
  body.classList.remove('body-scroll-locked');
  body.style.removeProperty('overflow');

  if (body.dataset.scrollLockActive !== 'true') return;

  const restoreX = Number.parseInt(body.dataset.scrollLockX || '0', 10) || 0;
  const restoreY = Number.parseInt(body.dataset.scrollLockY || '0', 10) || 0;

  delete body.dataset.scrollLockActive;
  delete body.dataset.scrollLockX;
  delete body.dataset.scrollLockY;
  delete body.dataset.scrollLockGap;

  body.style.removeProperty('position');
  body.style.removeProperty('top');
  body.style.removeProperty('left');
  body.style.removeProperty('right');
  body.style.removeProperty('width');
  body.style.removeProperty('padding-right');

  window.scrollTo({ left: restoreX, top: restoreY, behavior: 'auto' });
}

function syncBodyScrollLockState() {
  const root = document.documentElement;
  const body = document.body;
  const shouldLock = Array.from(document.querySelectorAll('dialog')).some(dialog => {
    return dialog.open || dialog.classList.contains('open');
  });

  if (!root || !body) return;

  if (shouldLock) {
    lockBodyScroll(root, body);
    return;
  }

  unlockBodyScroll(body);
}

function observeRevealElements(root = document) {
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

function showToast(title, message, duration = 4000) {
  const toastEl = document.getElementById('toast');
  const titleEl = document.getElementById('toastTitle');
  const messageEl = document.getElementById('toastMsg');

  if (!toastEl || !titleEl || !messageEl) return;

  window.clearTimeout(Number(toastEl.dataset.toastTimer || '0'));

  titleEl.textContent = title;
  messageEl.textContent = message;
  toastEl.classList.add('show');

  const toastTimer = window.setTimeout(() => {
    toastEl.classList.remove('show');
  }, duration);

  toastEl.dataset.toastTimer = String(toastTimer);
}

export function initHomeReviews() {
  const uiTextRoot = document.getElementById('homeReviewsUiText');

  function getUiText(key) {
    const value = uiTextRoot?.querySelector(`[data-key="${key}"]`)?.textContent?.trim();
    return value || '';
  }

  const reviewState = {
    cards: [],
    page: 1,
    perPage: 3,
    resizeTick: 0
  };

  const reviewPreviewState = {
    items: [],
    index: 0,
    title: getUiText('previewTitleDefault'),
    trigger: null,
    viewport: null,
    restoreFocusOnClose: true
  };

  const reviewUploadFormState = {
    avatarFile: null,
    mediaFiles: []
  };

  const reviewUploadPreviewState = {
    objectUrls: []
  };
  const reviewMediaVideoState = {
    cache: new Map(),
    objectUrls: []
  };

  const reviewSubmitConfirmState = {
    pendingPayload: null,
    submitting: false,
    previewUrls: []
  };

  const modalState = {
    reviewSubmitTrigger: null,
    reviewSubmitViewport: null
  };

  const REVIEW_IMAGE_EXT_RE = /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)$/i;
  const REVIEW_VIDEO_EXT_RE = /\.(3gp|avi|m4v|mkv|mov|mp4|ogg|ogv|webm)$/i;

  function escapeHTML(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, char => {
      if (char === '&') return '&amp;';
      if (char === '<') return '&lt;';
      if (char === '>') return '&gt;';
      if (char === '"') return '&quot;';
      return '&#39;';
    });
  }

  function escapeAttr(value = '') {
    return escapeHTML(value).replace(/`/g, '&#96;');
  }

  function formatText(template, tokens = {}) {
    return String(template || '').replace(/\{(\w+)\}/g, (_, key) => {
      return Object.prototype.hasOwnProperty.call(tokens, key) ? String(tokens[key] ?? '') : '';
    });
  }

  function getReviewFileKind(file) {
    if (!file) return 'unknown';

    const mime = String(file.type || '').toLowerCase();
    const name = String(file.name || '').toLowerCase();

    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (REVIEW_IMAGE_EXT_RE.test(name)) return 'image';
    if (REVIEW_VIDEO_EXT_RE.test(name)) return 'video';
    return 'unknown';
  }

  function formatReviewFileSize(bytes = 0) {
    const size = Number(bytes) || 0;
    if (size <= 0) return '0 B';
    if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    if (size >= 1024) return `${Math.round(size / 1024)} KB`;
    return `${size} B`;
  }

  function releaseUrls(listRef) {
    listRef.forEach(url => {
      if (typeof url !== 'string' || !url.startsWith('blob:')) return;
      URL.revokeObjectURL(url);
    });
    listRef.length = 0;
  }

  function createPreviewUrl(file, listRef) {
    if (!file || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return '';
    const objectUrl = URL.createObjectURL(file);
    listRef.push(objectUrl);
    return objectUrl;
  }

  function loadReviewImageSource(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      image.src = src;
    });
  }

  function drawReviewVideoFrame(context, image, width, height) {
    const imageRatio = image.width / image.height;
    const canvasRatio = width / height;
    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imageRatio > canvasRatio) {
      drawHeight = height;
      drawWidth = height * imageRatio;
      offsetX = (width - drawWidth) / 2;
    } else {
      drawWidth = width;
      drawHeight = width / imageRatio;
      offsetY = (height - drawHeight) / 2;
    }

    context.clearRect(0, 0, width, height);
    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  }

  async function buildReviewVideoClipFromFrames(frameSources) {
    const cacheKey = frameSources.join('|');
    if (reviewMediaVideoState.cache.has(cacheKey)) {
      return reviewMediaVideoState.cache.get(cacheKey);
    }

    if (
      typeof MediaRecorder === 'undefined'
      || typeof HTMLCanvasElement === 'undefined'
      || typeof HTMLCanvasElement.prototype.captureStream !== 'function'
    ) {
      throw new Error('Video preview is not supported in this browser.');
    }

    const mimeCandidates = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];
    const mimeType = typeof MediaRecorder.isTypeSupported === 'function'
      ? mimeCandidates.find(type => MediaRecorder.isTypeSupported(type))
      : mimeCandidates[mimeCandidates.length - 1];

    if (!mimeType) {
      throw new Error('No supported video recording format was found.');
    }

    const frames = await Promise.all(frameSources.map(loadReviewImageSource));
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 720;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas rendering is unavailable.');
    }

    const stream = canvas.captureStream(8);
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks = [];

    recorder.addEventListener('dataavailable', event => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    });

    const recordPromise = new Promise((resolve, reject) => {
      recorder.addEventListener('stop', () => {
        if (!chunks.length) {
          reject(new Error('Video recording returned no data.'));
          return;
        }

        const blob = new Blob(chunks, { type: mimeType });
        const objectUrl = URL.createObjectURL(blob);
        reviewMediaVideoState.objectUrls.push(objectUrl);
        reviewMediaVideoState.cache.set(cacheKey, objectUrl);
        resolve(objectUrl);
      }, { once: true });

      recorder.addEventListener('error', event => {
        reject(event.error || new Error('Video recording failed.'));
      }, { once: true });
    });

    recorder.start();

    for (let frameIndex = 0; frameIndex < frames.length * 2; frameIndex += 1) {
      const frame = frames[frameIndex % frames.length];
      drawReviewVideoFrame(context, frame, canvas.width, canvas.height);
      // Keep the clip short and light while still feeling like a real video preview.
      // 260ms per frame gives enough motion without bloating the output blob.
      await new Promise(resolve => window.setTimeout(resolve, 260));
    }

    recorder.stop();
    return recordPromise;
  }

  function getReviewMediaThumbnailSource(trigger) {
    const image = trigger.querySelector('img');
    if (!(image instanceof HTMLImageElement)) return '';
    return image.currentSrc || image.src || '';
  }

  function getReviewMediaPosterSource(trigger) {
    const explicitPoster = String(trigger.dataset.reviewMediaPoster || '').trim();
    if (explicitPoster) return explicitPoster;

    const video = trigger.querySelector('video');
    if (video instanceof HTMLVideoElement && video.poster) {
      return video.poster;
    }

    return getReviewMediaThumbnailSource(trigger);
  }

  async function resolveReviewMediaItem(trigger) {
    const type = trigger.dataset.reviewMediaType === 'video' ? 'video' : 'image';
    const label = trigger.dataset.reviewMediaLabel || getUiText('previewTitleDefault');
    const source = String(trigger.dataset.reviewMediaSrc || '').trim() || getReviewMediaThumbnailSource(trigger);

    if (type === 'video') {
      if (source) {
        return {
          type: 'video',
          src: source,
          poster: getReviewMediaPosterSource(trigger),
          title: label
        };
      }

      const frameSources = String(trigger.dataset.reviewVideoFrames || '')
        .split('|')
        .map(value => value.trim())
        .filter(Boolean);
      const posterSrc = getReviewMediaPosterSource(trigger);

      try {
        const videoSrc = await buildReviewVideoClipFromFrames(frameSources);
        return {
          type: 'video',
          src: videoSrc,
          poster: posterSrc,
          title: label
        };
      } catch {
        return {
          type: 'image',
          src: posterSrc,
          title: label
        };
      }
    }

    return {
      type: 'image',
      src: source,
      title: label
    };
  }

  async function openReviewCardMediaGallery(trigger) {
    const card = trigger.closest('.review-card');
    if (!card) return;

    const triggers = Array.from(card.querySelectorAll('.review-media-item[data-review-media-type]'));
    if (!triggers.length) return;

    const items = (await Promise.all(triggers.map(resolveReviewMediaItem))).filter(item => item.src);
    if (!items.length) {
      showToast(
        getUiText('missingMediaTitle'),
        getUiText('missingMediaMessage')
      );
      return;
    }

    const startIndex = Math.max(0, triggers.indexOf(trigger));
    const reviewerName = card.querySelector('.reviewer-name')?.textContent?.trim() || getUiText('previewTitleDefault');
    openReviewMediaPreview(items, Math.min(startIndex, items.length - 1), `${reviewerName} - কাজের মিডিয়া`, trigger, { restoreFocusOnClose: false });
  }

  function openReviewCardAvatarPreview(trigger) {
    const image = trigger.querySelector('.review-avatar');
    const fallbackSrc = image instanceof HTMLImageElement ? (image.currentSrc || image.src || '') : '';
    const src = String(trigger.dataset.reviewAvatarSrc || fallbackSrc).trim();
    if (!src) return;

    const title = String(trigger.dataset.reviewAvatarTitle || getUiText('profilePreviewTitle')).trim();
    openReviewMediaPreview([{ type: 'image', src, title }], 0, title, trigger, { restoreFocusOnClose: false });
  }

  function initReviewCardInteractions() {
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;

    grid.addEventListener('click', async event => {
      const avatarTrigger = event.target.closest('.review-avatar-trigger');
      if (avatarTrigger && grid.contains(avatarTrigger)) {
        openReviewCardAvatarPreview(avatarTrigger);
        return;
      }

      const mediaTrigger = event.target.closest('.review-media-item[data-review-media-type]');
      if (!mediaTrigger || !grid.contains(mediaTrigger)) return;
      await openReviewCardMediaGallery(mediaTrigger);
    });
  }

  function formatReviewMediaMetaLabel(mediaFiles) {
    if (!mediaFiles.length) return getUiText('confirmMediaNone');

    const mediaNames = mediaFiles.slice(0, 2).map(file => file.name).join(', ');
    const extraText = mediaFiles.length > 2
      ? formatText(getUiText('mediaExtraCountTemplate'), { count: mediaFiles.length - 2 })
      : '';

    if (!mediaNames) {
      return formatText(getUiText('mediaCountOnlyTemplate'), { count: mediaFiles.length });
    }

    return formatText(getUiText('mediaCountWithNamesTemplate'), {
      count: mediaFiles.length,
      names: mediaNames,
      extra: extraText
    });
  }

  function getReviewsPerPage() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 3;
  }

  function buildPageTokens(totalPages, currentPage) {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }

    const tokens = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) tokens.push('ellipsis');
    for (let page = start; page <= end; page += 1) {
      tokens.push(page);
    }
    if (end < totalPages - 1) tokens.push('ellipsis');
    tokens.push(totalPages);
    return tokens;
  }

  function updateReviewsSummary(cards) {
    const avgEl = document.getElementById('reviewsAverage');
    const countEl = document.getElementById('reviewsCount');
    const starsFillEl = document.getElementById('reviewsStarsFill');
    const ratings = cards
      .map(card => Number(card.dataset.reviewScore || '0'))
      .filter(score => Number.isFinite(score) && score > 0);

    if (!ratings.length) {
      if (avgEl) avgEl.textContent = '0.0';
      if (countEl) countEl.textContent = '0';
      if (starsFillEl) starsFillEl.style.width = '0%';
      document.querySelectorAll('.reviews-breakdown-row[data-stars]').forEach(row => {
        row.querySelector('.reviews-breakdown-fill')?.style.setProperty('width', '0%');
        const countTextEl = row.querySelector('.reviews-breakdown-count');
        if (countTextEl) countTextEl.textContent = '0';
      });
      return;
    }

    const total = ratings.length;
    const roundedAverage = ratings.reduce((sum, score) => sum + score, 0) / total;

    if (avgEl) avgEl.textContent = roundedAverage.toFixed(1);
    if (countEl) countEl.textContent = String(total);
    if (starsFillEl) starsFillEl.style.width = `${Math.max(0, Math.min(100, (roundedAverage / 5) * 100))}%`;

    document.querySelectorAll('.reviews-breakdown-row[data-stars]').forEach(row => {
      const stars = Number(row.dataset.stars || '0');
      const count = ratings.filter(score => score === stars).length;
      const width = total ? `${(count / total) * 100}%` : '0%';
      row.querySelector('.reviews-breakdown-fill')?.style.setProperty('width', width);
      const countTextEl = row.querySelector('.reviews-breakdown-count');
      if (countTextEl) countTextEl.textContent = String(count);
    });
  }

  function updateReviewsDisplayMeta(total, from, to) {
    const metaEl = document.getElementById('reviewsDisplayMeta');
    if (!metaEl) return;

    if (!total) {
      metaEl.textContent = getUiText('approvedEmptyMessage');
      return;
    }

    metaEl.textContent = formatText(
      getUiText('displayMetaTemplate'),
      { total, from, to }
    );
  }

  function renderReviewsPagination(totalPages) {
    const paginationEl = document.getElementById('reviewsPagination');
    if (!paginationEl) return;

    if (totalPages <= 1) {
      paginationEl.classList.add('is-hidden');
      paginationEl.innerHTML = '';
      return;
    }

    paginationEl.classList.remove('is-hidden');
    const tokens = buildPageTokens(totalPages, reviewState.page);

    paginationEl.innerHTML = `
      <button type="button" class="reviews-page-btn" data-action="prev" ${reviewState.page <= 1 ? 'disabled' : ''}>‹</button>
      ${tokens.map(token => {
        if (token === 'ellipsis') return '<span class="reviews-page-ellipsis">…</span>';
        return `<button type="button" class="reviews-page-btn ${token === reviewState.page ? 'active' : ''}" data-page="${token}">${token}</button>`;
      }).join('')}
      <button type="button" class="reviews-page-btn" data-action="next" ${reviewState.page >= totalPages ? 'disabled' : ''}>›</button>
    `;
  }

  function renderReviewsPage() {
    const total = reviewState.cards.length;
    reviewState.perPage = getReviewsPerPage();

    const totalPages = Math.max(1, Math.ceil(total / reviewState.perPage));
    reviewState.page = Math.max(1, Math.min(reviewState.page, totalPages));

    const start = (reviewState.page - 1) * reviewState.perPage;
    const end = start + reviewState.perPage;

    reviewState.cards.forEach((card, idx) => {
      card.hidden = idx < start || idx >= end;
    });

    updateReviewsSummary(reviewState.cards);
    updateReviewsDisplayMeta(total, total ? start + 1 : 0, total ? Math.min(end, total) : 0);
    renderReviewsPagination(totalPages);
    observeRevealElements(document.getElementById('reviewsGrid'));
  }

  function syncReviewMediaInputFromState() {
    const mediaInput = document.getElementById('reviewUserMedia');
    if (!mediaInput || typeof DataTransfer === 'undefined') return;

    const dt = new DataTransfer();
    reviewUploadFormState.mediaFiles.forEach(file => dt.items.add(file));
    mediaInput.files = dt.files;
  }

  function openReviewMediaPreview(items, startIndex = 0, title = getUiText('previewTitleDefault'), triggerEl = null, options = {}) {
    const overlay = document.getElementById('reviewMediaPreviewOverlay');
    const previewItems = items.filter(item => item?.src);
    if (!overlay || !previewItems.length) return;

    reviewPreviewState.items = previewItems;
    reviewPreviewState.index = Math.max(0, Math.min(startIndex, reviewPreviewState.items.length - 1));
    reviewPreviewState.title = title;
    reviewPreviewState.trigger = triggerEl instanceof HTMLElement ? triggerEl : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    reviewPreviewState.viewport = captureViewportPosition();
    reviewPreviewState.restoreFocusOnClose = options.restoreFocusOnClose !== false;

    renderReviewMediaPreview();
    openOverlayDialog(overlay);
    syncBodyScrollLockState();
    focusWithoutScroll(document.getElementById('reviewPreviewClose'));
    scheduleViewportRestore(reviewPreviewState.viewport);
  }

  function closeReviewMediaPreview() {
    const overlay = document.getElementById('reviewMediaPreviewOverlay');
    if (!overlay) return;

    const viewportState = reviewPreviewState.viewport || captureViewportPosition();
    const triggerToRestore = reviewPreviewState.restoreFocusOnClose ? reviewPreviewState.trigger : null;

    closeOverlayDialog(overlay);
    syncBodyScrollLockState();
    restoreViewportPosition(viewportState);
    if (triggerToRestore instanceof HTMLElement && triggerToRestore.isConnected) {
      restoreFocus(triggerToRestore);
    }
    scheduleViewportRestore(viewportState);
    reviewPreviewState.items = [];
    reviewPreviewState.index = 0;
    reviewPreviewState.title = getUiText('previewTitleDefault');
    reviewPreviewState.trigger = null;
    reviewPreviewState.viewport = null;
    reviewPreviewState.restoreFocusOnClose = true;
  }

  function renderReviewMediaPreview() {
    const wrap = document.getElementById('reviewPreviewMediaWrap');
    const titleEl = document.getElementById('reviewPreviewTitle');
    const counterEl = document.getElementById('reviewPreviewCounter');
    if (!wrap || !titleEl || !counterEl) return;

    const current = reviewPreviewState.items[reviewPreviewState.index];
    if (!current) {
      wrap.innerHTML = `<div class="review-preview-empty">${getUiText('previewEmptyMessage')}</div>`;
      titleEl.textContent = getUiText('previewTitleDefault');
      counterEl.textContent = getUiText('previewCounterEmpty');
      return;
    }

    titleEl.textContent = reviewPreviewState.title || getUiText('previewTitleDefault');
    counterEl.textContent = `${reviewPreviewState.index + 1} / ${reviewPreviewState.items.length}`;

    if (current.type === 'video') {
      wrap.innerHTML = `<video id="reviewPreviewVideo" src="${current.src}" controls playsinline preload="metadata"></video>`;
      return;
    }

    wrap.innerHTML = `<img src="${current.src}" alt="${escapeHTML(reviewPreviewState.title || getUiText('previewTitleDefault'))}">`;
  }

  function reviewPreviewNav(direction) {
    if (!reviewPreviewState.items.length) return;
    reviewPreviewState.index = (reviewPreviewState.index + direction + reviewPreviewState.items.length) % reviewPreviewState.items.length;
    renderReviewMediaPreview();
  }

  function updateReviewFileMeta() {
    const metaEl = document.getElementById('reviewSubmitFileMeta');
    const avatarPreviewEl = document.getElementById('reviewAvatarPreview');
    const mediaPreviewGridEl = document.getElementById('reviewMediaPreviewGrid');
    if (!metaEl || !avatarPreviewEl || !mediaPreviewGridEl) return;

    releaseUrls(reviewUploadPreviewState.objectUrls);

    const avatarFile = reviewUploadFormState.avatarFile;
    const mediaFiles = reviewUploadFormState.mediaFiles;

    if (avatarFile && getReviewFileKind(avatarFile) === 'image') {
      const avatarUrl = createPreviewUrl(avatarFile, reviewUploadPreviewState.objectUrls);
      avatarPreviewEl.innerHTML = `
        <div class="review-file-preview-content">
          <button type="button" class="review-upload-preview-trigger" data-preview-type="image" data-preview-src="${avatarUrl}" aria-label="${escapeAttr(getUiText('previewProfileExpandLabel'))}">
            <img src="${avatarUrl}" alt="${escapeAttr(avatarFile.name)}" loading="eager" decoding="async">
          </button>
          <div class="review-file-preview-note-row">
            <p class="review-file-preview-note">${escapeHTML(avatarFile.name)}</p>
            <button type="button" class="review-upload-file-remove" data-remove-avatar="1">${escapeHTML(getUiText('removeActionLabel'))}</button>
          </div>
        </div>
      `;
    } else if (avatarFile) {
      avatarPreviewEl.innerHTML = `<div class="review-file-preview-empty">${getUiText('avatarPreviewInvalid')}</div>`;
    } else {
      avatarPreviewEl.innerHTML = `<div class="review-file-preview-empty">${getUiText('avatarPreviewEmpty')}</div>`;
    }

    if (!mediaFiles.length) {
      mediaPreviewGridEl.innerHTML = `<div class="review-file-preview-empty">${getUiText('mediaPreviewEmpty')}</div>`;
    } else {
      mediaPreviewGridEl.innerHTML = mediaFiles.map((file, idx) => {
        const safeName = escapeHTML(file.name);
        const fileKind = getReviewFileKind(file);

        if (fileKind === 'image') {
          const src = createPreviewUrl(file, reviewUploadPreviewState.objectUrls);
          return `
            <article class="review-media-preview-card">
              <button type="button" class="review-media-preview-trigger" data-preview-type="image" data-preview-src="${src}" aria-label="${escapeAttr(getUiText('previewImageExpandLabel'))}">
                <img src="${src}" alt="${safeName}" loading="eager" decoding="async">
                <span class="review-media-preview-badge">${escapeHTML(getUiText('previewKindImage'))}</span>
                <span class="review-media-preview-name">${safeName}</span>
              </button>
              <button type="button" class="review-media-preview-remove" data-remove-media-index="${idx}" aria-label="${escapeAttr(getUiText('previewImageRemoveLabel'))}">✕</button>
            </article>
          `;
        }

        if (fileKind === 'video') {
          const src = createPreviewUrl(file, reviewUploadPreviewState.objectUrls);
          return `
            <article class="review-media-preview-card">
              <button type="button" class="review-media-preview-trigger" data-preview-type="video" data-preview-src="${src}" aria-label="${escapeAttr(getUiText('previewVideoExpandLabel'))}">
                <video src="${src}" controls muted playsinline preload="auto"></video>
                <span class="review-media-preview-badge">${escapeHTML(getUiText('previewKindVideo'))}</span>
                <span class="review-media-preview-name">${safeName}</span>
              </button>
              <button type="button" class="review-media-preview-remove" data-remove-media-index="${idx}" aria-label="${escapeAttr(getUiText('previewVideoRemoveLabel'))}">✕</button>
            </article>
          `;
        }

        return `
          <article class="review-media-preview-card">
            <button type="button" class="review-media-preview-remove" data-remove-media-index="${idx}" aria-label="${escapeAttr(getUiText('previewFileRemoveLabel'))}">✕</button>
            <div class="review-file-preview-empty">${escapeHTML(getUiText('previewUnavailable'))}</div>
            <p class="review-media-preview-name">${safeName}</p>
          </article>
        `;
      }).join('');
    }

    if (!avatarFile && !mediaFiles.length) {
      metaEl.textContent = getUiText('fileMetaEmpty');
      return;
    }

    const avatarLabel = avatarFile ? avatarFile.name : getUiText('confirmAvatarNone');
    const mediaLabel = formatReviewMediaMetaLabel(mediaFiles);

    metaEl.textContent = formatText(
      getUiText('fileMetaTemplate'),
      { avatar: avatarLabel, media: mediaLabel }
    );
  }

  function closeReviewSubmitConfirm() {
    const overlay = document.getElementById('reviewSubmitConfirmOverlay');
    if (!overlay) return;

    closeOverlayDialog(overlay);
    syncBodyScrollLockState();
    reviewSubmitConfirmState.pendingPayload = null;
    reviewSubmitConfirmState.submitting = false;
    releaseUrls(reviewSubmitConfirmState.previewUrls);
  }

  function openReviewSubmitConfirm(payload) {
    const overlay = document.getElementById('reviewSubmitConfirmOverlay');
    const summaryEl = document.getElementById('reviewSubmitConfirmSummary');
    if (!overlay || !summaryEl || !payload) return;

    releaseUrls(reviewSubmitConfirmState.previewUrls);

    const commentPreview = payload.comment.length > 210
      ? `${payload.comment.slice(0, 210)}...`
      : payload.comment;

    const avatarMarkup = payload.avatarFile && getReviewFileKind(payload.avatarFile) === 'image'
      ? (() => {
        const src = createPreviewUrl(payload.avatarFile, reviewSubmitConfirmState.previewUrls);
        return `<button type="button" class="review-confirm-media-thumb review-confirm-avatar-thumb" data-preview-type="image" data-preview-src="${src}" aria-label="${escapeAttr(getUiText('previewProfileExpandLabel'))}"><img src="${src}" alt="${escapeHTML(payload.avatarFile.name)}" loading="eager" decoding="async"></button><p class="review-confirm-file-name">${escapeHTML(payload.avatarFile.name)} • ${formatReviewFileSize(payload.avatarFile.size)}</p>`;
      })()
      : `<p class="review-confirm-file-name">${escapeHTML(getUiText('confirmAvatarNone'))}</p>`;

    const mediaMarkup = payload.mediaFiles.length
      ? `<div class="review-confirm-media-grid">${payload.mediaFiles.map(file => {
        const src = createPreviewUrl(file, reviewSubmitConfirmState.previewUrls);
        const kind = getReviewFileKind(file);
        if (kind === 'video') {
          return `<button type="button" class="review-confirm-media-thumb review-confirm-media-video" data-preview-type="video" data-preview-src="${src}" aria-label="${escapeAttr(getUiText('previewVideoExpandLabel'))}"><video src="${src}" muted playsinline preload="metadata"></video><span class="review-confirm-media-kind">${escapeHTML(getUiText('previewKindVideo'))}</span><span class="review-confirm-media-caption">${escapeHTML(file.name)} • ${formatReviewFileSize(file.size)}</span></button>`;
        }
        if (kind === 'image') {
          return `<button type="button" class="review-confirm-media-thumb review-confirm-media-image" data-preview-type="image" data-preview-src="${src}" aria-label="${escapeAttr(getUiText('previewImageExpandLabel'))}"><img src="${src}" alt="${escapeHTML(file.name)}" loading="eager" decoding="async"><span class="review-confirm-media-kind">${escapeHTML(getUiText('previewKindImage'))}</span><span class="review-confirm-media-caption">${escapeHTML(file.name)} • ${formatReviewFileSize(file.size)}</span></button>`;
        }
        return `<figure class="review-confirm-media-thumb review-confirm-media-unknown"><div class="review-confirm-media-unknown-body">${escapeHTML(getUiText('previewUnavailable'))}</div><figcaption>${escapeHTML(file.name)} • ${formatReviewFileSize(file.size)}</figcaption></figure>`;
      }).join('')}</div><p class="review-confirm-file-name">${escapeHTML(formatText(getUiText('confirmMediaTotalTemplate'), { count: payload.mediaFiles.length }))}</p>`
      : `<p class="review-confirm-file-name">${escapeHTML(getUiText('confirmMediaNone'))}</p>`;

    summaryEl.innerHTML = `
      <div class="review-confirm-item review-confirm-item-meta">
        <span class="review-confirm-item-label">${escapeHTML(getUiText('confirmSummaryNameLabel'))}</span>
        <div class="review-confirm-item-value">${escapeHTML(payload.name)}</div>
      </div>
      <div class="review-confirm-item review-confirm-item-meta">
        <span class="review-confirm-item-label">${escapeHTML(getUiText('confirmSummaryWorkLabel'))}</span>
        <div class="review-confirm-item-value">${escapeHTML(payload.workInfo)}</div>
      </div>
      <div class="review-confirm-item review-confirm-item-meta">
        <span class="review-confirm-item-label">${escapeHTML(getUiText('confirmSummaryRatingLabel'))}</span>
        <div class="review-confirm-item-value">${payload.rating}★</div>
      </div>
      <div class="review-confirm-item review-confirm-item-media">
        <span class="review-confirm-item-label">${escapeHTML(getUiText('confirmSummaryAvatarLabel'))}</span>
        <div class="review-confirm-item-value review-confirm-media-wrap">${avatarMarkup}</div>
      </div>
      <div class="review-confirm-item review-confirm-item-media">
        <span class="review-confirm-item-label">${escapeHTML(getUiText('confirmSummaryMediaLabel'))}</span>
        <div class="review-confirm-item-value review-confirm-media-wrap">${mediaMarkup}</div>
      </div>
      <div class="review-confirm-item review-confirm-comment">
        <span class="review-confirm-item-label">${escapeHTML(getUiText('confirmSummaryCommentLabel'))}</span>
        <div class="review-confirm-item-value">${escapeHTML(commentPreview)}</div>
      </div>
    `;

    reviewSubmitConfirmState.pendingPayload = payload;
    openOverlayDialog(overlay);
    syncBodyScrollLockState();
  }

  async function finalizeReviewSubmitFromConfirm() {
    const payload = reviewSubmitConfirmState.pendingPayload;
    const form = document.getElementById('reviewSubmitForm');
    const submitBtn = form?.querySelector('.review-submit-primary-btn');
    const confirmSubmitBtn = document.getElementById('reviewSubmitConfirmSubmitBtn');

    if (!payload || reviewSubmitConfirmState.submitting) return;

    reviewSubmitConfirmState.submitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = getUiText('submitLoadingLabel');
    }
    if (confirmSubmitBtn) {
      confirmSubmitBtn.disabled = true;
      confirmSubmitBtn.textContent = getUiText('confirmSubmitLoadingLabel');
    }

    try {
      if (form) form.reset();
      reviewUploadFormState.avatarFile = null;
      reviewUploadFormState.mediaFiles = [];
      syncReviewMediaInputFromState();
      updateReviewFileMeta();

      closeReviewSubmitConfirm();
      closeReviewModal();

      showToast(
        getUiText('successTitle'),
        getUiText('successMessage'),
        6000
      );
    } catch (error) {
      const message = error?.message || getUiText('submitErrorMessage');
      showToast(getUiText('errorTitle'), message, 6500);
    } finally {
      reviewSubmitConfirmState.submitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = getUiText('submitDefaultLabel');
      }
      if (confirmSubmitBtn) {
        confirmSubmitBtn.disabled = false;
        confirmSubmitBtn.textContent = getUiText('confirmSubmitDefaultLabel');
      }
    }
  }

  function openReviewModal() {
    const modal = document.getElementById('reviewSubmitModal');
    if (!modal) return;
    modalState.reviewSubmitTrigger = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    modalState.reviewSubmitViewport = captureViewportPosition();
    openOverlayDialog(modal);
    syncBodyScrollLockState();
    updateReviewFileMeta();
    focusFirstIn(modal);
    scheduleViewportRestore(modalState.reviewSubmitViewport);
  }

  function closeReviewModal() {
    const modal = document.getElementById('reviewSubmitModal');
    if (!modal) return;
    const viewportState = modalState.reviewSubmitViewport || captureViewportPosition();
    closeOverlayDialog(modal);
    closeReviewSubmitConfirm();
    closeReviewMediaPreview();
    releaseUrls(reviewUploadPreviewState.objectUrls);
    syncBodyScrollLockState();
    restoreFocus(modalState.reviewSubmitTrigger);
    scheduleViewportRestore(viewportState);
    modalState.reviewSubmitViewport = null;
  }

  function clearReviewAvatarSelection() {
    reviewUploadFormState.avatarFile = null;
    const avatarInput = document.getElementById('reviewUserAvatar');
    if (avatarInput) avatarInput.value = '';
    updateReviewFileMeta();
  }

  function removeReviewMediaSelection(index) {
    if (!Number.isInteger(index) || index < 0 || index >= reviewUploadFormState.mediaFiles.length) return;
    reviewUploadFormState.mediaFiles = reviewUploadFormState.mediaFiles.filter((_, idx) => idx !== index);
    syncReviewMediaInputFromState();
    updateReviewFileMeta();
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('reviewUserName')?.value.trim() || '';
    const workInfo = document.getElementById('reviewWorkInfo')?.value.trim() || '';
    const comment = document.getElementById('reviewUserComment')?.value.trim() || '';
    const rating = Number(document.getElementById('reviewUserRating')?.value || '0');
    const avatarFile = reviewUploadFormState.avatarFile;
    const mediaFiles = reviewUploadFormState.mediaFiles;

    if (!name || !workInfo || !comment) {
      showToast(
        getUiText('incompleteTitle'),
        getUiText('incompleteMessage')
      );
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      showToast(
        getUiText('invalidRatingTitle'),
        getUiText('invalidRatingMessage')
      );
      return;
    }

    if (avatarFile && getReviewFileKind(avatarFile) !== 'image') {
      showToast(
        getUiText('invalidAvatarTitle'),
        getUiText('invalidAvatarMessage')
      );
      return;
    }

    if (avatarFile && avatarFile.size > 2 * 1024 * 1024) {
      showToast(
        getUiText('avatarSizeTitle'),
        getUiText('avatarSizeMessage')
      );
      return;
    }

    if (mediaFiles.length > 6) {
      showToast(
        getUiText('mediaLimitTitle'),
        getUiText('mediaLimitMessage')
      );
      return;
    }

    openReviewSubmitConfirm({
      name,
      workInfo,
      comment,
      rating,
      avatarFile,
      mediaFiles: [...mediaFiles]
    });
  }

  function initReviewUploadPreviewInteractions() {
    const avatarPreviewEl = document.getElementById('reviewAvatarPreview');
    const mediaPreviewGridEl = document.getElementById('reviewMediaPreviewGrid');

    avatarPreviewEl?.addEventListener('click', event => {
      const removeBtn = event.target.closest('.review-upload-file-remove[data-remove-avatar]');
      if (removeBtn) {
        clearReviewAvatarSelection();
        return;
      }

      const trigger = event.target.closest('.review-upload-preview-trigger[data-preview-src]');
      if (!trigger) return;
      openReviewMediaPreview([{ type: 'image', src: String(trigger.dataset.previewSrc || '') }], 0, getUiText('profilePreviewTitle'), trigger);
    });

    mediaPreviewGridEl?.addEventListener('click', event => {
      const removeBtn = event.target.closest('.review-media-preview-remove[data-remove-media-index]');
      if (removeBtn) {
        removeReviewMediaSelection(Number(removeBtn.dataset.removeMediaIndex || '-1'));
        return;
      }

      const trigger = event.target.closest('.review-media-preview-trigger[data-preview-src]');
      if (!trigger || !mediaPreviewGridEl.contains(trigger)) return;

      const triggers = Array.from(mediaPreviewGridEl.querySelectorAll('.review-media-preview-trigger[data-preview-src]'));
      const items = triggers.map(item => ({
        type: item.dataset.previewType === 'video' ? 'video' : 'image',
        src: String(item.dataset.previewSrc || '').trim()
      })).filter(item => item.src);
      const startIndex = Math.max(0, triggers.indexOf(trigger));
      openReviewMediaPreview(items, startIndex, getUiText('uploadMediaPreviewTitle'), trigger);
    });
  }

  function initReviewConfirmPreviewInteractions() {
    const summaryEl = document.getElementById('reviewSubmitConfirmSummary');
    if (!summaryEl) return;

    summaryEl.addEventListener('click', event => {
      const thumb = event.target.closest('.review-confirm-media-thumb[data-preview-src]');
      if (!thumb || !summaryEl.contains(thumb)) return;

      const src = String(thumb.dataset.previewSrc || '').trim();
      if (!src) return;

      const type = thumb.dataset.previewType === 'video' ? 'video' : 'image';
      const mediaGrid = thumb.closest('.review-confirm-media-grid');

      if (!mediaGrid) {
        openReviewMediaPreview([{ type, src }], 0, getUiText('profilePreviewTitle'), thumb);
        return;
      }

      const triggers = Array.from(mediaGrid.querySelectorAll('.review-confirm-media-thumb[data-preview-src]'));
      const items = triggers.map(item => ({
        type: item.dataset.previewType === 'video' ? 'video' : 'image',
        src: String(item.dataset.previewSrc || '').trim()
      })).filter(item => item.src);
      const startIndex = Math.max(0, triggers.indexOf(thumb));
      openReviewMediaPreview(items, startIndex, getUiText('workMediaPreviewTitle'), thumb);
    });
  }

  function initReviewSubmissionModal() {
    const openBtns = [
      document.getElementById('openReviewModalBtn'),
      document.getElementById('openReviewModalBtnTop')
    ].filter(Boolean);

    const overlay = document.getElementById('reviewSubmitModal');
    const confirmOverlay = document.getElementById('reviewSubmitConfirmOverlay');
    const avatarInput = document.getElementById('reviewUserAvatar');
    const mediaInput = document.getElementById('reviewUserMedia');
    const form = document.getElementById('reviewSubmitForm');

    openBtns.forEach(btn => btn.addEventListener('click', openReviewModal));
    document.getElementById('closeReviewModalBtn')?.addEventListener('click', closeReviewModal);
    document.getElementById('reviewCancelBtn')?.addEventListener('click', closeReviewModal);
    document.getElementById('reviewSubmitConfirmClose')?.addEventListener('click', closeReviewSubmitConfirm);
    document.getElementById('reviewSubmitConfirmEditBtn')?.addEventListener('click', closeReviewSubmitConfirm);
    document.getElementById('reviewSubmitConfirmSubmitBtn')?.addEventListener('click', () => {
      finalizeReviewSubmitFromConfirm();
    });

    overlay?.addEventListener('click', event => {
      if (event.target === overlay) closeReviewModal();
    });
    overlay?.addEventListener('cancel', event => {
      event.preventDefault();
      closeReviewModal();
    });

    confirmOverlay?.addEventListener('click', event => {
      if (event.target === confirmOverlay) closeReviewSubmitConfirm();
    });
    confirmOverlay?.addEventListener('cancel', event => {
      event.preventDefault();
      closeReviewSubmitConfirm();
    });

    avatarInput?.addEventListener('change', () => {
      reviewUploadFormState.avatarFile = avatarInput.files?.[0] || null;
      closeReviewSubmitConfirm();
      updateReviewFileMeta();
    });

    mediaInput?.addEventListener('change', () => {
      reviewUploadFormState.mediaFiles = Array.from(mediaInput.files || []);
      closeReviewSubmitConfirm();
      updateReviewFileMeta();
    });

    form?.addEventListener('submit', handleReviewSubmit);
    initReviewUploadPreviewInteractions();
    initReviewConfirmPreviewInteractions();
    updateReviewFileMeta();
  }

  function initReviewMediaPreviewEvents() {
    const overlay = document.getElementById('reviewMediaPreviewOverlay');
    overlay?.addEventListener('click', event => {
      if (event.target === overlay) closeReviewMediaPreview();
    });
    overlay?.addEventListener('cancel', event => {
      event.preventDefault();
      closeReviewMediaPreview();
    });

    document.getElementById('reviewPreviewPrev')?.addEventListener('click', () => reviewPreviewNav(-1));
    document.getElementById('reviewPreviewNext')?.addEventListener('click', () => reviewPreviewNav(1));
    document.getElementById('reviewPreviewClose')?.addEventListener('click', closeReviewMediaPreview);
    document.getElementById('reviewPreviewFullscreenBtn')?.addEventListener('click', async () => {
      const media = document.querySelector('#reviewPreviewMediaWrap img, #reviewPreviewMediaWrap video');
      if (!(media instanceof HTMLElement)) return;

      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else if (typeof media.requestFullscreen === 'function') {
          await media.requestFullscreen();
        }
      } catch {
        // Ignore fullscreen failures.
      }
    });

    document.addEventListener('keydown', event => {
      if (!overlay?.classList.contains('open')) return;
      if (event.key === 'ArrowRight') reviewPreviewNav(1);
      if (event.key === 'ArrowLeft') reviewPreviewNav(-1);
      if (event.key === 'Escape') closeReviewMediaPreview();
    });
  }

  function initReviewsPaginationEvents() {
    const paginationEl = document.getElementById('reviewsPagination');
    if (!paginationEl) return;

    paginationEl.addEventListener('click', event => {
      const btn = event.target.closest('button[data-page], button[data-action]');
      if (!btn) return;

      const totalPages = Math.max(1, Math.ceil(reviewState.cards.length / reviewState.perPage));

      if (btn.dataset.action === 'prev') {
        reviewState.page = Math.max(1, reviewState.page - 1);
        renderReviewsPage();
        return;
      }

      if (btn.dataset.action === 'next') {
        reviewState.page = Math.min(totalPages, reviewState.page + 1);
        renderReviewsPage();
        return;
      }

      const page = Number(btn.dataset.page || '1');
      if (!Number.isFinite(page)) return;
      reviewState.page = Math.max(1, Math.min(totalPages, page));
      renderReviewsPage();
    });
  }

  function initReviewsModule() {
    reviewState.cards = Array.from(document.querySelectorAll('#reviewsGrid .review-card[data-review-score]'));
    reviewState.perPage = getReviewsPerPage();

    initReviewsPaginationEvents();
    initReviewCardInteractions();
    initReviewSubmissionModal();
    initReviewMediaPreviewEvents();
    renderReviewsPage();

    window.addEventListener('resize', () => {
      window.clearTimeout(reviewState.resizeTick);
      reviewState.resizeTick = window.setTimeout(() => {
        const nextPerPage = getReviewsPerPage();
        if (nextPerPage === reviewState.perPage) return;
        reviewState.perPage = nextPerPage;
        renderReviewsPage();
      }, 140);
    });
  }

  window.addEventListener('pageshow', syncBodyScrollLockState);
  window.addEventListener('resize', syncBodyScrollLockState);
  window.addEventListener('orientationchange', syncBodyScrollLockState);
  window.addEventListener('beforeunload', () => {
    releaseUrls(reviewMediaVideoState.objectUrls);
  });
  syncBodyScrollLockState();
  initReviewsModule();
}
