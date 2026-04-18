import { FOCUSABLE_SELECTOR } from '../../shared/core/dom-helpers.js';

export function initHomeReviews({
  openOverlayDialog: openOverlayDialogFn,
  closeOverlayDialog: closeOverlayDialogFn,
  focusFirstIn: focusFirstInFn,
  restoreFocus: restoreFocusFn,
  captureViewportPosition: captureViewportPositionFn,
  scheduleViewportRestore: scheduleViewportRestoreFn,
  syncBodyScrollLockState: syncBodyScrollLockStateFn,
  observeRevealElements: observeRevealElementsFn,
  showToast: showToastFn
} = {}) {
  function focusWithoutScroll(target) {
    if (!(target instanceof HTMLElement)) return;
    if (typeof target.focus !== 'function') return;

    try {
      target.focus({ preventScroll: true });
    } catch {
      target.focus();
    }
  }

  const openOverlayDialog = typeof openOverlayDialogFn === 'function' ? openOverlayDialogFn : () => {};
  const closeOverlayDialog = typeof closeOverlayDialogFn === 'function' ? closeOverlayDialogFn : () => {};
  const focusFirstIn = typeof focusFirstInFn === 'function'
    ? focusFirstInFn
    : container => focusWithoutScroll(container?.querySelector(FOCUSABLE_SELECTOR) || null);
  const restoreFocus = typeof restoreFocusFn === 'function' ? restoreFocusFn : focusWithoutScroll;
  const captureViewportPosition = typeof captureViewportPositionFn === 'function'
    ? captureViewportPositionFn
    : () => ({ x: window.scrollX || 0, y: window.scrollY || 0 });
  const scheduleViewportRestore = typeof scheduleViewportRestoreFn === 'function'
    ? scheduleViewportRestoreFn
    : () => {};
  const syncBodyScrollLockState = typeof syncBodyScrollLockStateFn === 'function'
    ? syncBodyScrollLockStateFn
    : () => {};
  const observeRevealElements = typeof observeRevealElementsFn === 'function'
    ? observeRevealElementsFn
    : () => {};
  const showToast = typeof showToastFn === 'function' ? showToastFn : () => {};

  const reviewState = {
    cards: [],
    page: 1,
    perPage: 6,
    resizeTick: 0
  };

  const reviewPreviewState = {
    items: [],
    index: 0,
    title: getUiText('previewTitleDefault'),
    trigger: null,
    viewport: null
  };

  const reviewUploadFormState = {
    avatarFile: null,
    mediaFiles: []
  };

  const reviewUploadPreviewState = {
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
  const uiTextRoot = document.getElementById('homeReviewsUiText');

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

  function getUiText(key) {
    const value = uiTextRoot?.querySelector(`[data-key="${key}"]`)?.textContent?.trim();
    return value || '';
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
    if (window.innerWidth <= 640) return 2;
    if (window.innerWidth <= 1100) return 4;
    return 6;
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

  function openReviewMediaPreview(items, startIndex = 0, title = getUiText('previewTitleDefault'), triggerEl = null) {
    const overlay = document.getElementById('reviewMediaPreviewOverlay');
    if (!overlay || !items.length) return;

    reviewPreviewState.items = items.filter(item => item?.src);
    reviewPreviewState.index = Math.max(0, Math.min(startIndex, reviewPreviewState.items.length - 1));
    reviewPreviewState.title = title;
    reviewPreviewState.trigger = triggerEl instanceof HTMLElement ? triggerEl : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    reviewPreviewState.viewport = captureViewportPosition();

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

    closeOverlayDialog(overlay);
    syncBodyScrollLockState();
    restoreFocus(reviewPreviewState.trigger);
    scheduleViewportRestore(viewportState);
    reviewPreviewState.items = [];
    reviewPreviewState.index = 0;
    reviewPreviewState.viewport = null;
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

  initReviewsModule();
}
