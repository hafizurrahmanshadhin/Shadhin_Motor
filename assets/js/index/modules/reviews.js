import {
  formatTextTemplate,
  getTextToken,
  hasServerFormAction,
  submitFormNative
} from '../../shared/page-helpers.js';
import {
  captureViewportPosition,
  closeDialog as closeOverlayDialog,
  focusFirstIn,
  focusWithoutScroll,
  initDialogGlobals,
  isFocusVisible,
  openDialog as openOverlayDialog,
  restoreFocus,
  restoreViewportPosition,
  syncBodyScrollLockState
} from '../../shared/dialog.js';

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
  initDialogGlobals();

  const reviewsSection = document.getElementById('reviews');
  const uiTextRoot = document.getElementById('homeReviewsUiText');
  const reviewSubmitForm = document.getElementById('reviewSubmitForm');

  if (!reviewsSection) return;

  function getUiText(key) {
    return getTextToken(uiTextRoot, key, '');
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
    restoreFocusOnClose: true,
    keepFocusOnClose: false
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
    reviewSubmitViewport: null,
    reviewSubmitKeepFocus: false
  };

  const REVIEW_IMAGE_EXT_RE = /\.(apng|avif|bmp|dib|gif|heic|heics|heif|heifs|ico|jfif|jif|jpe?g|jxl|png|svgz?|tiff?|webp|raw|arw|cr2|cr3|dng|nef|nrw|orf|pef|raf|rw2|srw|x3f|ppm|pgm|pbm|pnm|hdr|exr)$/i;
  const REVIEW_VIDEO_EXT_RE = /\.(3g2|3gp|asf|avi|divx|f4v|flv|m2ts|m2v|m4v|mkv|mov|mp4|mpe?g|mpg|mts|mxf|ogg|ogm|ogv|qt|rm|rmvb|ts|vob|webm|wmv)$/i;
  const REVIEW_IMAGE_MAX_BYTES = 100 * 1024 * 1024;
  const REVIEW_VIDEO_MAX_BYTES = 10 * 1024 * 1024 * 1024;

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
    if (size >= 1024 * 1024 * 1024) return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    if (size >= 1024) return `${Math.round(size / 1024)} KB`;
    return `${size} B`;
  }

  function hasExplicitFileMime(file) {
    return Boolean(String(file?.type || '').trim());
  }

  function createNode(tagName, { className = '', text = '', dataset = {}, attrs = {} } = {}) {
    const node = document.createElement(tagName);

    if (className) {
      node.className = className;
    }

    if (text) {
      node.textContent = text;
    }

    Object.entries(dataset).forEach(([key, value]) => {
      if (value == null) return;
      node.dataset[key] = String(value);
    });

    Object.entries(attrs).forEach(([key, value]) => {
      if (value == null || value === false) return;
      node.setAttribute(key, value === true ? '' : String(value));
    });

    return node;
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

  function getReviewMediaFrameSources(trigger) {
    return String(trigger.dataset.reviewVideoFrames || '')
      .split('|')
      .map(value => value.trim())
      .filter(Boolean);
  }

  function resolveReviewMediaItem(trigger) {
    const type = trigger.dataset.reviewMediaType === 'video' ? 'video' : 'image';
    const label = trigger.dataset.reviewMediaLabel || getUiText('previewTitleDefault');
    const explicitSource = String(trigger.dataset.reviewMediaSrc || '').trim();
    const posterSource = getReviewMediaPosterSource(trigger);
    const frameSources = getReviewMediaFrameSources(trigger);

    if (type === 'video') {
      if (explicitSource) {
        return {
          type: 'video',
          src: explicitSource,
          poster: posterSource,
          title: label
        };
      }

      return {
        type: 'image',
        src: posterSource || frameSources[0] || getReviewMediaThumbnailSource(trigger),
        title: label
      };
    }

    return {
      type: 'image',
      src: explicitSource || getReviewMediaThumbnailSource(trigger),
      title: label
    };
  }

  function openReviewCardMediaGallery(trigger) {
    const card = trigger.closest('.review-card');
    if (!card) return;

    const triggers = Array.from(card.querySelectorAll('.review-media-item[data-review-media-type]'));
    if (!triggers.length) return;

    const items = triggers
      .map(resolveReviewMediaItem)
      .filter(item => item.src);
    if (!items.length) {
      showToast(
        getUiText('missingMediaTitle'),
        getUiText('missingMediaMessage')
      );
      return;
    }

    const startIndex = Math.max(0, triggers.indexOf(trigger));
    const reviewerName = card.querySelector('.reviewer-name')?.textContent?.trim() || getUiText('previewTitleDefault');
    openReviewMediaPreview(
      items,
      Math.min(startIndex, items.length - 1),
      `${reviewerName} - ${getUiText('workMediaPreviewTitle')}`,
      trigger
    );
  }

  function openReviewCardAvatarPreview(trigger) {
    const image = trigger.querySelector('.review-avatar');
    const fallbackSrc = image instanceof HTMLImageElement ? (image.currentSrc || image.src || '') : '';
    const src = String(trigger.dataset.reviewAvatarSrc || fallbackSrc).trim();
    if (!src) return;

    const title = String(trigger.dataset.reviewAvatarTitle || getUiText('profilePreviewTitle')).trim();
    openReviewMediaPreview([{ type: 'image', src, title }], 0, title, trigger);
  }

  function initReviewCardInteractions() {
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;

    grid.addEventListener('click', event => {
      const avatarTrigger = event.target.closest('.review-avatar-trigger');
      if (avatarTrigger && grid.contains(avatarTrigger)) {
        openReviewCardAvatarPreview(avatarTrigger);
        return;
      }

      const mediaTrigger = event.target.closest('.review-media-item[data-review-media-type]');
      if (!mediaTrigger || !grid.contains(mediaTrigger)) return;
      openReviewCardMediaGallery(mediaTrigger);
    });
  }

  function formatReviewMediaMetaLabel(mediaFiles) {
    if (!mediaFiles.length) return getUiText('confirmMediaNone');

    const mediaNames = mediaFiles.slice(0, 2).map(file => file.name).join(', ');
    const extraText = mediaFiles.length > 2
      ? formatTextTemplate(getUiText('mediaExtraCountTemplate'), { count: mediaFiles.length - 2 })
      : '';

    if (!mediaNames) {
      return formatTextTemplate(getUiText('mediaCountOnlyTemplate'), { count: mediaFiles.length });
    }

    return formatTextTemplate(getUiText('mediaCountWithNamesTemplate'), {
      count: mediaFiles.length,
      names: mediaNames,
      extra: extraText
    });
  }

  function getReviewsPerPage() {
    const isCompactLaptopViewport = window.innerWidth <= 1366 && window.innerHeight <= 820;

    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 1100 || isCompactLaptopViewport) return 2;
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
      if (starsFillEl) starsFillEl.style.setProperty('--reviews-fill-width', '0%');
      reviewsSection.querySelectorAll('.reviews-breakdown-row[data-stars]').forEach(row => {
        row.querySelector('.reviews-breakdown-fill')?.style.setProperty('--reviews-fill-width', '0%');
        const countTextEl = row.querySelector('.reviews-breakdown-count');
        if (countTextEl) countTextEl.textContent = '0';
      });
      return;
    }

    const total = ratings.length;
    const roundedAverage = ratings.reduce((sum, score) => sum + score, 0) / total;

    if (avgEl) avgEl.textContent = roundedAverage.toFixed(1);
    if (countEl) countEl.textContent = String(total);
    if (starsFillEl) {
      starsFillEl.style.setProperty(
        '--reviews-fill-width',
        `${Math.max(0, Math.min(100, (roundedAverage / 5) * 100))}%`
      );
    }

    reviewsSection.querySelectorAll('.reviews-breakdown-row[data-stars]').forEach(row => {
      const stars = Number(row.dataset.stars || '0');
      const count = ratings.filter(score => score === stars).length;
      const width = total ? `${(count / total) * 100}%` : '0%';
      row.querySelector('.reviews-breakdown-fill')?.style.setProperty('--reviews-fill-width', width);
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

    metaEl.textContent = formatTextTemplate(
      getUiText('displayMetaTemplate'),
      { total, from, to }
    );
  }

  function renderReviewsPagination(totalPages) {
    const paginationEl = document.getElementById('reviewsPagination');
    if (!paginationEl) return;

    if (totalPages <= 1) {
      paginationEl.classList.add('is-hidden');
      paginationEl.replaceChildren();
      return;
    }

    paginationEl.classList.remove('is-hidden');
    const tokens = buildPageTokens(totalPages, reviewState.page);
    const controls = [];

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'reviews-page-btn';
    prevBtn.dataset.action = 'prev';
    prevBtn.textContent = '‹';
    prevBtn.disabled = reviewState.page <= 1;
    controls.push(prevBtn);

    tokens.forEach(token => {
      if (token === 'ellipsis') {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'reviews-page-ellipsis';
        ellipsis.textContent = '…';
        controls.push(ellipsis);
        return;
      }

      const pageBtn = document.createElement('button');
      pageBtn.type = 'button';
      pageBtn.className = 'reviews-page-btn';
      pageBtn.dataset.page = String(token);
      pageBtn.textContent = String(token);
      if (token === reviewState.page) {
        pageBtn.classList.add('active');
      }
      controls.push(pageBtn);
    });

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'reviews-page-btn';
    nextBtn.dataset.action = 'next';
    nextBtn.textContent = '›';
    nextBtn.disabled = reviewState.page >= totalPages;
    controls.push(nextBtn);

    paginationEl.replaceChildren(...controls);
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
    reviewPreviewState.keepFocusOnClose = options.keepFocusOnClose === true || isFocusVisible(reviewPreviewState.trigger);

    renderReviewMediaPreview();
    openOverlayDialog(overlay);
    syncBodyScrollLockState();
    focusWithoutScroll(document.getElementById('reviewPreviewClose'));
  }

  function closeReviewMediaPreview() {
    const overlay = document.getElementById('reviewMediaPreviewOverlay');
    if (!overlay) return;

    const viewportState = reviewPreviewState.viewport || captureViewportPosition();
    const triggerToRestore = reviewPreviewState.restoreFocusOnClose ? reviewPreviewState.trigger : null;
    const keepFocus = reviewPreviewState.keepFocusOnClose;

    closeOverlayDialog(overlay);
    syncBodyScrollLockState();
    restoreViewportPosition(viewportState);
    if (triggerToRestore instanceof HTMLElement && triggerToRestore.isConnected) {
      restoreFocus(triggerToRestore);
      if (!keepFocus) {
        requestAnimationFrame(() => {
          triggerToRestore.blur();
        });
      }
    }
    reviewPreviewState.items = [];
    reviewPreviewState.index = 0;
    reviewPreviewState.title = getUiText('previewTitleDefault');
    reviewPreviewState.trigger = null;
    reviewPreviewState.viewport = null;
    reviewPreviewState.restoreFocusOnClose = true;
    reviewPreviewState.keepFocusOnClose = false;
  }

  function renderReviewMediaPreview() {
    const wrap = document.getElementById('reviewPreviewMediaWrap');
    const titleEl = document.getElementById('reviewPreviewTitle');
    const counterEl = document.getElementById('reviewPreviewCounter');
    if (!wrap || !titleEl || !counterEl) return;

    const current = reviewPreviewState.items[reviewPreviewState.index];
    if (!current) {
      const emptyState = document.createElement('div');
      emptyState.className = 'review-preview-empty';
      emptyState.textContent = getUiText('previewEmptyMessage');
      wrap.replaceChildren(emptyState);
      titleEl.textContent = getUiText('previewTitleDefault');
      counterEl.textContent = getUiText('previewCounterEmpty');
      return;
    }

    titleEl.textContent = reviewPreviewState.title || getUiText('previewTitleDefault');
    counterEl.textContent = `${reviewPreviewState.index + 1} / ${reviewPreviewState.items.length}`;

    if (current.type === 'video') {
      const video = document.createElement('video');
      video.id = 'reviewPreviewVideo';
      video.src = current.src;
      if (current.poster) {
        video.poster = current.poster;
      }
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      wrap.replaceChildren(video);
      return;
    }

    const image = document.createElement('img');
    image.src = current.src;
    image.alt = reviewPreviewState.title || getUiText('previewTitleDefault');
    wrap.replaceChildren(image);
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

    const createEmptyState = message => {
      return createNode('div', {
        className: 'review-file-preview-empty',
        text: message
      });
    };

    const createRemoveButton = ({ className, text = '✕', ariaLabel = '', dataset = {} }) => {
      return createNode('button', {
        className,
        text,
        dataset,
        attrs: {
          type: 'button',
          'aria-label': ariaLabel || null
        }
      });
    };

    if (avatarFile && getReviewFileKind(avatarFile) !== 'video') {
      const avatarUrl = createPreviewUrl(avatarFile, reviewUploadPreviewState.objectUrls);
      const content = createNode('div', { className: 'review-file-preview-content' });
      const previewTrigger = createNode('button', {
        className: 'review-upload-preview-trigger',
        dataset: {
          previewType: 'image',
          previewSrc: avatarUrl
        },
        attrs: {
          type: 'button',
          'aria-label': getUiText('previewProfileExpandLabel')
        }
      });
      const previewImage = document.createElement('img');
      previewImage.src = avatarUrl;
      previewImage.alt = avatarFile.name;
      previewImage.loading = 'eager';
      previewImage.decoding = 'async';
      previewImage.addEventListener('error', () => {
        avatarPreviewEl.replaceChildren(createEmptyState(getUiText('avatarPreviewInvalid')));
      }, { once: true });
      previewTrigger.append(previewImage);

      const noteRow = createNode('div', { className: 'review-file-preview-note-row' });
      noteRow.append(
        createNode('p', {
          className: 'review-file-preview-note',
          text: avatarFile.name
        }),
        createRemoveButton({
          className: 'review-upload-file-remove',
          text: getUiText('removeActionLabel'),
          dataset: { removeAvatar: '1' }
        })
      );

      content.append(previewTrigger, noteRow);
      avatarPreviewEl.replaceChildren(content);
    } else if (avatarFile) {
      avatarPreviewEl.replaceChildren(createEmptyState(getUiText('avatarPreviewInvalid')));
    } else {
      avatarPreviewEl.replaceChildren(createEmptyState(getUiText('avatarPreviewEmpty')));
    }

    if (!mediaFiles.length) {
      mediaPreviewGridEl.replaceChildren(createEmptyState(getUiText('mediaPreviewEmpty')));
    } else {
      const previewCards = mediaFiles.map((file, idx) => {
        const fileKind = getReviewFileKind(file);
        const previewCard = createNode('article', { className: 'review-media-preview-card' });

        if (fileKind === 'image' || fileKind === 'video') {
          const src = createPreviewUrl(file, reviewUploadPreviewState.objectUrls);
          const trigger = createNode('button', {
            className: 'review-media-preview-trigger',
            dataset: {
              previewType: fileKind,
              previewSrc: src
            },
            attrs: {
              type: 'button',
              'aria-label': fileKind === 'image'
                ? getUiText('previewImageExpandLabel')
                : getUiText('previewVideoExpandLabel')
            }
          });

          if (fileKind === 'image') {
            const image = document.createElement('img');
            image.src = src;
            image.alt = file.name;
            image.loading = 'eager';
            image.decoding = 'async';
            trigger.append(image);
          } else {
            const video = document.createElement('video');
            video.src = src;
            video.muted = true;
            video.playsInline = true;
            video.preload = 'metadata';
            video.tabIndex = -1;
            video.setAttribute('aria-hidden', 'true');
            trigger.append(video);
          }

          trigger.append(
            createNode('span', {
              className: 'review-media-preview-badge',
              text: fileKind === 'image'
                ? getUiText('previewKindImage')
                : getUiText('previewKindVideo')
            }),
            createNode('span', {
              className: 'review-media-preview-name',
              text: file.name
            })
          );

          previewCard.append(
            trigger,
            createRemoveButton({
              className: 'review-media-preview-remove',
              ariaLabel: fileKind === 'image'
                ? getUiText('previewImageRemoveLabel')
                : getUiText('previewVideoRemoveLabel'),
              dataset: { removeMediaIndex: idx }
            })
          );
          return previewCard;
        }

        previewCard.append(
          createRemoveButton({
            className: 'review-media-preview-remove',
            ariaLabel: getUiText('previewFileRemoveLabel'),
            dataset: { removeMediaIndex: idx }
          }),
          createEmptyState(getUiText('previewUnavailable')),
          createNode('p', {
            className: 'review-media-preview-name',
            text: file.name
          })
        );
        return previewCard;
      });

      mediaPreviewGridEl.replaceChildren(...previewCards);
    }

    if (!avatarFile && !mediaFiles.length) {
      metaEl.textContent = getUiText('fileMetaEmpty');
      return;
    }

    const avatarLabel = avatarFile ? avatarFile.name : getUiText('confirmAvatarNone');
    const mediaLabel = formatReviewMediaMetaLabel(mediaFiles);

    metaEl.textContent = formatTextTemplate(
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

  function validateReviewMediaFiles(mediaFiles) {
    for (const file of mediaFiles) {
      const kind = getReviewFileKind(file);
      const hasExplicitMime = hasExplicitFileMime(file);

      if (hasExplicitMime && kind !== 'image' && kind !== 'video') {
        return {
          titleKey: 'invalidMediaTypeTitle',
          messageKey: 'invalidMediaTypeMessage'
        };
      }

      if (kind === 'image' && file.size > REVIEW_IMAGE_MAX_BYTES) {
        return {
          titleKey: 'mediaImageSizeTitle',
          messageKey: 'mediaImageSizeMessage'
        };
      }

      if ((kind === 'video' || kind === 'unknown') && file.size > REVIEW_VIDEO_MAX_BYTES) {
        return {
          titleKey: 'mediaVideoSizeTitle',
          messageKey: 'mediaVideoSizeMessage'
        };
      }
    }

    return null;
  }

  function openReviewSubmitConfirm(payload) {
    const overlay = document.getElementById('reviewSubmitConfirmOverlay');
    const summaryEl = document.getElementById('reviewSubmitConfirmSummary');
    if (!overlay || !summaryEl || !payload) return;

    releaseUrls(reviewSubmitConfirmState.previewUrls);

    const commentPreview = payload.comment.length > 210
      ? `${payload.comment.slice(0, 210)}...`
      : payload.comment;

    const createSummaryItem = (label, valueNode, className) => {
      const item = createNode('div', { className });
      item.append(
        createNode('span', {
          className: 'review-confirm-item-label',
          text: label
        }),
        valueNode
      );
      return item;
    };

    const createValueNode = ({ text = '', className = 'review-confirm-item-value review-confirm-media-wrap' } = {}) => {
      return createNode('div', { className, text });
    };

    const createCaption = text => createNode('p', {
      className: 'review-confirm-file-name',
      text
    });

    const avatarValue = createValueNode();
    if (payload.avatarFile && getReviewFileKind(payload.avatarFile) !== 'video') {
      const src = createPreviewUrl(payload.avatarFile, reviewSubmitConfirmState.previewUrls);
      const thumb = createNode('button', {
        className: 'review-confirm-media-thumb review-confirm-avatar-thumb',
        dataset: {
          previewType: 'image',
          previewSrc: src
        },
        attrs: {
          type: 'button',
          'aria-label': getUiText('previewProfileExpandLabel')
        }
      });
      const thumbImage = document.createElement('img');
      thumbImage.src = src;
      thumbImage.alt = payload.avatarFile.name;
      thumbImage.loading = 'eager';
      thumbImage.decoding = 'async';
      thumbImage.addEventListener('error', () => {
        thumb.remove();
      }, { once: true });
      thumb.append(thumbImage);
      avatarValue.append(
        thumb,
        createCaption(`${payload.avatarFile.name} • ${formatReviewFileSize(payload.avatarFile.size)}`)
      );
    } else {
      avatarValue.append(createCaption(getUiText('confirmAvatarNone')));
    }

    const mediaValue = createValueNode();
    if (payload.mediaFiles.length) {
      const mediaGrid = createNode('div', { className: 'review-confirm-media-grid' });

      payload.mediaFiles.forEach(file => {
        const src = createPreviewUrl(file, reviewSubmitConfirmState.previewUrls);
        const kind = getReviewFileKind(file);

        if (kind === 'video' || kind === 'image') {
          const thumb = createNode('button', {
            className: `review-confirm-media-thumb ${kind === 'video' ? 'review-confirm-media-video' : 'review-confirm-media-image'}`,
            dataset: {
              previewType: kind,
              previewSrc: src
            },
            attrs: {
              type: 'button',
              'aria-label': kind === 'video'
                ? getUiText('previewVideoExpandLabel')
                : getUiText('previewImageExpandLabel')
            }
          });

          if (kind === 'video') {
            const video = document.createElement('video');
            video.src = src;
            video.muted = true;
            video.playsInline = true;
            video.preload = 'metadata';
            video.tabIndex = -1;
            video.setAttribute('aria-hidden', 'true');
            thumb.append(video);
          } else {
            const image = document.createElement('img');
            image.src = src;
            image.alt = file.name;
            image.loading = 'eager';
            image.decoding = 'async';
            thumb.append(image);
          }

          thumb.append(
            createNode('span', {
              className: 'review-confirm-media-kind',
              text: kind === 'video'
                ? getUiText('previewKindVideo')
                : getUiText('previewKindImage')
            }),
            createNode('span', {
              className: 'review-confirm-media-caption',
              text: `${file.name} • ${formatReviewFileSize(file.size)}`
            })
          );
          mediaGrid.append(thumb);
          return;
        }

        const unknownFigure = createNode('figure', {
          className: 'review-confirm-media-thumb review-confirm-media-unknown'
        });
        unknownFigure.append(
          createNode('div', {
            className: 'review-confirm-media-unknown-body',
            text: getUiText('previewUnavailable')
          }),
          createNode('figcaption', {
            text: `${file.name} • ${formatReviewFileSize(file.size)}`
          })
        );
        mediaGrid.append(unknownFigure);
      });

      mediaValue.append(
        mediaGrid,
        createCaption(formatTextTemplate(getUiText('confirmMediaTotalTemplate'), { count: payload.mediaFiles.length }))
      );
    } else {
      mediaValue.append(createCaption(getUiText('confirmMediaNone')));
    }

    summaryEl.replaceChildren(
      createSummaryItem(
        getUiText('confirmSummaryNameLabel'),
        createValueNode({
          className: 'review-confirm-item-value',
          text: payload.name
        }),
        'review-confirm-item review-confirm-item-meta'
      ),
      createSummaryItem(
        getUiText('confirmSummaryWorkLabel'),
        createValueNode({
          className: 'review-confirm-item-value',
          text: payload.workInfo
        }),
        'review-confirm-item review-confirm-item-meta'
      ),
      createSummaryItem(
        getUiText('confirmSummaryRatingLabel'),
        createValueNode({
          className: 'review-confirm-item-value',
          text: `${payload.rating}★`
        }),
        'review-confirm-item review-confirm-item-meta'
      ),
      createSummaryItem(
        getUiText('confirmSummaryAvatarLabel'),
        avatarValue,
        'review-confirm-item review-confirm-item-media'
      ),
      createSummaryItem(
        getUiText('confirmSummaryMediaLabel'),
        mediaValue,
        'review-confirm-item review-confirm-item-media'
      ),
      createSummaryItem(
        getUiText('confirmSummaryCommentLabel'),
        createValueNode({
          className: 'review-confirm-item-value',
          text: commentPreview
        }),
        'review-confirm-item review-confirm-comment'
      )
    );

    reviewSubmitConfirmState.pendingPayload = payload;
    openOverlayDialog(overlay);
    syncBodyScrollLockState();
    focusFirstIn(overlay);
  }

  async function finalizeReviewSubmitFromConfirm() {
    const payload = reviewSubmitConfirmState.pendingPayload;
    const form = reviewSubmitForm;
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
      if (hasServerFormAction(form)) {
        closeReviewSubmitConfirm();
        submitFormNative(form);
        return;
      }

      showToast(
        getUiText('integrationRequiredTitle'),
        getUiText('integrationRequiredMessage'),
        7000
      );

      closeReviewSubmitConfirm();
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
    modalState.reviewSubmitKeepFocus = isFocusVisible(modalState.reviewSubmitTrigger);
    modalState.reviewSubmitViewport = captureViewportPosition();
    openOverlayDialog(modal);
    syncBodyScrollLockState();
    updateReviewFileMeta();
    focusFirstIn(modal);
  }

  function closeReviewModal() {
    const modal = document.getElementById('reviewSubmitModal');
    if (!modal) return;
    const viewportState = modalState.reviewSubmitViewport || captureViewportPosition();
    const triggerToRestore = modalState.reviewSubmitTrigger;
    const keepFocus = modalState.reviewSubmitKeepFocus;
    closeOverlayDialog(modal);
    closeReviewSubmitConfirm();
    closeReviewMediaPreview();
    releaseUrls(reviewUploadPreviewState.objectUrls);
    syncBodyScrollLockState();
    restoreViewportPosition(viewportState);
    if (triggerToRestore instanceof HTMLElement && triggerToRestore.isConnected) {
      restoreFocus(triggerToRestore);
      if (!keepFocus) {
        requestAnimationFrame(() => {
          triggerToRestore.blur();
        });
      }
    }
    modalState.reviewSubmitTrigger = null;
    modalState.reviewSubmitViewport = null;
    modalState.reviewSubmitKeepFocus = false;
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

    if (avatarFile) {
      const avatarKind = getReviewFileKind(avatarFile);
      const avatarHasExplicitMime = hasExplicitFileMime(avatarFile);

      if (avatarKind === 'video' || (avatarHasExplicitMime && avatarKind !== 'image')) {
        showToast(
          getUiText('invalidAvatarTitle'),
          getUiText('invalidAvatarMessage')
        );
        return;
      }
    }

    if (avatarFile && avatarFile.size > REVIEW_IMAGE_MAX_BYTES) {
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

    const mediaValidationError = validateReviewMediaFiles(mediaFiles);
    if (mediaValidationError) {
      showToast(
        getUiText(mediaValidationError.titleKey),
        getUiText(mediaValidationError.messageKey)
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
    const form = reviewSubmitForm;

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
      const media = document.getElementById('reviewPreviewMediaWrap')?.querySelector('img, video');
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
    reviewState.cards = Array.from(reviewsSection.querySelectorAll('.review-card[data-review-score]'));
    reviewState.perPage = getReviewsPerPage();
    document.getElementById('reviewsGrid')?.classList.add('reviews-grid--enhanced');

    initReviewsPaginationEvents();
    initReviewCardInteractions();
    initReviewSubmissionModal();
    initReviewMediaPreviewEvents();
    renderReviewsPage();
    observeRevealElements(document.getElementById('reviewsGrid'));

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

  window.addEventListener('beforeunload', () => {
    releaseUrls(reviewUploadPreviewState.objectUrls);
  });
  syncBodyScrollLockState();
  initReviewsModule();
}
