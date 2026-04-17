/**
 * Homepage interaction controller.
 *
 * This file keeps all runtime UI flows for:
 * - navigation state
 * - review module (create + list + preview)
 * - gallery showcase + lightbox
 * - sample selection + order flow
 */
import { storageKeys as siteStorageKeys } from '../../site-config.js';
import { FOCUSABLE_SELECTOR } from '../core/dom-helpers.js';
import { initHomeAboutTeam } from '../home/about-team.js';
import { initHomeGallery } from '../home/gallery.js';
import { initHomeSamples } from '../home/samples.js';

export function initHomePage() {
    const ORDER_STORAGE_KEY = siteStorageKeys.orders || 'ac_orders';

    // ─── NAVBAR ─────────────────────────────────────────────────────────────────
    const navbar = document.getElementById('navbar');
    const navLinksContainer = document.getElementById('navLinks');
    const hamburgerBtn = document.getElementById('hamburger');
    const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const trackedSections = Array.from(document.querySelectorAll('section[id]'))
      .filter(section => navLinks.some(link => link.getAttribute('href') === `#${section.id}`));
    function updateNavToggleButtonState(isOpen) {
      if (!hamburgerBtn) return;
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
      hamburgerBtn.setAttribute('aria-label', isOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন');
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
      navbar.classList.toggle('scrolled', window.scrollY > 60);

      const scrollMark = window.scrollY + navbar.offsetHeight + 120;
      let activeId = '';

      trackedSections.forEach(section => {
        if (scrollMark >= section.offsetTop) activeId = `#${section.id}`;
      });

      setActiveNavLink(activeId);
    }

    window.addEventListener('scroll', updateActiveNavLink);
    window.addEventListener('load', updateActiveNavLink);
    window.addEventListener('hashchange', updateActiveNavLink);
    updateActiveNavLink();

    function toggleNav(forceOpen) {
      if (!navLinksContainer) return;

      const nextState = typeof forceOpen === 'boolean'
        ? forceOpen
        : !navLinksContainer.classList.contains('open');

      navLinksContainer.classList.toggle('open', nextState);
      updateNavToggleButtonState(nextState);
    }

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', () => toggleNav());
    }

    document.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', () => {
        toggleNav(false);
        const targetId = a.getAttribute('href');
        if (targetId && targetId.startsWith('#')) setActiveNavLink(targetId);
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

    document.querySelectorAll('.faq-item').forEach(item => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        document.querySelectorAll('.faq-item').forEach(other => {
          if (other !== item) other.open = false;
        });
      });
    });

    // ─── SCROLL REVEAL ──────────────────────────────────────────────────────────
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    function observeRevealElements(root = document) {
      root.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
    }
    observeRevealElements();

    // ─── REVIEWS MODULE ───────────────────────────────────────────────────────
    const REVIEW_STORAGE_KEY = siteStorageKeys.reviews || 'ac_reviews';
    const REVIEW_PENDING_STORAGE_KEY = siteStorageKeys.pendingReviews || 'ac_review_submissions';
    const REVIEW_SELECTED_IDS_KEY = siteStorageKeys.selectedReviewIds || 'ac_selected_review_ids';
    const REVIEW_AVATAR_FALLBACKS = [
      'assets/images/reviews/reviewer-rk.jpeg',
      'assets/images/reviews/reviewer-na.jpeg',
      'assets/images/reviews/reviewer-ma.jpeg',
      'assets/images/reviews/reviewer-sa.jpeg',
      'assets/images/reviews/reviewer-fa.jpeg',
      'assets/images/reviews/reviewer-ta.jpeg'
    ];

    const DEFAULT_REVIEW_MEDIA_IMAGES = [
      ...Array.from({ length: 17 }, (_, idx) =>
        `assets/media/reviews/images/review-work-${String(idx + 1).padStart(2, '0')}.jpeg`
      ),
      ...Array.from({ length: 8 }, (_, idx) =>
        `assets/media/reviews/images/review-free-${String(idx + 1).padStart(2, '0')}.jpeg`
      )
    ];

    const DEFAULT_REVIEW_MEDIA_VIDEOS = [
      'assets/media/reviews/videos/review-video-01.mp4',
      'assets/media/reviews/videos/review-video-02.mp4',
      'assets/media/reviews/videos/review-video-03.mp4',
      'assets/media/reviews/videos/review-video-04.mp4'
    ];

    const DEFAULT_REVIEW_SEED = [
      {
        name: 'রাশেদ করিম',
        work: 'Toyota Corolla Axio • মিরপুর, ঢাকা',
        rating: 5,
        comment: 'Factory-fit finishing, premium stitch line আর color match নিয়ে আমি পুরোপুরি সন্তুষ্ট।'
      },
      {
        name: 'নাফিসা আহমেদ',
        work: 'Toyota Premio • উত্তরা, ঢাকা',
        rating: 5,
        comment: 'Timeline maintain করে কাজ দিয়েছে, leather feel এবং cabin look দুটোই অসাধারণ হয়েছে।'
      },
      {
        name: 'মাসুদ হোসেন',
        work: 'Yamaha R15 • সাভার',
        rating: 4,
        comment: 'Daily ride comfort অনেক improve হয়েছে, grip and finish খুব clean ছিল।'
      },
      {
        name: 'সাইফ রহমান',
        work: 'Honda Vezel • গাজীপুর',
        rating: 5,
        comment: 'পুরো গাড়ির interior theme ধরে design করেছে, fitting একদম mismatch ছাড়া।'
      },
      {
        name: 'ফারজানা নূর',
        work: 'Toyota Noah • নারায়ণগঞ্জ',
        rating: 5,
        comment: 'Family use এর জন্য soft কিন্তু durable seat finish পেয়েছি, service খুব responsive।'
      },
      {
        name: 'তানভীর আলম',
        work: 'Bajaj Pulsar • ধানমন্ডি, ঢাকা',
        rating: 5,
        comment: 'Sample match করার পরে final কাজ দিয়েছে, output preview এর সাথে পুরো মিলেছে।'
      },
      {
        name: 'সাব্বির ইসলাম',
        work: 'Honda Civic • বসুন্ধরা, ঢাকা',
        rating: 4,
        comment: 'Design recommendation ভাল ছিল, cabin overall premium feel পেয়েছি।'
      },
      {
        name: 'মাহি চৌধুরী',
        work: 'Suzuki Swift • বাড্ডা, ঢাকা',
        rating: 5,
        comment: 'Color combo suggest করার পর final look গাড়ির সাথে খুব মানিয়েছে।'
      },
      {
        name: 'রুমান হক',
        work: 'Mitsubishi Pajero • তেজগাঁও, ঢাকা',
        rating: 5,
        comment: 'Large cabin গাড়িতেও detailing ঠিক রেখেছে, stitching খুব neat ছিল।'
      },
      {
        name: 'তাসনিম আরা',
        work: 'Nissan X-Trail • বনানী, ঢাকা',
        rating: 4,
        comment: 'Work quality ভালো, delivery day-তে communication clear ছিল।'
      },
      {
        name: 'ইফতেখার সজীব',
        work: 'Yamaha FZS • মোহাম্মদপুর, ঢাকা',
        rating: 5,
        comment: 'Bike seat contour অনুযায়ী custom cut দিয়েছে, ride fatigue noticeably কমেছে।'
      },
      {
        name: 'জুনাইদ হাসান',
        work: 'Toyota Allion • মগবাজার, ঢাকা',
        rating: 5,
        comment: 'আগের worn seat replace করে cabin fresh look এসেছে, materials quality solid।'
      },
      {
        name: 'মেহরিন সুলতানা',
        work: 'Honda Grace • টঙ্গী, গাজীপুর',
        rating: 4,
        comment: 'Finishing আর edge alignment সুন্দর হয়েছে, overall experience smooth।'
      },
      {
        name: 'আরিফুল কবির',
        work: 'Microbus Hiace • যাত্রাবাড়ী, ঢাকা',
        rating: 5,
        comment: 'Commercial use এর জন্য heavy-duty build চেয়েছিলাম, ঠিক সেটাই পেয়েছি।'
      },
      {
        name: 'শাওন মোল্লা',
        work: 'Suzuki Gixxer • কেরানীগঞ্জ, ঢাকা',
        rating: 5,
        comment: 'Seat padding balance ঠিক থাকায় long ride এও pressure কম লেগেছে।'
      },
      {
        name: 'রাইসা নাসরিন',
        work: 'Toyota Aqua • মিরপুর DOHS, ঢাকা',
        rating: 4,
        comment: 'Clean finishing, tidy stitch আর সময়মতো handover - সব মিলিয়ে good service।'
      },
      {
        name: 'নাবিল মাহমুদ',
        work: 'Honda CBR • শ্যামলী, ঢাকা',
        rating: 5,
        comment: 'Sport bike seat shape বজায় রেখেই comfort increase করেছে, কাজ দারুণ।'
      },
      {
        name: 'সামিয়া রহমান',
        work: 'Toyota Fielder • আজিমপুর, ঢাকা',
        rating: 5,
        comment: 'Family trip এর জন্য easy-clean material নিয়েছিলাম, decision টা খুব ভালো ছিল।'
      },
      {
        name: 'রাশিকুল ইমরান',
        work: 'Nissan Sunny • রামপুরা, ঢাকা',
        rating: 4,
        comment: 'Budget friendly package এর ভেতরেও good finish দিয়েছে, value for money।'
      },
      {
        name: 'তাহমিনা হক',
        work: 'Honda Fit • কল্যাণপুর, ঢাকা',
        rating: 5,
        comment: 'Pickup থেকে fitting সবকিছু coordinated ছিল, final look exactly আমার পছন্দমতো।'
      }
    ];

    const reviewState = {
      fallbackReviews: [],
      publishedReviews: [],
      page: 1,
      perPage: 6,
      resizeTick: 0
    };

    const reviewPreviewState = {
      items: [],
      index: 0,
      title: ''
    };

    const reviewUploadPreviewState = {
      objectUrls: []
    };

    const reviewUploadFormState = {
      avatarFile: null,
      mediaFiles: []
    };

    const reviewSubmitConfirmState = {
      pendingPayload: null,
      submitting: false,
      previewUrls: []
    };

    const REVIEW_IMAGE_EXT_RE = /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)$/i;
    const REVIEW_VIDEO_EXT_RE = /\.(3gp|avi|m4v|mkv|mov|mp4|ogg|ogv|webm)$/i;
    const modalFocusState = {
      reviewSubmitTrigger: null
    };
    const modalViewportState = {
      reviewSubmitModal: null,
      reviewMediaPreview: null
    };

    function focusWithoutScroll(target) {
      if (!(target instanceof HTMLElement)) return;
      if (typeof target.focus !== 'function') return;

      try {
        target.focus({ preventScroll: true });
      } catch (error) {
        target.focus();
      }
    }

    function getFirstFocusable(container) {
      return container?.querySelector(FOCUSABLE_SELECTOR) || null;
    }

    function focusFirstIn(container) {
      const firstFocusable = getFirstFocusable(container);
      focusWithoutScroll(firstFocusable);
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

      if (root) root.style.scrollBehavior = 'auto';
      if (scrollRoot instanceof HTMLElement) scrollRoot.style.scrollBehavior = 'auto';

      if (scrollRoot) {
        scrollRoot.scrollLeft = restoreX;
        scrollRoot.scrollTop = restoreY;
      }

      window.scrollTo({ left: restoreX, top: restoreY, behavior: 'auto' });

      requestAnimationFrame(() => {
        if (root) root.style.scrollBehavior = previousRootBehavior;
        if (scrollRoot instanceof HTMLElement) scrollRoot.style.scrollBehavior = previousScrollRootBehavior;
      });
    }

    function scheduleViewportRestore(viewport) {
      if (!viewport) return;

      requestAnimationFrame(() => {
        restoreViewportPosition(viewport);
        requestAnimationFrame(() => restoreViewportPosition(viewport));
      });
    }

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

      if (size >= 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      }
      if (size >= 1024) {
        return `${Math.round(size / 1024)} KB`;
      }
      return `${size} B`;
    }

    const BODY_SCROLL_LOCK_OVERLAYS = [
      'lightboxOverlay',
      'sampleModal',
      'sampleConfirmModal',
      'reviewSubmitModal',
      'reviewSubmitConfirmOverlay',
      'reviewMediaPreviewOverlay',
      'aboutTeamPreviewOverlay'
    ];
    const bodyScrollLockState = {
      locked: false,
      x: 0,
      y: 0,
      scrollbarGap: 0
    };

    function lockBodyScroll(root, body) {
      body.classList.add('body-scroll-locked');

      if (!bodyScrollLockState.locked) {
        const viewport = captureViewportPosition();
        bodyScrollLockState.locked = true;
        bodyScrollLockState.x = viewport.x;
        bodyScrollLockState.y = viewport.y;
        bodyScrollLockState.scrollbarGap = Math.max(0, window.innerWidth - root.clientWidth);
      }

      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${bodyScrollLockState.y}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';

      if (bodyScrollLockState.scrollbarGap > 0) {
        body.style.paddingRight = `${bodyScrollLockState.scrollbarGap}px`;
        return;
      }

      body.style.removeProperty('padding-right');
    }

    function unlockBodyScroll(root, body) {
      body.classList.remove('body-scroll-locked');
      body.style.removeProperty('overflow');

      if (!bodyScrollLockState.locked) return;

      const topOffset = Number.parseInt(body.style.top || '0', 10);
      const restoreX = bodyScrollLockState.x;
      const restoreY = bodyScrollLockState.y || Math.abs(Number.isNaN(topOffset) ? 0 : topOffset);

      bodyScrollLockState.locked = false;
      bodyScrollLockState.x = 0;
      bodyScrollLockState.y = 0;
      bodyScrollLockState.scrollbarGap = 0;

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
      const shouldLock = BODY_SCROLL_LOCK_OVERLAYS.some(id => {
        const el = document.getElementById(id);
        return !!el && el.classList.contains('open');
      });

      if (!root || !body) return;

      if (shouldLock) {
        lockBodyScroll(root, body);
        return;
      }

      unlockBodyScroll(root, body);
    }

    function releaseReviewConfirmPreviewUrls() {
      if (!reviewSubmitConfirmState.previewUrls.length) return;

      reviewSubmitConfirmState.previewUrls.forEach(url => {
        if (typeof url !== 'string' || !url.startsWith('blob:')) return;
        if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') return;
        URL.revokeObjectURL(url);
      });

      reviewSubmitConfirmState.previewUrls = [];
    }

    function createReviewConfirmPreviewUrl(file) {
      if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return '';
      const objectUrl = URL.createObjectURL(file);
      reviewSubmitConfirmState.previewUrls.push(objectUrl);
      return objectUrl;
    }

    function releaseReviewUploadPreviewUrls() {
      if (!reviewUploadPreviewState.objectUrls.length) return;

      reviewUploadPreviewState.objectUrls.forEach(url => {
        if (typeof url !== 'string' || !url.startsWith('blob:')) return;
        if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') return;
        URL.revokeObjectURL(url);
      });

      reviewUploadPreviewState.objectUrls = [];
    }

    function createReviewUploadObjectUrl(file) {
      if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return '';
      const objectUrl = URL.createObjectURL(file);
      reviewUploadPreviewState.objectUrls.push(objectUrl);
      return objectUrl;
    }

    function syncReviewMediaInputFromState() {
      const mediaInput = document.getElementById('reviewUserMedia');
      if (!mediaInput) return;

      if (typeof DataTransfer === 'undefined') {
        // Fallback: cannot reconstruct FileList in this browser.
        return;
      }

      const dt = new DataTransfer();
      reviewUploadFormState.mediaFiles.forEach(file => dt.items.add(file));
      mediaInput.files = dt.files;
    }

    function clearReviewAvatarSelection() {
      const avatarInput = document.getElementById('reviewUserAvatar');
      reviewUploadFormState.avatarFile = null;
      if (avatarInput) avatarInput.value = '';
      updateReviewFileMeta();
    }

    function removeReviewMediaSelection(index) {
      if (!Number.isInteger(index) || index < 0 || index >= reviewUploadFormState.mediaFiles.length) return;
      reviewUploadFormState.mediaFiles = reviewUploadFormState.mediaFiles.filter((_, idx) => idx !== index);
      syncReviewMediaInputFromState();
      updateReviewFileMeta();
    }

    function openReviewSubmitConfirm(payload) {
      const overlay = document.getElementById('reviewSubmitConfirmOverlay');
      const summaryEl = document.getElementById('reviewSubmitConfirmSummary');
      if (!overlay || !summaryEl || !payload) return;

      releaseReviewConfirmPreviewUrls();

      const commentPreview = payload.comment.length > 210
        ? `${payload.comment.slice(0, 210)}...`
        : payload.comment;

      const profileStatus = payload.avatarFile
        ? `${payload.avatarFile.name} • ${formatReviewFileSize(payload.avatarFile.size)}`
        : 'দেওয়া হয়নি';
      const mediaStatus = payload.mediaFiles.length
        ? `${payload.mediaFiles.length}টি`
        : 'দেওয়া হয়নি';

      let profilePreviewMarkup = '<p class="review-confirm-file-name">দেওয়া হয়নি</p>';
      const avatarKind = getReviewFileKind(payload.avatarFile);

      if (payload.avatarFile && avatarKind === 'image') {
        const avatarPreviewUrl = createReviewConfirmPreviewUrl(payload.avatarFile);
        profilePreviewMarkup = `
          <button type="button" class="review-confirm-media-thumb review-confirm-avatar-thumb" data-preview-type="image" data-preview-src="${avatarPreviewUrl}" aria-label="প্রোফাইল ছবি বড় করে দেখুন">
            <img src="${avatarPreviewUrl}" alt="${escapeHtml(payload.avatarFile.name || 'avatar')}" loading="eager" decoding="async">
          </button>
          <p class="review-confirm-file-name">${escapeHtml(profileStatus)}</p>
        `;
      } else if (payload.avatarFile) {
        profilePreviewMarkup = `
          <p class="review-confirm-file-name">${escapeHtml(payload.avatarFile.name || 'অজানা ফাইল')}</p>
          <p class="review-confirm-file-name">Preview unavailable: শুধু image file প্রিভিউ করা যায়</p>
        `;
      }

      let mediaPreviewMarkup = '<p class="review-confirm-file-name">দেওয়া হয়নি</p>';
      if (payload.mediaFiles.length) {
        mediaPreviewMarkup = `
          <div class="review-confirm-media-grid">
            ${payload.mediaFiles.map(file => {
              const src = createReviewConfirmPreviewUrl(file);
              const safeName = escapeHtml(file.name || 'media');
              const safeSize = escapeHtml(formatReviewFileSize(file.size));
              const mediaKind = getReviewFileKind(file);
              const isVideo = mediaKind === 'video';
              const isImage = mediaKind === 'image';

              if (isVideo) {
                return `
                  <button type="button" class="review-confirm-media-thumb review-confirm-media-video" data-preview-type="video" data-preview-src="${src}" aria-label="ভিডিও বড় করে দেখুন">
                    <video src="${src}" muted playsinline preload="metadata"></video>
                    <span class="review-confirm-media-kind">ভিডিও</span>
                    <span class="review-confirm-media-caption">${safeName} • ${safeSize}</span>
                  </button>
                `;
              }

              if (isImage) {
                return `
                  <button type="button" class="review-confirm-media-thumb review-confirm-media-image" data-preview-type="image" data-preview-src="${src}" aria-label="ছবি বড় করে দেখুন">
                    <img src="${src}" alt="${safeName}" loading="eager" decoding="async">
                    <span class="review-confirm-media-kind">ছবি</span>
                    <span class="review-confirm-media-caption">${safeName} • ${safeSize}</span>
                  </button>
                `;
              }

              return `
                <figure class="review-confirm-media-thumb review-confirm-media-unknown">
                  <div class="review-confirm-media-unknown-body">Preview unavailable</div>
                  <figcaption>${safeName} • ${safeSize}</figcaption>
                </figure>
              `;
            }).join('')}
          </div>
          <p class="review-confirm-file-name">মোট ${escapeHtml(mediaStatus)}</p>
        `;
      }

      summaryEl.innerHTML = `
        <div class="review-confirm-item review-confirm-item-meta">
          <span class="review-confirm-item-label">আপনার নাম</span>
          <div class="review-confirm-item-value">${escapeHtml(payload.name)}</div>
        </div>
        <div class="review-confirm-item review-confirm-item-meta">
          <span class="review-confirm-item-label">গাড়ি/কাজের তথ্য</span>
          <div class="review-confirm-item-value">${escapeHtml(payload.workInfo)}</div>
        </div>
        <div class="review-confirm-item review-confirm-item-meta">
          <span class="review-confirm-item-label">রেটিং</span>
          <div class="review-confirm-item-value">${payload.rating}★</div>
        </div>
        <div class="review-confirm-item review-confirm-item-media">
          <span class="review-confirm-item-label">প্রোফাইল ছবি</span>
          <div class="review-confirm-item-value review-confirm-media-wrap">
            ${profilePreviewMarkup}
          </div>
        </div>
        <div class="review-confirm-item review-confirm-item-media">
          <span class="review-confirm-item-label">কাজের ছবি/ভিডিও</span>
          <div class="review-confirm-item-value review-confirm-media-wrap">
            ${mediaPreviewMarkup}
          </div>
        </div>
        <div class="review-confirm-item review-confirm-comment">
          <span class="review-confirm-item-label">রিভিউ টেক্সট</span>
          <div class="review-confirm-item-value">${escapeHtml(commentPreview)}</div>
        </div>
      `;

      reviewSubmitConfirmState.pendingPayload = payload;
      openOverlayDialog(overlay);
      syncBodyScrollLockState();
    }

    function closeReviewSubmitConfirm() {
      const overlay = document.getElementById('reviewSubmitConfirmOverlay');
      if (!overlay) return;

      closeOverlayDialog(overlay);
      syncBodyScrollLockState();
      reviewSubmitConfirmState.pendingPayload = null;
      reviewSubmitConfirmState.submitting = false;
      releaseReviewConfirmPreviewUrls();
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
        submitBtn.textContent = 'সাবমিট হচ্ছে...';
      }
      if (confirmSubmitBtn) {
        confirmSubmitBtn.disabled = true;
        confirmSubmitBtn.textContent = 'সাবমিট হচ্ছে...';
      }

      try {
        const avatar = payload.avatarFile ? await readFileAsDataUrl(payload.avatarFile) : '';
        const media = [];

        for (const file of payload.mediaFiles) {
          // eslint-disable-next-line no-await-in-loop
          media.push(await toMediaPayload(file));
        }

        const pendingReviews = safeParseArray(localStorage.getItem(REVIEW_PENDING_STORAGE_KEY));
        const newReview = {
          id: `review-${Date.now()}`,
          name: payload.name,
          work: payload.workInfo,
          comment: payload.comment,
          rating: payload.rating,
          avatar,
          media,
          approved: false,
          selected: false,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        pendingReviews.unshift(newReview);
        localStorage.setItem(REVIEW_PENDING_STORAGE_KEY, JSON.stringify(pendingReviews));

        if (form) form.reset();
        reviewUploadFormState.avatarFile = null;
        reviewUploadFormState.mediaFiles = [];
        syncReviewMediaInputFromState();
        updateReviewFileMeta();

        closeReviewSubmitConfirm();
        closeReviewModal();

        showToast(
          '✅ রিভিউ জমা হয়েছে',
          'ধন্যবাদ! Dashboard থেকে approve এবং select করার পর আপনার রিভিউ homepage-এ দেখানো হবে।',
          6000
        );
      } catch (error) {
        const quotaHit = error && (error.name === 'QuotaExceededError' || /quota/i.test(String(error.message || '')));
        const message = quotaHit
          ? 'Browser storage limit শেষ হয়ে গেছে। কম size এর image/video দিয়ে আবার submit করুন।'
          : (error?.message || 'রিভিউ submit করা যায়নি। আবার চেষ্টা করুন।');

        showToast('⚠️ রিভিউ জমা হয়নি', message, 6500);
      } finally {
        reviewSubmitConfirmState.submitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'রিভিউ সাবমিট করুন';
        }
        if (confirmSubmitBtn) {
          confirmSubmitBtn.disabled = false;
          confirmSubmitBtn.textContent = 'হ্যাঁ, সাবমিট করুন';
        }
      }
    }

    function safeParseArray(rawValue) {
      try {
        const parsed = JSON.parse(rawValue || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    function escapeHtml(value = '') {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function getFallbackAvatar(index = 0) {
      return REVIEW_AVATAR_FALLBACKS[index % REVIEW_AVATAR_FALLBACKS.length];
    }

    function buildDefaultReviews() {
      return DEFAULT_REVIEW_SEED.map((seed, idx) => {
        const firstImage = DEFAULT_REVIEW_MEDIA_IMAGES[idx % DEFAULT_REVIEW_MEDIA_IMAGES.length];
        const secondImage = DEFAULT_REVIEW_MEDIA_IMAGES[(idx + 7) % DEFAULT_REVIEW_MEDIA_IMAGES.length];
        const video = DEFAULT_REVIEW_MEDIA_VIDEOS[idx % DEFAULT_REVIEW_MEDIA_VIDEOS.length];

        return {
          id: `demo-review-${String(idx + 1).padStart(2, '0')}`,
          name: seed.name,
          work: seed.work,
          rating: seed.rating,
          comment: seed.comment,
          avatar: getFallbackAvatar(idx),
          media: [
            { type: 'image', src: firstImage },
            { type: 'image', src: secondImage },
            { type: 'video', src: video }
          ],
          approved: true,
          selected: true,
          status: 'approved',
          createdAt: new Date(Date.UTC(2026, 0, idx + 1)).toISOString()
        };
      });
    }

    function sanitizeMediaSrc(src = '', type = 'image') {
      const clean = String(src || '').trim();
      if (!clean) return '';

      const isImageData = clean.startsWith('data:image/');
      const isVideoData = clean.startsWith('data:video/');
      const isHttp = /^https?:\/\//i.test(clean);
      const isRelative = clean.startsWith('assets/') || clean.startsWith('./') || clean.startsWith('../');

      if (type === 'video') {
        if (isVideoData || isHttp || isRelative) return clean;
        return '';
      }

      if (isImageData || isHttp || isRelative) return clean;
      return '';
    }

    function normalizeMediaItem(rawMedia) {
      if (!rawMedia) return null;

      if (typeof rawMedia === 'string') {
        const src = rawMedia.trim();
        const isVideo = src.startsWith('data:video/') || /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(src);
        const type = isVideo ? 'video' : 'image';
        const safeSrc = sanitizeMediaSrc(src, type);
        return safeSrc ? { type, src: safeSrc } : null;
      }

      if (typeof rawMedia === 'object') {
        const src = (rawMedia.src || rawMedia.url || '').trim();
        const fallbackType = src.startsWith('data:video/') || /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(src)
          ? 'video'
          : 'image';
        const type = rawMedia.type === 'video' ? 'video' : fallbackType;
        const safeSrc = sanitizeMediaSrc(src, type);
        if (!safeSrc) return null;

        return {
          type,
          src: safeSrc,
          name: rawMedia.name ? String(rawMedia.name) : ''
        };
      }

      return null;
    }

    function normalizeMediaCollection(raw) {
      if (!Array.isArray(raw)) return [];
      return raw
        .map(normalizeMediaItem)
        .filter(Boolean)
        .slice(0, 12);
    }

    function normalizeReview(rawReview, index = 0) {
      if (!rawReview || typeof rawReview !== 'object') return null;

      const rawRating = Number(
        rawReview.rating
        ?? rawReview.score
        ?? rawReview.stars
        ?? rawReview.userRating
        ?? rawReview.reviewScore
        ?? 0
      );
      const rating = Math.max(1, Math.min(5, Math.round(rawRating || 0)));

      const name = String(rawReview.name || rawReview.customerName || rawReview.reviewerName || '').trim();
      const work = String(rawReview.work || rawReview.meta || rawReview.workInfo || rawReview.vehicleInfo || rawReview.workTitle || '').trim();
      const comment = String(rawReview.comment || rawReview.reviewText || rawReview.review || rawReview.text || '').trim();

      if (!name || !work || !comment) return null;

      const avatarCandidate = String(rawReview.avatar || rawReview.avatarUrl || rawReview.profilePic || '').trim();
      const avatar = sanitizeMediaSrc(avatarCandidate, 'image') || getFallbackAvatar(index);

      const directMedia = normalizeMediaCollection(rawReview.media);
      const imageList = Array.isArray(rawReview.images)
        ? rawReview.images.map(src => ({ type: 'image', src }))
        : [];
      const videoList = Array.isArray(rawReview.videos)
        ? rawReview.videos.map(src => ({ type: 'video', src }))
        : [];
      const mergedMedia = directMedia.length
        ? directMedia
        : normalizeMediaCollection([...imageList, ...videoList]);

      return {
        id: String(rawReview.id || rawReview.reviewId || `review-${Date.now()}-${index}`),
        name,
        work,
        rating,
        comment,
        avatar,
        media: mergedMedia,
        approved: rawReview.approved !== false && rawReview.isApproved !== false,
        selected: rawReview.selected !== false && rawReview.isSelected !== false,
        status: String(rawReview.status || ((rawReview.approved === false || rawReview.isApproved === false) ? 'pending' : 'approved')),
        createdAt: String(rawReview.createdAt || rawReview.dateISO || rawReview.date || '')
      };
    }

    function collectFallbackReviewsFromMarkup() {
      const cards = Array.from(document.querySelectorAll('#reviewsGrid .review-card[data-review-score]'));

      return cards
        .map((card, idx) => {
          const name = card.querySelector('.reviewer-name')?.textContent?.trim() || '';
          const work = card.querySelector('.reviewer-meta')?.textContent?.trim() || '';
          const comment = card.querySelector('.reviewer-comment')?.textContent?.trim() || '';
          const avatar = card.querySelector('.review-avatar')?.getAttribute('src') || getFallbackAvatar(idx);
          const scoreRaw = Number(card.dataset.reviewScore);

          return normalizeReview({
            id: `seed-review-${idx + 1}`,
            name,
            work,
            comment,
            avatar,
            rating: scoreRaw,
            approved: true,
            selected: true,
            status: 'approved'
          }, idx);
        })
        .filter(Boolean);
    }

    function loadPublishedReviews() {
      const storedReviews = safeParseArray(localStorage.getItem(REVIEW_STORAGE_KEY));
      const source = storedReviews.length ? storedReviews : reviewState.fallbackReviews;

      const normalized = source
        .map((review, idx) => normalizeReview(review, idx))
        .filter(Boolean)
        .filter(review => review.approved !== false && review.status !== 'pending');

      const selectedIds = safeParseArray(localStorage.getItem(REVIEW_SELECTED_IDS_KEY)).map(id => String(id));
      const selectedSet = new Set(selectedIds);

      const selected = selectedSet.size
        ? normalized.filter(review => selectedSet.has(String(review.id)))
        : normalized.filter(review => review.selected !== false);

      selected.sort((a, b) => {
        const left = Date.parse(a.createdAt || '') || 0;
        const right = Date.parse(b.createdAt || '') || 0;
        return right - left;
      });

      reviewState.publishedReviews = selected;
    }

    function getReviewStars(rating) {
      return `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;
    }

    function getReviewDateMeta(value) {
      const timestamp = Date.parse(String(value || '').trim());
      if (!Number.isFinite(timestamp)) return null;

      const date = new Date(timestamp);

      return {
        datetime: date.toISOString(),
        label: new Intl.DateTimeFormat('bn-BD', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(date)
      };
    }

    function getReviewsPerPage() {
      if (window.innerWidth <= 640) return 2;
      if (window.innerWidth <= 1100) return 4;
      return 6;
    }

    function renderReviewMedia(mediaList) {
      if (!mediaList.length) return '';

      return `
        <ul class="review-media-strip">
          ${mediaList.map((item, idx) => {
            const safeSrc = escapeHtml(item.src);
            if (!safeSrc) return '';

            if (item.type === 'video') {
              return `
                <li class="review-media-item-shell">
                  <button type="button" class="review-media-item" data-media-index="${idx}" data-preview-type="video" data-preview-src="${safeSrc}" aria-label="ভিডিও বড় করে দেখুন">
                    <video src="${safeSrc}" preload="metadata" playsinline muted></video>
                    <span class="review-media-open-indicator">⤢</span>
                    <span class="review-media-type">ভিডিও</span>
                  </button>
                </li>
              `;
            }

            return `
              <li class="review-media-item-shell">
                <button type="button" class="review-media-item" data-media-index="${idx}" data-preview-type="image" data-preview-src="${safeSrc}" aria-label="ছবি বড় করে দেখুন">
                  <img src="${safeSrc}" alt="Customer work media ${idx + 1}" loading="lazy" decoding="async">
                  <span class="review-media-open-indicator">⤢</span>
                  <span class="review-media-type">ছবি</span>
                </button>
              </li>
            `;
          }).join('')}
        </ul>
      `;
    }

    function renderReviewMediaPreview() {
      const wrap = document.getElementById('reviewPreviewMediaWrap');
      const titleEl = document.getElementById('reviewPreviewTitle');
      const counterEl = document.getElementById('reviewPreviewCounter');
      const fullBtn = document.getElementById('reviewPreviewFullscreenBtn');
      const prevBtn = document.getElementById('reviewPreviewPrev');
      const nextBtn = document.getElementById('reviewPreviewNext');
      if (!wrap || !titleEl || !counterEl || !fullBtn) return;

      const total = reviewPreviewState.items.length;
      const current = reviewPreviewState.items[reviewPreviewState.index];

      if (prevBtn) prevBtn.hidden = total <= 1;
      if (nextBtn) nextBtn.hidden = total <= 1;

      if (!current) {
        wrap.innerHTML = '<div class="review-preview-empty">কোনো preview item পাওয়া যায়নি।</div>';
        titleEl.textContent = 'রিভিউ মিডিয়া';
        counterEl.textContent = '0 / 0';
        fullBtn.hidden = true;
        return;
      }

      titleEl.textContent = reviewPreviewState.title || 'রিভিউ মিডিয়া';
      counterEl.textContent = `${reviewPreviewState.index + 1} / ${total}`;

      if (current.type === 'video') {
        wrap.innerHTML = `<video id="reviewPreviewVideo" src="${escapeHtml(current.src)}" controls playsinline preload="metadata"></video>`;
        fullBtn.hidden = false;
      } else {
        wrap.innerHTML = `<img src="${escapeHtml(current.src)}" alt="Review media preview">`;
        fullBtn.hidden = true;
      }
    }

    function openReviewMediaPreview(items, startIndex = 0, title = '') {
      const overlay = document.getElementById('reviewMediaPreviewOverlay');
      if (!overlay || !Array.isArray(items) || !items.length) return;

      modalViewportState.reviewMediaPreview = captureViewportPosition();
      reviewPreviewState.items = items;
      reviewPreviewState.index = Math.max(0, Math.min(startIndex, items.length - 1));
      reviewPreviewState.title = title;

      renderReviewMediaPreview();
      openOverlayDialog(overlay);
      syncBodyScrollLockState();
      scheduleViewportRestore(modalViewportState.reviewMediaPreview);
    }

    function closeReviewMediaPreview() {
      const overlay = document.getElementById('reviewMediaPreviewOverlay');
      if (!overlay) return;
      const viewport = modalViewportState.reviewMediaPreview || captureViewportPosition();

      const videoEl = document.getElementById('reviewPreviewVideo');
      if (videoEl) videoEl.pause();

      closeOverlayDialog(overlay);
      syncBodyScrollLockState();
      scheduleViewportRestore(viewport);
      modalViewportState.reviewMediaPreview = null;
    }

    function navReviewMediaPreview(dir) {
      const total = reviewPreviewState.items.length;
      if (!total) return;

      reviewPreviewState.index = (reviewPreviewState.index + dir + total) % total;
      renderReviewMediaPreview();
    }

    function requestReviewPreviewFullscreen() {
      const videoEl = document.getElementById('reviewPreviewVideo');
      if (!videoEl || typeof videoEl.requestFullscreen !== 'function') return;
      videoEl.requestFullscreen().catch(() => { /* no-op */ });
    }

    function getPreviewItemsFromStrip(stripEl) {
      const nodes = Array.from(stripEl.querySelectorAll('.review-media-item'));

      const items = nodes
        .map(node => ({
          type: node.dataset.previewType === 'video' ? 'video' : 'image',
          src: String(node.dataset.previewSrc || '').trim()
        }))
        .filter(item => item.src);

      return { items, nodes };
    }

    function initReviewMediaPreviewEvents() {
      const grid = document.getElementById('reviewsGrid');
      const overlay = document.getElementById('reviewMediaPreviewOverlay');
      const prevBtn = document.getElementById('reviewPreviewPrev');
      const nextBtn = document.getElementById('reviewPreviewNext');
      const closeBtn = document.getElementById('reviewPreviewClose');
      const fullscreenBtn = document.getElementById('reviewPreviewFullscreenBtn');

      if (!grid || !overlay) return;

      grid.addEventListener('click', event => {
        const mediaItem = event.target.closest('.review-media-item');
        if (!mediaItem || !grid.contains(mediaItem)) return;

        const strip = mediaItem.closest('.review-media-strip');
        if (!strip) return;

        const { items, nodes } = getPreviewItemsFromStrip(strip);
        if (!items.length) return;

        const startIndex = Math.max(0, nodes.indexOf(mediaItem));
        const card = mediaItem.closest('.review-card');
        const title = card?.querySelector('.reviewer-name')?.textContent?.trim() || 'রিভিউ মিডিয়া';

        openReviewMediaPreview(items, startIndex, title);
      });

      overlay.addEventListener('click', event => {
        if (event.target === overlay) closeReviewMediaPreview();
      });
      overlay.addEventListener('cancel', event => {
        event.preventDefault();
        closeReviewMediaPreview();
      });

      if (prevBtn) prevBtn.addEventListener('click', () => navReviewMediaPreview(-1));
      if (nextBtn) nextBtn.addEventListener('click', () => navReviewMediaPreview(+1));
      if (closeBtn) closeBtn.addEventListener('click', closeReviewMediaPreview);
      if (fullscreenBtn) fullscreenBtn.addEventListener('click', requestReviewPreviewFullscreen);

      document.addEventListener('keydown', event => {
        if (!overlay.classList.contains('open')) return;
        if (event.key === 'ArrowRight') navReviewMediaPreview(+1);
        if (event.key === 'ArrowLeft') navReviewMediaPreview(-1);
        if (event.key.toLowerCase() === 'f') requestReviewPreviewFullscreen();
        if (event.key === 'Escape') closeReviewMediaPreview();
      });
    }

    function reviewCardTemplate(review, idx) {
      const rating = Math.max(1, Math.min(5, Math.round(Number(review.rating) || 0)));
      const stars = getReviewStars(rating);
      const delayClass = idx % 6 ? `reveal-delay-${Math.min(idx % 6, 5)}` : '';
      const mediaBlock = renderReviewMedia(review.media || []);
      const reviewDate = getReviewDateMeta(review.createdAt);
      const reviewDateMarkup = reviewDate
        ? `<time class="reviewer-time" datetime="${escapeHtml(reviewDate.datetime)}">${escapeHtml(reviewDate.label)}</time>`
        : '';

      return `
        <article class="review-card reveal ${delayClass}" data-review-id="${escapeHtml(review.id)}" data-review-score="${rating}">
          <div class="review-card-head">
            <img src="${escapeHtml(review.avatar)}" class="review-avatar" alt="Customer profile: ${escapeHtml(review.name)}" loading="lazy" decoding="async">
            <div class="reviewer-info">
              <h3 class="reviewer-name">${escapeHtml(review.name)}</h3>
              <p class="reviewer-meta">
                <span class="reviewer-work">${escapeHtml(review.work)}</span>
                ${reviewDateMarkup}
              </p>
            </div>
            <div class="reviewer-rating">
              <span class="visually-hidden">${rating} out of 5 stars</span>
              <span class="reviewer-stars" aria-hidden="true">${stars}</span>
            </div>
          </div>
          <p class="reviewer-comment">${escapeHtml(review.comment)}</p>
          ${mediaBlock}
        </article>
      `;
    }

    function updateReviewsSummary(reviews) {
      const avgEl = document.getElementById('reviewsAverage');
      const countEl = document.getElementById('reviewsCount');
      const starsFillEl = document.getElementById('reviewsStarsFill');

      const scores = reviews
        .map(review => Number(review.rating))
        .filter(score => Number.isFinite(score) && score >= 1 && score <= 5)
        .map(score => Math.round(score));

      const total = scores.length;

      if (!total) {
        if (avgEl) avgEl.textContent = '0.0';
        if (countEl) countEl.textContent = '0';
        if (starsFillEl) starsFillEl.style.width = '0%';
        document.querySelectorAll('.reviews-breakdown-row[data-stars]').forEach(row => {
          const fillEl = row.querySelector('.reviews-breakdown-fill');
          const countTextEl = row.querySelector('.reviews-breakdown-count');
          if (fillEl) fillEl.style.width = '0%';
          if (countTextEl) countTextEl.textContent = '0';
        });
        return;
      }

      const average = scores.reduce((sum, score) => sum + score, 0) / total;
      const roundedAverage = Math.round(average * 10) / 10;

      if (avgEl) avgEl.textContent = roundedAverage.toFixed(1);
      if (countEl) countEl.textContent = String(total);
      if (starsFillEl) starsFillEl.style.width = `${Math.max(0, Math.min(100, (average / 5) * 100))}%`;

      const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      scores.forEach(score => {
        buckets[score] += 1;
      });

      document.querySelectorAll('.reviews-breakdown-row[data-stars]').forEach(row => {
        const stars = Number(row.dataset.stars);
        const count = buckets[stars] || 0;
        const fillEl = row.querySelector('.reviews-breakdown-fill');
        const countTextEl = row.querySelector('.reviews-breakdown-count');

        if (fillEl) fillEl.style.width = `${(count / total) * 100}%`;
        if (countTextEl) countTextEl.textContent = String(count);
      });
    }

    function updateReviewsDisplayMeta(total, from, to) {
      const metaEl = document.getElementById('reviewsDisplayMeta');
      if (!metaEl) return;

      if (!total) {
        metaEl.textContent = 'এখনও approved রিভিউ পাওয়া যায়নি।';
        return;
      }

      metaEl.textContent = `মোট ${total}টি রিভিউ থেকে ${from}-${to}টি দেখানো হচ্ছে`;
    }

    function buildPageTokens(totalPages, currentPage) {
      const tokens = [];
      for (let page = 1; page <= totalPages; page += 1) {
        const edgePage = page === 1 || page === totalPages;
        const nearCurrent = Math.abs(page - currentPage) <= 1;
        if (edgePage || nearCurrent) tokens.push(page);
        else if (tokens[tokens.length - 1] !== 'ellipsis') tokens.push('ellipsis');
      }
      return tokens;
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
      const grid = document.getElementById('reviewsGrid');
      if (!grid) return;

      const allReviews = reviewState.publishedReviews;
      reviewState.perPage = getReviewsPerPage();

      const total = allReviews.length;
      const totalPages = Math.max(1, Math.ceil(total / reviewState.perPage));
      reviewState.page = Math.max(1, Math.min(reviewState.page, totalPages));

      if (!total) {
        grid.innerHTML = `
          <div class="reviews-empty">
            <h3>এই মুহূর্তে show করার মতো approved review নেই</h3>
            <p>আপনার কাজের ছবি/ভিডিওসহ রিভিউ দিন, approve হলে এখানে দেখানো হবে।</p>
          </div>
        `;
        updateReviewsSummary([]);
        updateReviewsDisplayMeta(0, 0, 0);
        renderReviewsPagination(0);
        return;
      }

      const start = (reviewState.page - 1) * reviewState.perPage;
      const end = start + reviewState.perPage;
      const pageItems = allReviews.slice(start, end);

      grid.innerHTML = pageItems.map((review, idx) => reviewCardTemplate(review, idx)).join('');
      updateReviewsSummary(allReviews);
      updateReviewsDisplayMeta(total, start + 1, Math.min(end, total));
      renderReviewsPagination(totalPages);
      observeRevealElements(grid);
    }

    function refreshReviews(resetPage = false) {
      loadPublishedReviews();
      if (resetPage) reviewState.page = 1;
      renderReviewsPage();
    }

    function readFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('File পড়তে সমস্যা হয়েছে।'));
        reader.readAsDataURL(file);
      });
    }

    async function toMediaPayload(file) {
      const fileKind = getReviewFileKind(file);
      const isImage = fileKind === 'image';
      const isVideo = fileKind === 'video';

      if (fileKind === 'unknown') {
        throw new Error('শুধু image/video file দেওয়া যাবে।');
      }

      const maxSizeBytes = isVideo ? 8 * 1024 * 1024 : 2 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const maxText = isVideo ? '8MB' : '2MB';
        throw new Error(`${file.name} file size limit (${maxText}) এর বেশি।`);
      }

      const src = await readFileAsDataUrl(file);
      return {
        type: isVideo ? 'video' : 'image',
        src,
        name: file.name
      };
    }

    function openReviewModal() {
      const modal = document.getElementById('reviewSubmitModal');
      if (!modal) return;
      modalFocusState.reviewSubmitTrigger = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      modalViewportState.reviewSubmitModal = captureViewportPosition();
      openOverlayDialog(modal);
      syncBodyScrollLockState();
      updateReviewFileMeta();
      focusFirstIn(modal);
      scheduleViewportRestore(modalViewportState.reviewSubmitModal);
    }

    function closeReviewModal() {
      const modal = document.getElementById('reviewSubmitModal');
      if (!modal) return;
      const viewport = modalViewportState.reviewSubmitModal || captureViewportPosition();
      closeOverlayDialog(modal);
      closeReviewSubmitConfirm();
      releaseReviewUploadPreviewUrls();
      syncBodyScrollLockState();
      restoreFocus(modalFocusState.reviewSubmitTrigger);
      scheduleViewportRestore(viewport);
      modalViewportState.reviewSubmitModal = null;
    }

    function updateReviewFileMeta() {
      const avatarInput = document.getElementById('reviewUserAvatar');
      const mediaInput = document.getElementById('reviewUserMedia');
      const metaEl = document.getElementById('reviewSubmitFileMeta');
      const avatarPreviewEl = document.getElementById('reviewAvatarPreview');
      const mediaPreviewGridEl = document.getElementById('reviewMediaPreviewGrid');
      if (!avatarInput || !mediaInput || !metaEl) return;

      releaseReviewUploadPreviewUrls();

      const avatarFile = reviewUploadFormState.avatarFile;
      const mediaFiles = reviewUploadFormState.mediaFiles;

      if (avatarPreviewEl) {
        if (avatarFile && getReviewFileKind(avatarFile) === 'image') {
          const avatarUrl = createReviewUploadObjectUrl(avatarFile);
          avatarPreviewEl.innerHTML = `
            <div class="review-file-preview-content">
              <button type="button" class="review-upload-preview-trigger" data-preview-type="image" data-preview-src="${avatarUrl}" aria-label="প্রোফাইল ছবি বড় করে দেখুন">
                <img src="${avatarUrl}" alt="Selected profile preview" loading="eager" decoding="async">
              </button>
              <div class="review-file-preview-note-row">
                <p class="review-file-preview-note">${escapeHtml(avatarFile.name)}</p>
                <button type="button" class="review-upload-file-remove" data-remove-avatar="1">রিমুভ</button>
              </div>
            </div>
          `;
        } else if (avatarFile) {
          avatarPreviewEl.innerHTML = '<div class="review-file-preview-empty">এই ফাইল প্রোফাইল preview হিসেবে দেখানো যাবে না।</div>';
        } else {
          avatarPreviewEl.innerHTML = '<div class="review-file-preview-empty">প্রোফাইল ছবি নির্বাচন করলে এখানে preview দেখা যাবে।</div>';
        }
      }

      if (mediaPreviewGridEl) {
        if (!mediaFiles.length) {
          mediaPreviewGridEl.innerHTML = '<div class="review-file-preview-empty">কাজের ছবি/ভিডিও নির্বাচন করলে এখানে preview দেখা যাবে।</div>';
        } else {
          mediaPreviewGridEl.innerHTML = mediaFiles.map((file, idx) => {
            const safeName = escapeHtml(file.name || 'media');
            const fileKind = getReviewFileKind(file);

            if (fileKind === 'image') {
              const src = createReviewUploadObjectUrl(file);
              return `
                <article class="review-media-preview-card">
                  <button type="button" class="review-media-preview-trigger" data-preview-type="image" data-preview-src="${src}" aria-label="ছবি বড় করে দেখুন">
                    <img src="${src}" alt="${safeName}" loading="eager" decoding="async">
                    <span class="review-media-preview-badge">ছবি</span>
                    <span class="review-media-preview-name">${safeName}</span>
                  </button>
                  <button type="button" class="review-media-preview-remove" data-remove-media-index="${idx}" aria-label="এই ছবি রিমুভ করুন">✕</button>
                </article>
              `;
            }

            if (fileKind === 'video') {
              const src = createReviewUploadObjectUrl(file);
              return `
                <article class="review-media-preview-card">
                  <button type="button" class="review-media-preview-trigger" data-preview-type="video" data-preview-src="${src}" aria-label="ভিডিও বড় করে দেখুন">
                    <video src="${src}" controls muted playsinline preload="auto"></video>
                    <span class="review-media-preview-badge">ভিডিও</span>
                    <span class="review-media-preview-name">${safeName}</span>
                  </button>
                  <button type="button" class="review-media-preview-remove" data-remove-media-index="${idx}" aria-label="এই ভিডিও রিমুভ করুন">✕</button>
                </article>
              `;
            }

            return `
              <article class="review-media-preview-card">
                <button type="button" class="review-media-preview-remove" data-remove-media-index="${idx}" aria-label="এই ফাইল রিমুভ করুন">✕</button>
                <div class="review-file-preview-empty">Preview unavailable</div>
                <p class="review-media-preview-name">${safeName}</p>
              </article>
            `;
          }).join('');
        }
      }

      if (!avatarFile && !mediaFiles.length) {
        metaEl.textContent = 'এখনও কোনো file নির্বাচন করা হয়নি।';
        return;
      }

      const mediaNames = mediaFiles.slice(0, 2).map(file => file.name).join(', ');
      const extraText = mediaFiles.length > 2 ? ` +${mediaFiles.length - 2}টি` : '';
      const avatarLabel = avatarFile ? avatarFile.name : 'দেওয়া হয়নি';
      const mediaLabel = mediaFiles.length
        ? `${mediaFiles.length}টি${mediaNames ? ` (${mediaNames}${extraText})` : ''}`
        : 'দেওয়া হয়নি';

      metaEl.textContent = `প্রোফাইল: ${avatarLabel} | মিডিয়া: ${mediaLabel}`;
    }

    function initReviewUploadPreviewInteractions() {
      const avatarPreviewEl = document.getElementById('reviewAvatarPreview');
      const mediaPreviewGridEl = document.getElementById('reviewMediaPreviewGrid');

      if (avatarPreviewEl) {
        avatarPreviewEl.addEventListener('click', event => {
          const removeBtn = event.target.closest('.review-upload-file-remove[data-remove-avatar]');
          if (removeBtn) {
            clearReviewAvatarSelection();
            return;
          }

          const trigger = event.target.closest('.review-upload-preview-trigger[data-preview-src]');
          if (!trigger) return;

          const src = String(trigger.dataset.previewSrc || '').trim();
          if (!src) return;
          openReviewMediaPreview([{ type: 'image', src }], 0, 'প্রোফাইল ছবি');
        });
      }

      if (!mediaPreviewGridEl) return;

      const openFromMediaCard = sourceEl => {
        const triggers = Array.from(mediaPreviewGridEl.querySelectorAll('.review-media-preview-trigger[data-preview-src]'));
        if (!triggers.length) return;

        const items = triggers
          .map(trigger => ({
            type: trigger.dataset.previewType === 'video' ? 'video' : 'image',
            src: String(trigger.dataset.previewSrc || '').trim()
          }))
          .filter(item => item.src);

        if (!items.length) return;

        const startIndex = Math.max(0, triggers.indexOf(sourceEl));
        openReviewMediaPreview(items, startIndex, 'আপনার আপলোড করা মিডিয়া');
      };

      mediaPreviewGridEl.addEventListener('click', event => {
        const removeBtn = event.target.closest('.review-media-preview-remove[data-remove-media-index]');
        if (removeBtn) {
          const idx = Number(removeBtn.dataset.removeMediaIndex || '-1');
          removeReviewMediaSelection(idx);
          return;
        }

        const trigger = event.target.closest('.review-media-preview-trigger[data-preview-src]');
        if (!trigger || !mediaPreviewGridEl.contains(trigger)) return;
        openFromMediaCard(trigger);
      });
    }

    function initReviewConfirmPreviewInteractions() {
      const summaryEl = document.getElementById('reviewSubmitConfirmSummary');
      if (!summaryEl) return;

      const openFromConfirmThumb = sourceEl => {
        const src = String(sourceEl.dataset.previewSrc || '').trim();
        if (!src) return;

        const type = sourceEl.dataset.previewType === 'video' ? 'video' : 'image';
        const mediaGrid = sourceEl.closest('.review-confirm-media-grid');

        if (!mediaGrid) {
          openReviewMediaPreview([{ type, src }], 0, 'প্রোফাইল ছবি');
          return;
        }

        const triggers = Array.from(mediaGrid.querySelectorAll('.review-confirm-media-thumb[data-preview-src]'));
        if (!triggers.length) return;

        const items = triggers
          .map(trigger => ({
            type: trigger.dataset.previewType === 'video' ? 'video' : 'image',
            src: String(trigger.dataset.previewSrc || '').trim()
          }))
          .filter(item => item.src);

        if (!items.length) return;

        const startIndex = Math.max(0, triggers.indexOf(sourceEl));
        openReviewMediaPreview(items, startIndex, 'কাজের ছবি/ভিডিও');
      };

      summaryEl.addEventListener('click', event => {
        const thumb = event.target.closest('.review-confirm-media-thumb[data-preview-src]');
        if (!thumb || !summaryEl.contains(thumb)) return;
        openFromConfirmThumb(thumb);
      });

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
        showToast('⚠️ অপূর্ণ তথ্য', 'নাম, কাজের তথ্য ও রিভিউ লিখতে হবে।');
        return;
      }

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        showToast('⚠️ ভুল রেটিং', 'রেটিং শুধু ১, ২, ৩, ৪ বা ৫ হতে পারবে।');
        return;
      }

      if (avatarFile && getReviewFileKind(avatarFile) !== 'image') {
        showToast('⚠️ ভুল প্রোফাইল ফাইল', 'প্রোফাইল হিসেবে image file দিন।');
        return;
      }

      if (avatarFile && avatarFile.size > 2 * 1024 * 1024) {
        showToast('⚠️ প্রোফাইল ফাইল বড়', 'Profile photo 2MB এর মধ্যে দিন।');
        return;
      }

      if (mediaFiles.length > 6) {
        showToast('⚠️ অতিরিক্ত ফাইল', 'সর্বোচ্চ ৬টি image/video দেয়া যাবে।');
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

    function initReviewSubmissionModal() {
      const openBtns = [
        document.getElementById('openReviewModalBtn'),
        document.getElementById('openReviewModalBtnTop')
      ].filter(Boolean);

      const closeBtn = document.getElementById('closeReviewModalBtn');
      const cancelBtn = document.getElementById('reviewCancelBtn');
      const overlay = document.getElementById('reviewSubmitModal');
      const form = document.getElementById('reviewSubmitForm');
      const avatarInput = document.getElementById('reviewUserAvatar');
      const mediaInput = document.getElementById('reviewUserMedia');
      const confirmOverlay = document.getElementById('reviewSubmitConfirmOverlay');
      const confirmCloseBtn = document.getElementById('reviewSubmitConfirmClose');
      const confirmEditBtn = document.getElementById('reviewSubmitConfirmEditBtn');
      const confirmSubmitBtn = document.getElementById('reviewSubmitConfirmSubmitBtn');

      openBtns.forEach(btn => btn.addEventListener('click', openReviewModal));
      if (closeBtn) closeBtn.addEventListener('click', closeReviewModal);
      if (cancelBtn) cancelBtn.addEventListener('click', closeReviewModal);
      if (confirmCloseBtn) confirmCloseBtn.addEventListener('click', closeReviewSubmitConfirm);
      if (confirmEditBtn) confirmEditBtn.addEventListener('click', closeReviewSubmitConfirm);
      if (confirmSubmitBtn) confirmSubmitBtn.addEventListener('click', () => {
        finalizeReviewSubmitFromConfirm();
      });

      if (overlay) {
        overlay.addEventListener('click', event => {
          if (event.target === overlay) closeReviewModal();
        });
        overlay.addEventListener('cancel', event => {
          event.preventDefault();
          closeReviewModal();
        });
      }

      if (confirmOverlay) {
        confirmOverlay.addEventListener('click', event => {
          if (event.target === confirmOverlay) closeReviewSubmitConfirm();
        });
        confirmOverlay.addEventListener('cancel', event => {
          event.preventDefault();
          closeReviewSubmitConfirm();
        });
      }

      if (avatarInput) {
        avatarInput.addEventListener('change', () => {
          reviewUploadFormState.avatarFile = avatarInput.files?.[0] || null;
          closeReviewSubmitConfirm();
          updateReviewFileMeta();
        });
      }

      if (mediaInput) {
        mediaInput.addEventListener('change', () => {
          reviewUploadFormState.mediaFiles = Array.from(mediaInput.files || []);
          closeReviewSubmitConfirm();
          updateReviewFileMeta();
        });
      }

      if (form) form.addEventListener('submit', handleReviewSubmit);
      initReviewUploadPreviewInteractions();
      initReviewConfirmPreviewInteractions();
      updateReviewFileMeta();
    }

    function initReviewsPaginationEvents() {
      const paginationEl = document.getElementById('reviewsPagination');
      if (!paginationEl) return;

      paginationEl.addEventListener('click', event => {
        const btn = event.target.closest('button[data-page], button[data-action]');
        if (!btn) return;

        const totalPages = Math.max(1, Math.ceil(reviewState.publishedReviews.length / reviewState.perPage));

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
      reviewState.fallbackReviews = buildDefaultReviews();
      reviewState.perPage = getReviewsPerPage();

      initReviewsPaginationEvents();
      initReviewSubmissionModal();
      initReviewMediaPreviewEvents();
      refreshReviews(true);

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

    // ─── TOAST ───────────────────────────────────────────────────────────────────
    function showToast(title, msg, duration = 4000) {
      const t = document.getElementById('toast');
      document.getElementById('toastTitle').textContent = title;
      document.getElementById('toastMsg').textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), duration);
    }

    // ─── INIT ─────────────────────────────────────────────────────────────────────
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    window.addEventListener('load', () => {
      if (!window.location.hash) {
        window.scrollTo(0, 0);
      }
    });

    window.addEventListener('pageshow', syncBodyScrollLockState);
    window.addEventListener('resize', syncBodyScrollLockState);
    window.addEventListener('orientationchange', syncBodyScrollLockState);
    syncBodyScrollLockState();

    initHomeAboutTeam({
      openDialog: openOverlayDialog,
      closeDialog: closeOverlayDialog,
      focusWithoutScroll,
      restoreFocus,
      captureViewportPosition,
      scheduleViewportRestore,
      syncBodyScrollLockState
    });
    initHomeGallery({
      openDialog: openOverlayDialog,
      closeDialog: closeOverlayDialog,
      focusWithoutScroll,
      restoreFocus,
      captureViewportPosition,
      scheduleViewportRestore,
      syncBodyScrollLockState
    });
    initHomeSamples({
      orderStorageKey: ORDER_STORAGE_KEY,
      openDialog: openOverlayDialog,
      closeDialog: closeOverlayDialog,
      focusWithoutScroll,
      restoreFocus,
      captureViewportPosition,
      scheduleViewportRestore,
      syncBodyScrollLockState,
      showToast
    });
    initReviewsModule();
}


