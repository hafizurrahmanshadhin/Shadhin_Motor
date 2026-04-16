    // ─── NAVBAR ─────────────────────────────────────────────────────────────────
    const navbar = document.getElementById('navbar');
    const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const trackedSections = Array.from(document.querySelectorAll('section[id]'))
      .filter(section => navLinks.some(link => link.getAttribute('href') === `#${section.id}`));

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

    function toggleNav() {
      document.getElementById('navLinks').classList.toggle('open');
    }
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', () => {
        document.getElementById('navLinks').classList.remove('open');
        const targetId = a.getAttribute('href');
        if (targetId && targetId.startsWith('#')) setActiveNavLink(targetId);
      });
    });

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
    const REVIEW_STORAGE_KEY = 'ac_reviews';
    const REVIEW_PENDING_STORAGE_KEY = 'ac_review_submissions';
    const REVIEW_SELECTED_IDS_KEY = 'ac_selected_review_ids';
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

    function getReviewsPerPage() {
      if (window.innerWidth <= 640) return 2;
      if (window.innerWidth <= 1100) return 4;
      return 6;
    }

    function renderReviewMedia(mediaList) {
      if (!mediaList.length) return '';

      return `
        <div class="review-media-strip" aria-label="Customer shared media">
          ${mediaList.map((item, idx) => {
            const safeSrc = escapeHtml(item.src);
            if (!safeSrc) return '';

            if (item.type === 'video') {
              return `
                <figure class="review-media-item" data-media-index="${idx}" data-preview-type="video" data-preview-src="${safeSrc}" role="button" tabindex="0" aria-label="ভিডিও বড় করে দেখুন">
                  <video src="${safeSrc}" preload="metadata" playsinline muted></video>
                  <span class="review-media-open-indicator">⤢</span>
                  <span class="review-media-type">ভিডিও</span>
                </figure>
              `;
            }

            return `
              <figure class="review-media-item" data-media-index="${idx}" data-preview-type="image" data-preview-src="${safeSrc}" role="button" tabindex="0" aria-label="ছবি বড় করে দেখুন">
                <img src="${safeSrc}" alt="Customer work media ${idx + 1}" loading="lazy" decoding="async">
                <span class="review-media-open-indicator">⤢</span>
                <span class="review-media-type">ছবি</span>
              </figure>
            `;
          }).join('')}
        </div>
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

      reviewPreviewState.items = items;
      reviewPreviewState.index = Math.max(0, Math.min(startIndex, items.length - 1));
      reviewPreviewState.title = title;

      renderReviewMediaPreview();
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeReviewMediaPreview() {
      const overlay = document.getElementById('reviewMediaPreviewOverlay');
      if (!overlay) return;

      const videoEl = document.getElementById('reviewPreviewVideo');
      if (videoEl) videoEl.pause();

      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');

      const reviewSubmitOpen = document.getElementById('reviewSubmitModal')?.classList.contains('open');
      const galleryLightboxOpen = document.getElementById('lightboxOverlay')?.classList.contains('open');
      if (!reviewSubmitOpen && !galleryLightboxOpen) {
        document.body.style.overflow = '';
      }
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

      grid.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;

        const mediaItem = event.target.closest('.review-media-item');
        if (!mediaItem || !grid.contains(mediaItem)) return;

        event.preventDefault();
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

      if (prevBtn) prevBtn.addEventListener('click', () => navReviewMediaPreview(-1));
      if (nextBtn) nextBtn.addEventListener('click', () => navReviewMediaPreview(+1));
      if (closeBtn) closeBtn.addEventListener('click', closeReviewMediaPreview);
      if (fullscreenBtn) fullscreenBtn.addEventListener('click', requestReviewPreviewFullscreen);
    }

    function reviewCardTemplate(review, idx) {
      const rating = Math.max(1, Math.min(5, Math.round(Number(review.rating) || 0)));
      const stars = getReviewStars(rating);
      const delayClass = idx % 6 ? `reveal-delay-${Math.min(idx % 6, 5)}` : '';
      const mediaBlock = renderReviewMedia(review.media || []);

      return `
        <article class="review-card reveal ${delayClass}" data-review-id="${escapeHtml(review.id)}" data-review-score="${rating}">
          <div class="review-card-head">
            <img src="${escapeHtml(review.avatar)}" class="review-avatar" alt="Customer profile: ${escapeHtml(review.name)}" loading="lazy" decoding="async">
            <div class="reviewer-info">
              <h3 class="reviewer-name">${escapeHtml(review.name)}</h3>
              <p class="reviewer-meta">${escapeHtml(review.work)}</p>
            </div>
            <div class="reviewer-rating" aria-label="${rating} out of 5 stars">
              <span class="reviewer-stars">${stars}</span>
              <strong>${rating}</strong>
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
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
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
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeReviewModal() {
      const modal = document.getElementById('reviewSubmitModal');
      if (!modal) return;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function updateReviewFileMeta() {
      const avatarInput = document.getElementById('reviewUserAvatar');
      const mediaInput = document.getElementById('reviewUserMedia');
      const metaEl = document.getElementById('reviewSubmitFileMeta');
      if (!avatarInput || !mediaInput || !metaEl) return;

      const avatarFile = avatarInput.files?.[0] || null;
      const mediaFiles = Array.from(mediaInput.files || []);

      if (!avatarFile && !mediaFiles.length) {
        metaEl.textContent = 'এখনও কোনো file নির্বাচন করা হয়নি।';
        return;
      }

      const mediaNames = mediaFiles.slice(0, 2).map(file => file.name).join(', ');
      const extraText = mediaFiles.length > 2 ? ` +${mediaFiles.length - 2}টি` : '';

      metaEl.textContent = `প্রোফাইল: ${avatarFile ? avatarFile.name : 'নির্বাচিত হয়নি'} | মিডিয়া: ${mediaFiles.length}টি${mediaNames ? ` (${mediaNames}${extraText})` : ''}`;
    }

    async function handleReviewSubmit(event) {
      event.preventDefault();

      const form = event.currentTarget;
      const submitBtn = form.querySelector('.review-submit-primary-btn');

      const name = document.getElementById('reviewUserName')?.value.trim() || '';
      const workInfo = document.getElementById('reviewWorkInfo')?.value.trim() || '';
      const comment = document.getElementById('reviewUserComment')?.value.trim() || '';
      const rating = Number(document.getElementById('reviewUserRating')?.value || '0');
      const avatarInput = document.getElementById('reviewUserAvatar');
      const mediaInput = document.getElementById('reviewUserMedia');

      const avatarFile = avatarInput?.files?.[0] || null;
      const mediaFiles = Array.from(mediaInput?.files || []);

      if (!name || !workInfo || !comment) {
        showToast('⚠️ অপূর্ণ তথ্য', 'নাম, কাজের তথ্য ও রিভিউ লিখতে হবে।');
        return;
      }

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        showToast('⚠️ ভুল রেটিং', 'রেটিং শুধু ১, ২, ৩, ৪ বা ৫ হতে পারবে।');
        return;
      }

      if (!avatarFile) {
        showToast('⚠️ প্রোফাইল ছবি লাগবে', 'রিভিউ submit করতে একটি profile photo দিন।');
        return;
      }

      if (!avatarFile.type.startsWith('image/')) {
        showToast('⚠️ ভুল প্রোফাইল ফাইল', 'প্রোফাইল হিসেবে image file দিন।');
        return;
      }

      if (avatarFile.size > 2 * 1024 * 1024) {
        showToast('⚠️ প্রোফাইল ফাইল বড়', 'Profile photo 2MB এর মধ্যে দিন।');
        return;
      }

      if (!mediaFiles.length) {
        showToast('⚠️ মিডিয়া দিন', 'কাজের অন্তত ১টি ছবি বা ভিডিও দিন।');
        return;
      }

      if (mediaFiles.length > 6) {
        showToast('⚠️ অতিরিক্ত ফাইল', 'সর্বোচ্চ ৬টি image/video দেয়া যাবে।');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'সাবমিট হচ্ছে...';
      }

      try {
        const avatar = await readFileAsDataUrl(avatarFile);
        const media = [];

        for (const file of mediaFiles) {
          // eslint-disable-next-line no-await-in-loop
          media.push(await toMediaPayload(file));
        }

        const pendingReviews = safeParseArray(localStorage.getItem(REVIEW_PENDING_STORAGE_KEY));
        const newReview = {
          id: `review-${Date.now()}`,
          name,
          work: workInfo,
          comment,
          rating,
          avatar,
          media,
          approved: false,
          selected: false,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        pendingReviews.unshift(newReview);
        localStorage.setItem(REVIEW_PENDING_STORAGE_KEY, JSON.stringify(pendingReviews));

        form.reset();
        updateReviewFileMeta();
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
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'রিভিউ সাবমিট করুন';
        }
      }
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

      openBtns.forEach(btn => btn.addEventListener('click', openReviewModal));
      if (closeBtn) closeBtn.addEventListener('click', closeReviewModal);
      if (cancelBtn) cancelBtn.addEventListener('click', closeReviewModal);

      if (overlay) {
        overlay.addEventListener('click', event => {
          if (event.target === overlay) closeReviewModal();
        });
      }

      document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        if (overlay?.classList.contains('open')) closeReviewModal();
      });

      if (avatarInput) avatarInput.addEventListener('change', updateReviewFileMeta);
      if (mediaInput) mediaInput.addEventListener('change', updateReviewFileMeta);
      if (form) form.addEventListener('submit', handleReviewSubmit);
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

    // ─── GALLERY SYSTEM ──────────────────────────────────────────────────────────
    const CAT_LABELS = { car: 'প্রাইভেট কার', bike: 'মোটরসাইকেল', repair: 'রিপেয়ার' };
    const CAT_ICONS = { car: '🚗', bike: '🏍️', repair: '🔧' };

    const DEFAULT_GALLERY = [
      { id: 'G1', title: 'প্রাইভেট কার ডিজাইন 01', cat: 'car', img: 'assets/images/cars/1.jpeg', desc: 'কার সিট কভার ডিজাইন' },
      { id: 'G2', title: 'প্রাইভেট কার ডিজাইন 02', cat: 'car', img: 'assets/images/cars/2.jpeg', desc: 'কার সিট কভার ডিজাইন' },
      { id: 'G3', title: 'প্রাইভেট কার ডিজাইন 03', cat: 'car', img: 'assets/images/cars/3.jpeg', desc: 'কার সিট কভার ডিজাইন' },
      { id: 'G4', title: 'প্রাইভেট কার ডিজাইন 04', cat: 'car', img: 'assets/images/cars/4.jpeg', desc: 'কার সিট কভার ডিজাইন' },
      { id: 'G5', title: 'প্রাইভেট কার ডিজাইন 05', cat: 'car', img: 'assets/images/cars/5.jpeg', desc: 'কার সিট কভার ডিজাইন' },
      { id: 'G6', title: 'প্রাইভেট কার ডিজাইন 06', cat: 'car', img: 'assets/images/cars/6.jpeg', desc: 'কার সিট কভার ডিজাইন' },
      { id: 'G7', title: 'প্রাইভেট কার ডিজাইন 07', cat: 'car', img: 'assets/images/cars/7.jpeg', desc: 'কার সিট কভার ডিজাইন' },
      { id: 'G8', title: 'প্রাইভেট কার ডিজাইন 08', cat: 'car', img: 'assets/images/cars/8.jpeg', desc: 'কার সিট কভার ডিজাইন' },
      { id: 'G9', title: 'প্রাইভেট কার ডিজাইন 09', cat: 'car', img: 'assets/images/cars/9.jpeg', desc: 'কার সিট কভার ডিজাইন' },
      { id: 'G10', title: 'প্রাইভেট কার ডিজাইন 10', cat: 'car', img: 'assets/images/cars/10.jpeg', desc: 'কার সিট কভার ডিজাইন' },
      { id: 'G11', title: 'মোটরসাইকেল ডিজাইন 01', cat: 'bike', img: 'assets/images/bikes/11.jpeg', desc: 'মোটরসাইকেল সিট কভার ডিজাইন' },
      { id: 'G12', title: 'মোটরসাইকেল ডিজাইন 02', cat: 'bike', img: 'assets/images/bikes/12.jpeg', desc: 'মোটরসাইকেল সিট কভার ডিজাইন' },
      { id: 'G13', title: 'মোটরসাইকেল ডিজাইন 03', cat: 'bike', img: 'assets/images/bikes/13.jpeg', desc: 'মোটরসাইকেল সিট কভার ডিজাইন' },
      { id: 'G14', title: 'মোটরসাইকেল ডিজাইন 04', cat: 'bike', img: 'assets/images/bikes/14.jpeg', desc: 'মোটরসাইকেল সিট কভার ডিজাইন' },
      { id: 'G15', title: 'রিপেয়ার ডিজাইন 01', cat: 'repair', img: 'assets/images/others/15.jpeg', desc: 'রিপেয়ার ও রিফিনিশ কাজ' },
      { id: 'G16', title: 'রিপেয়ার ডিজাইন 02', cat: 'repair', img: 'assets/images/others/16.jpeg', desc: 'রিপেয়ার ও রিফিনিশ কাজ' },
      { id: 'G17', title: 'রিপেয়ার ডিজাইন 03', cat: 'repair', img: 'assets/images/others/17.jpeg', desc: 'রিপেয়ার ও রিফিনিশ কাজ' },
    ];

    let allGallery = [];
    let galleryFilter = 'all';
    let lightboxItems = [];
    let lightboxIdx = 0;
    let galleryResizeFrame = 0;
    let galleryMotionRaf = 0;
    let galleryMotionLastTs = 0;
    let galleryMotionOffset = 0;
    let galleryMotionCycle = 0;
    let galleryHovered = false;
    let galleryDragging = false;
    let galleryDragMoved = false;
    let galleryPointerDown = false;
    let galleryPointerId = null;
    let galleryDragStartX = 0;
    let galleryDragStartOffset = 0;
    let gallerySuppressClick = false;
    const galleryMotionSpeed = 34;

    function loadGallery() {
      const stored = localStorage.getItem('ac_gallery');
      try {
        const parsed = stored ? JSON.parse(stored) : DEFAULT_GALLERY;
        const hasStoredImages = Array.isArray(parsed) && parsed.some(item => item && typeof item.img === 'string' && item.img.trim());
        allGallery = hasStoredImages ? parsed : DEFAULT_GALLERY;
      }
      catch { allGallery = DEFAULT_GALLERY; }
      renderGallery();
    }

    function filterGallery(cat, btn) {
      galleryFilter = cat;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGallery();
    }

    function getFilteredGallery() {
      return galleryFilter === 'all'
        ? allGallery
        : allGallery.filter(g => g.cat === galleryFilter);
    }

    function renderGallery() {
      const filtered = getFilteredGallery();
      lightboxItems = filtered;

      const grid = document.getElementById('galleryGrid');

      if (!filtered.length) {
        grid.innerHTML = `<div class="gallery-empty">
      <span class="gallery-empty-icon">📷</span>
      <p>এই ক্যাটাগরিতে কোনো ছবি নেই।</p>
    </div>`;
        updateGalleryCount(0);
        return;
      }

      const primaryGroup = `<div class="gallery-marquee-group">${filtered.map((g, i) => galleryCard(g, i)).join('')}</div>`;
      const duplicateGroup = filtered.length > 1
        ? `<div class="gallery-marquee-group" aria-hidden="true">${filtered.map((g, i) => galleryCard(g, i)).join('')}</div>`
        : '';

      grid.innerHTML = `<div class="gallery-marquee-shell">
      <div class="gallery-marquee-viewport">
        <div class="gallery-marquee-track" id="galleryMarqueeTrack">
          ${primaryGroup}
          ${duplicateGroup}
        </div>
      </div>
    </div>`;

      updateGalleryCount(filtered.length);
      syncGalleryMarquee();
    }

    function updateGalleryCount(total) {
      document.getElementById('galleryTotalCount').textContent = total;
      updateGalleryViewAllLink();
    }

    function updateGalleryViewAllLink() {
      const viewAllBtn = document.getElementById('galleryViewAllBtn');
      if (!viewAllBtn) return;
      viewAllBtn.href = `gallery-all.html?cat=${encodeURIComponent(galleryFilter)}`;
    }

    function destroyGalleryMotion() {
      cancelAnimationFrame(galleryMotionRaf);
      galleryMotionRaf = 0;
      galleryMotionLastTs = 0;
    }

    function syncGalleryMarquee() {
      const track = document.getElementById('galleryMarqueeTrack');
      destroyGalleryMotion();
      if (!track) return;

      const groups = track.querySelectorAll('.gallery-marquee-group');
      if (groups.length < 2 || lightboxItems.length < 2) {
        galleryMotionCycle = 0;
        galleryMotionOffset = 0;
        bindGalleryInteractions();
        applyGalleryOffset();
        return;
      }

      const computed = getComputedStyle(track);
      const gap = parseFloat(computed.gap || computed.columnGap || 18) || 18;
      const groupWidth = groups[0].scrollWidth;
      galleryMotionCycle = groupWidth + gap;
      galleryMotionOffset = normalizeGalleryOffset(galleryMotionOffset);
      bindGalleryInteractions();
      applyGalleryOffset();
      startGalleryMotion();
    }

    function normalizeGalleryOffset(offset) {
      if (!galleryMotionCycle) return 0;
      let next = offset % galleryMotionCycle;
      if (next < 0) next += galleryMotionCycle;
      return next;
    }

    function applyGalleryOffset() {
      const track = document.getElementById('galleryMarqueeTrack');
      if (!track) return;
      track.style.transform = `translate3d(${-galleryMotionOffset}px, 0, 0)`;
    }

    function startGalleryMotion() {
      if (!galleryMotionCycle || galleryMotionRaf) return;

      const step = (ts) => {
        if (!galleryMotionLastTs) galleryMotionLastTs = ts;
        const delta = (ts - galleryMotionLastTs) / 1000;
        galleryMotionLastTs = ts;

        if (!galleryHovered && !galleryDragging) {
          galleryMotionOffset = normalizeGalleryOffset(galleryMotionOffset + (galleryMotionSpeed * delta));
          applyGalleryOffset();
        }

        galleryMotionRaf = requestAnimationFrame(step);
      };

      galleryMotionRaf = requestAnimationFrame(step);
    }

    function bindGalleryInteractions() {
      const shell = document.querySelector('.gallery-marquee-shell');
      const viewport = document.querySelector('.gallery-marquee-viewport');
      if (!shell || !viewport) return;

      const endDrag = (event) => {
        const hadDrag = galleryDragging && galleryDragMoved;

        if (event && galleryDragging && viewport.hasPointerCapture && viewport.hasPointerCapture(event.pointerId)) {
          viewport.releasePointerCapture(event.pointerId);
        }

        galleryPointerDown = false;
        galleryPointerId = null;

        if (galleryDragging) {
          galleryDragging = false;
          shell.classList.remove('is-dragging');
        }

        if (hadDrag) {
          gallerySuppressClick = true;
          setTimeout(() => { gallerySuppressClick = false; }, 220);
        }

        galleryDragMoved = false;
        if (!viewport.matches(':hover')) galleryHovered = false;
      };

      viewport.onpointerenter = () => {
        galleryHovered = true;
      };

      viewport.onpointerleave = () => {
        if (!galleryDragging) galleryHovered = false;
      };

      viewport.onpointerdown = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        galleryPointerDown = true;
        galleryPointerId = event.pointerId;
        galleryDragging = false;
        galleryDragMoved = false;
        galleryHovered = true;
        galleryDragStartX = event.clientX;
        galleryDragStartOffset = galleryMotionOffset;
      };

      viewport.onpointermove = (event) => {
        if (!galleryPointerDown || event.pointerId !== galleryPointerId) return;
        const deltaX = event.clientX - galleryDragStartX;

        if (!galleryDragging) {
          if (Math.abs(deltaX) <= 6) return;
          galleryDragging = true;
          galleryDragMoved = true;
          shell.classList.add('is-dragging');
          viewport.setPointerCapture(event.pointerId);
        }

        event.preventDefault();
        galleryMotionOffset = normalizeGalleryOffset(galleryDragStartOffset - deltaX);
        applyGalleryOffset();
      };

      viewport.onpointerup = (event) => endDrag(event);
      viewport.onpointercancel = (event) => endDrag(event);
      viewport.onlostpointercapture = (event) => endDrag(event);
      viewport.ondragstart = () => false;
    }

    function galleryCard(g, idx) {
      const catLabel = CAT_LABELS[g.cat] || g.cat;
      const catIcon = CAT_ICONS[g.cat] || '📷';
      const inner = g.img
        ? `<img class="gallery-item-img" src="${g.img}" alt="${g.title}" loading="lazy" decoding="async" onload="this.parentElement.querySelector('.gallery-item-placeholder').style.display='none'" onerror="this.parentElement.querySelector('.gallery-item-placeholder').style.display='flex';this.style.display='none'">`
        : '';
      const placeholder = `<div class="gallery-item-placeholder">
      <span class="gallery-item-placeholder-icon">${catIcon}</span>
      <span class="gallery-item-placeholder-label">${catLabel}</span>
    </div>`;

      return `<div class="gallery-item" data-cat="${g.cat}" data-idx="${idx}" onclick="openLightbox(${idx})">
    ${inner}
    ${placeholder}
    <div class="gallery-overlay">
      <div class="gallery-overlay-zoom">🔍</div>
      <div class="gallery-overlay-cat">${catLabel}</div>
      <div class="gallery-overlay-title">${g.title}</div>
      <div class="gallery-overlay-desc">${g.desc || 'ডিটেইল দেখতে ক্লিক করুন'}</div>
    </div>
  </div>`;
    }

    function openLightbox(idx) {
      if (gallerySuppressClick) return;
      lightboxIdx = idx;
      renderLightbox();
      document.getElementById('lightboxOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox(e) {
      if (e && e.target !== document.getElementById('lightboxOverlay') && !e.currentTarget.classList.contains('lightbox-close-btn')) return;
      document.getElementById('lightboxOverlay').classList.remove('open');
      document.body.style.overflow = '';
    }

    function lightboxNav(dir) {
      if (!lightboxItems.length) return;
      lightboxIdx = (lightboxIdx + dir + lightboxItems.length) % lightboxItems.length;
      renderLightbox();
    }

    function renderLightbox() {
      const g = lightboxItems[lightboxIdx];
      if (!g) return;

      const catLabel = CAT_LABELS[g.cat] || g.cat;
      document.getElementById('lightboxCat').textContent = catLabel;
      document.getElementById('lightboxTitle').textContent = g.title;
      document.getElementById('lightboxCounter').textContent = `${lightboxIdx + 1} / ${lightboxItems.length}`;

      const wrap = document.getElementById('lightboxImgWrap');
      if (g.img) {
        wrap.innerHTML = `<img src="${g.img}" alt="${g.title}" onerror="this.outerHTML='<div class=\\'lightbox-placeholder-full\\'><span>${CAT_ICONS[g.cat] || '📷'}</span><small style=\\'font-size:14px;color:var(--cream-dim)\\'>${g.title}</small></div>'">`;
      } else {
        const icon = CAT_ICONS[g.cat] || '📷';
        wrap.innerHTML = `<div class="lightbox-placeholder-full">
      <span>${icon}</span>
      <small style="font-size:14px;color:var(--cream-dim)">${g.title}</small>
    </div>`;
      }
    }

    document.addEventListener('keydown', e => {
      if (document.getElementById('sampleConfirmModal').classList.contains('open') && e.key === 'Escape') {
        closeSampleConfirmModal();
        return;
      }

      const reviewPreviewOpen = document.getElementById('reviewMediaPreviewOverlay')?.classList.contains('open');
      if (reviewPreviewOpen) {
        if (e.key === 'ArrowRight') navReviewMediaPreview(+1);
        if (e.key === 'ArrowLeft') navReviewMediaPreview(-1);
        if (e.key.toLowerCase() === 'f') requestReviewPreviewFullscreen();
        if (e.key === 'Escape') closeReviewMediaPreview();
        return;
      }

      if (!document.getElementById('lightboxOverlay').classList.contains('open')) return;
      if (e.key === 'ArrowRight') lightboxNav(+1);
      if (e.key === 'ArrowLeft') lightboxNav(-1);
      if (e.key === 'Escape') {
        document.getElementById('lightboxOverlay').classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    window.addEventListener('resize', () => {
      cancelAnimationFrame(galleryResizeFrame);
      galleryResizeFrame = requestAnimationFrame(syncGalleryMarquee);
    });

    window.addEventListener('load', syncGalleryMarquee);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncGalleryMarquee);
    }

    // ─── TOAST ───────────────────────────────────────────────────────────────────
    function showToast(title, msg, duration = 4000) {
      const t = document.getElementById('toast');
      document.getElementById('toastTitle').textContent = title;
      document.getElementById('toastMsg').textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), duration);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SAMPLE SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════════

    // Default demo samples — loaded if admin has not added any yet
    const DEFAULT_SAMPLES = [
      // ── REXINE ──
      { id: 'RX-001', name: 'ডায়মন্ড কোয়িল্ট', material: 'rexine', color: 'কালো', hex: '#1a1a1a', available: true, note: 'সবচেয়ে জনপ্রিয় ডিজাইন। টেকসই ও পরিষ্কার করা সহজ।', img: '' },
      { id: 'RX-002', name: 'স্ট্রাইপ প্যাটার্ন', material: 'rexine', color: 'বাদামি-কালো', hex: '#3d2010', available: true, note: 'ক্লাসিক স্ট্রাইপ ডিজাইন, দীর্ঘস্থায়ী।', img: '' },
      { id: 'RX-003', name: 'প্লেইন ম্যাট', material: 'rexine', color: 'নেভি ব্লু', hex: '#1a2a4a', available: true, note: 'সিম্পল ও এলিগেন্ট। অফিসের গাড়ির জন্য উপযুক্ত।', img: '' },
      { id: 'RX-004', name: 'হানিকম্ব টেক্সচার', material: 'rexine', color: 'ধূসর', hex: '#4a4a4a', available: true, note: 'হেক্সাগোনাল প্যাটার্ন, স্পোর্টি লুক।', img: '' },
      { id: 'RX-005', name: 'ক্লাসিক পাঞ্চ', material: 'rexine', color: 'লাল-কালো', hex: '#6b0f0f', available: true, note: 'পাঞ্চড ডিজাইন, বায়ু চলাচল ভালো।', img: '' },
      { id: 'RX-006', name: 'বাক্স কোয়িল্ট', material: 'rexine', color: 'বেইজ', hex: '#c4a882', available: true, note: 'লাক্সারি বক্স কোয়িল্ট, গাড়ির ভেতর প্রিমিয়াম ফিল।', img: '' },
      { id: 'RX-007', name: 'ডবল স্টিচ লাইন', material: 'rexine', color: 'সাদা-ধূসর', hex: '#d0d0d0', available: true, note: 'দুই রঙের সেলাই, মডার্ন লুক।', img: '' },
      { id: 'RX-008', name: 'স্পোর্ট মেশ', material: 'rexine', color: 'কমলা-কালো', hex: '#c45010', available: false, note: 'স্টক শেষ। শীঘ্রই আসছে।', img: '' },
      // ── LEATHER ──
      { id: 'LT-001', name: 'স্মুথ ফুল লেদার', material: 'leather', color: 'কালো', hex: '#0d0d0d', available: true, note: 'খাঁটি নরম লেদার। প্রিমিয়াম গাড়ির জন্য পারফেক্ট।', img: '' },
      { id: 'LT-002', name: 'টেক্সচার্ড লেদার', material: 'leather', color: 'গাঢ় বাদামি', hex: '#3b1f0a', available: true, note: 'টেক্সচার্ড ফিনিশ, দীর্ঘস্থায়ী ও স্ক্র্যাচ-রেজিস্ট্যান্ট।', img: '' },
      { id: 'LT-003', name: 'পার্ফোরেটেড লেদার', material: 'leather', color: 'ধূসর', hex: '#5a5a5a', available: true, note: 'ছিদ্রযুক্ত লেদার — বায়ু চলাচল ও স্টাইল দুটোই।', img: '' },
      { id: 'LT-004', name: 'নাপা সফট লেদার', material: 'leather', color: 'আইভরি ক্রিম', hex: '#e8dbc8', available: true, note: 'অত্যন্ত নরম নাপা লেদার, উচ্চমানের ফিনিশ।', img: '' },
    ];

    const SAMPLE_MATERIAL_LABELS = { all: 'সব', rexine: 'রেক্সিন', leather: 'লেদার' };
    const HOME_SAMPLE_LIMITS = { rexine: 5, leather: 5 };

    // State
    let allSamples = [];
    let currentFilter = 'all';
    let currentSearch = '';
    let selectedSample = null;
    let modalSample = null;

    function normalizeSampleMaterial(value) {
      const raw = String(value || '').trim().toLowerCase();
      if (raw.includes('leather') || raw.includes('চামড়') || raw.includes('চামড়া') || raw.includes('লেদার')) return 'leather';
      return 'rexine';
    }

    function normalizeSampleItem(sample, index) {
      const material = normalizeSampleMaterial(sample.material);
      const fallbackPrefix = material === 'rexine' ? 'RX' : 'LT';
      return {
        ...sample,
        id: String(sample.id || `${fallbackPrefix}-${String(index + 1).padStart(3, '0')}`),
        name: sample.name || `${material === 'rexine' ? 'রেক্সিন' : 'লেদার'} স্যাম্পল`,
        material,
        color: sample.color || 'রং উল্লেখ নেই',
        hex: sample.hex || (material === 'rexine' ? '#3d2010' : '#3b1f0a'),
        available: sample.available !== false,
        img: typeof sample.img === 'string' ? sample.img.trim() : '',
        note: typeof sample.note === 'string' ? sample.note.trim() : '',
      };
    }

    function isHomeFeaturedSample(sample) {
      return ['featured', 'showOnHome', 'home', 'isFeatured', 'popular', 'bestSeller', 'topSeller', 'homeFeatured']
        .some(key => {
          const value = sample[key];
          return value === true || value === 1 || value === '1' || value === 'true' || value === 'yes';
        });
    }

    function getSampleHomeSortOrder(sample) {
      const sortableValue = [sample.homeOrder, sample.featuredOrder, sample.sortOrder, sample.order]
        .map(value => Number(value))
        .find(value => Number.isFinite(value));
      return Number.isFinite(sortableValue) ? sortableValue : Number.MAX_SAFE_INTEGER;
    }

    function getHomeMaterialSamples(material) {
      const scoped = allSamples
        .filter(sample => sample.material === material)
        .sort((a, b) => {
          const featuredDiff = Number(isHomeFeaturedSample(a)) === Number(isHomeFeaturedSample(b))
            ? 0
            : (isHomeFeaturedSample(a) ? -1 : 1);
          if (featuredDiff) return featuredDiff;

          const availableDiff = Number(a.available === false) - Number(b.available === false);
          if (availableDiff) return availableDiff;

          const orderDiff = getSampleHomeSortOrder(a) - getSampleHomeSortOrder(b);
          if (orderDiff) return orderDiff;

          return a.id.localeCompare(b.id, 'en');
        });

      return scoped.slice(0, HOME_SAMPLE_LIMITS[material] || 5);
    }

    function injectSelectedHomeSample(items) {
      if (!selectedSample) return items;
      if (currentFilter !== 'all' && selectedSample.material !== currentFilter) return items;
      if (items.some(item => item.id === selectedSample.id)) return items;
      if (!items.length) return [selectedSample];
      return [selectedSample, ...items.slice(0, items.length - 1)];
    }

    function updateSamplesOverview(totalShown) {
      const countEl = document.getElementById('samplesCountInfo');
      const viewAllBtn = document.getElementById('samplesViewAllBtn');
      if (countEl) {
        countEl.textContent = currentFilter === 'all'
          ? `হোমপেজে বাছাই করা ${totalShown}টি স্যাম্পল`
          : `${SAMPLE_MATERIAL_LABELS[currentFilter]} থেকে ${totalShown}টি বাছাই করা স্যাম্পল`;
      }
      if (viewAllBtn) {
        viewAllBtn.href = `samples-all.html?material=${encodeURIComponent(currentFilter)}`;
      }
    }

    function clearPendingSampleParams() {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('sample')) return;
      url.searchParams.delete('sample');
      const nextQuery = url.searchParams.toString();
      history.replaceState(null, '', `${url.pathname}${nextQuery ? `?${nextQuery}` : ''}${url.hash}`);
    }

    function applyPendingSampleSelection() {
      const params = new URLSearchParams(window.location.search);
      const pendingId = params.get('sample') || localStorage.getItem('ac_selected_sample_id') || '';
      if (!pendingId) return;

      localStorage.removeItem('ac_selected_sample_id');
      clearPendingSampleParams();

      const pendingSample = allSamples.find(sample => sample.id === pendingId);
      if (!pendingSample || !pendingSample.available) return;
      selectSample(pendingSample.id);
    }

    // Load samples from admin localStorage, fallback to defaults
    function loadSamples() {
      const stored = localStorage.getItem('ac_samples');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const items = Array.isArray(parsed) ? parsed.map(normalizeSampleItem) : [];
          allSamples = items.length ? items : DEFAULT_SAMPLES.map(normalizeSampleItem);
        } catch {
          allSamples = DEFAULT_SAMPLES.map(normalizeSampleItem);
        }
      } else {
        allSamples = DEFAULT_SAMPLES.map(normalizeSampleItem);
      }
      renderSamples();
      applyPendingSampleSelection();
    }

    // Filter + home selection
    function getFilteredSamples() {
      const baseSamples = currentFilter === 'all'
        ? [...getHomeMaterialSamples('rexine'), ...getHomeMaterialSamples('leather')]
        : getHomeMaterialSamples(currentFilter);

      return injectSelectedHomeSample(baseSamples);
    }

    function filterSamples(f, btn) {
      currentFilter = f;
      document.querySelectorAll('.sample-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSamples();
    }

    // Render sample cards
    function renderSamples() {
      const grid = document.getElementById('samplesGrid');
      const filtered = getFilteredSamples();
      updateSamplesOverview(filtered.length);

      if (filtered.length === 0) {
        grid.innerHTML = `<div class="samples-empty">
      <span class="samples-empty-icon">🔍</span>
      <p>কোনো স্যাম্পল পাওয়া যায়নি।</p>
    </div>`;
        return;
      }

      grid.innerHTML = filtered.map(s => {
        const isSelected = selectedSample && selectedSample.id === s.id;
        const matTag = s.material === 'rexine'
          ? '<span class="sample-card-material-tag tag-rexine">রেক্সিন</span>'
          : '<span class="sample-card-material-tag tag-leather">লেদার</span>';

        const swatchContent = s.img
          ? `<img src="${s.img}" alt="${s.name}" loading="lazy" decoding="async" onerror="this.remove()">
         <span class="swatch-no-img">${s.material === 'rexine' ? '🪡' : '🧥'}</span>`
          : `<span class="swatch-no-img">${s.material === 'rexine' ? '🪡' : '🧥'}</span>`;

        return `
    <div class="sample-card ${isSelected ? 'selected' : ''} ${!s.available ? 'out-of-stock' : ''}"
         onclick="${s.available ? `openSampleModal('${s.id}')` : 'return'}">
      <div class="sample-card-swatch" style="background-color: ${s.hex};">
        ${swatchContent}
        <div class="sample-card-selected-badge">✓</div>
        ${!s.available ? '<div class="sample-card-stock-badge">স্টক নেই</div>' : ''}
      </div>
      <div class="sample-card-body">
        <div class="sample-card-id">
          <span>${s.id}</span>
          ${matTag}
        </div>
        <div class="sample-card-name">${s.name}</div>
        <div class="sample-card-color-row">
          <div class="sample-card-color-dot" style="background:${s.hex}"></div>
          <span class="sample-card-color-name">${s.color}</span>
        </div>
        <button class="sample-card-order-btn" onclick="event.stopPropagation(); ${s.available ? `selectSample('${s.id}')` : 'return'}">
          ${isSelected ? '✓ নির্বাচিত' : (s.available ? '+ অর্ডারে যোগ করুন' : 'স্টক নেই')}
        </button>
      </div>
    </div>`;
      }).join('');
    }

    // Open sample detail modal
    function openSampleModal(id) {
      const s = allSamples.find(x => x.id === id);
      if (!s) return;
      modalSample = s;

      document.getElementById('sampleModalId').textContent = 'Sample ID: ' + s.id;
      document.getElementById('sampleModalIdVal').textContent = s.id;
      document.getElementById('sampleModalName').textContent = s.name;
      document.getElementById('sampleModalMaterial').textContent = s.material === 'rexine' ? 'রেক্সিন (Rexine)' : 'চামড়া (Leather)';
      document.getElementById('sampleModalColorDot').style.background = s.hex;
      document.getElementById('sampleModalColorName').textContent = s.color;
      document.getElementById('sampleModalStock').innerHTML = s.available
        ? '<span style="color:#2ecc71">✅ উপলব্ধ</span>'
        : '<span style="color:#e74c3c">❌ স্টক নেই</span>';

      const noteEl = document.getElementById('sampleModalNote');
      if (s.note) { noteEl.textContent = s.note; noteEl.style.display = ''; }
      else { noteEl.style.display = 'none'; }

      // Swatch
      const swatchEl = document.getElementById('sampleModalSwatch');
      swatchEl.style.backgroundColor = s.hex;
      const imgEl = document.getElementById('sampleModalImg');
      imgEl.src = s.img || '';
      imgEl.style.display = s.img ? '' : 'none';
      document.getElementById('sampleModalSwatchFallback').textContent = s.material === 'rexine' ? '🪡' : '🧥';

      // Order button
      const btn = document.getElementById('sampleModalOrderBtn');
      if (!s.available) {
        btn.textContent = '❌ স্টক নেই';
        btn.style.opacity = '0.4';
        btn.style.pointerEvents = 'none';
      } else {
        const alreadySelected = selectedSample && selectedSample.id === s.id;
        btn.innerHTML = alreadySelected ? '✓ ইতোমধ্যে নির্বাচিত — অর্ডারে যান' : '✅ এই স্যাম্পল নির্বাচন করুন';
        btn.style.opacity = '';
        btn.style.pointerEvents = '';
      }

      document.getElementById('sampleModal').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeSampleModal() {
      document.getElementById('sampleModal').classList.remove('open');
      document.body.style.overflow = '';
    }
    document.getElementById('sampleModal').addEventListener('click', function (e) {
      if (e.target === this) closeSampleModal();
    });

    function selectFromModal() {
      if (!modalSample) return;
      selectSample(modalSample.id);
      closeSampleModal();
      // Smooth scroll to order form
      setTimeout(() => {
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }

    // Select a sample — sets global state + updates UI
    function selectSample(id) {
      const s = allSamples.find(x => x.id === id);
      if (!s || !s.available) return;
      selectedSample = s;

      // Update the floating top bar
      const bar = document.getElementById('selectedSampleBar');
      document.getElementById('selectedBarSwatch').style.background = s.hex;
      document.getElementById('selectedBarName').textContent = `${s.id} — ${s.name}`;
      document.getElementById('selectedBarMeta').textContent =
        `${s.material === 'rexine' ? 'রেক্সিন' : 'লেদার'} · ${s.color}`;
      bar.classList.add('visible');

      // Update order form
      document.getElementById('selectedSampleId').value = s.id;
      const strip = document.getElementById('formSampleStrip');
      document.getElementById('formSwatchDot').style.background = s.hex;
      document.getElementById('formSampleLabel').textContent =
        `${s.id} — ${s.name} (${s.material === 'rexine' ? 'রেক্সিন' : 'লেদার'}, ${s.color})`;
      strip.style.display = 'flex';

      // Auto-set material dropdown
      const matSel = document.getElementById('material');
      matSel.value = s.material === 'rexine' ? 'রেক্সিন (Rexine)' : 'চামড়া (Leather)';

      // Re-render cards to show selection
      renderSamples();

      showToast('✅ স্যাম্পল নির্বাচিত!', `${s.id} — ${s.name} নির্বাচন হয়েছে। এখন অর্ডার ফর্ম পূরণ করুন।`, 4000);
    }

    function clearSelectedSample() {
      selectedSample = null;
      document.getElementById('selectedSampleBar').classList.remove('visible');
      document.getElementById('selectedSampleId').value = '';
      document.getElementById('formSampleStrip').style.display = 'none';
      renderSamples();
    }

    function scrollToOrder() {
      setTimeout(() => {
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    function openSampleConfirmModal() {
      document.getElementById('sampleConfirmModal').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeSampleConfirmModal() {
      document.getElementById('sampleConfirmModal').classList.remove('open');
      document.body.style.overflow = '';
    }

    function goChooseSample() {
      closeSampleConfirmModal();
      setTimeout(() => {
        document.getElementById('samples').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      showToast('🪡 একটি স্যাম্পল বেছে নিন', 'Sample ID নির্বাচন করলে আমরা ডিজাইন, রং ও মূল্যের বিষয়ে আরও দ্রুত সাহায্য করতে পারব।', 5000);
    }

    function confirmSubmitWithoutSample() {
      closeSampleConfirmModal();
      submitOrder(true);
    }

    document.getElementById('sampleConfirmModal').addEventListener('click', function (event) {
      if (event.target === this) closeSampleConfirmModal();
    });

    // ─── SUBMIT ORDER ─────────────────────────────────────────────────────────────
    function submitOrder(skipSampleConfirmation = false) {
      const name = document.getElementById('custName').value.trim();
      const phone = document.getElementById('custPhone').value.trim();
      const vehicle = document.getElementById('vehicleType').value;
      const service = document.getElementById('serviceType').value;

      if (!name || !phone || !vehicle || !service) {
        showToast('⚠️ অপূর্ণ তথ্য', 'নাম, ফোন, গাড়ির ধরন ও সার্ভিস অবশ্যই পূরণ করুন।');
        return;
      }

      const sampleId = document.getElementById('selectedSampleId').value;

      if (!sampleId && !skipSampleConfirmation) {
        openSampleConfirmModal();
        return;
      }

      const order = {
        id: 'ORD-' + Date.now(),
        name, phone,
        vehicle,
        carModel: document.getElementById('carModel').value,
        service,
        material: document.getElementById('material').value,
        sampleId: sampleId || null,
        sampleName: sampleId ? (allSamples.find(s => s.id === sampleId)?.name || '') : '',
        details: document.getElementById('orderDetails').value,
        status: 'pending',
        date: new Date().toLocaleDateString('bn-BD'),
        dateISO: new Date().toISOString()
      };

      const orders = JSON.parse(localStorage.getItem('ac_orders') || '[]');
      orders.unshift(order);
      localStorage.setItem('ac_orders', JSON.stringify(orders));

      // Clear form
      ['custName', 'custPhone', 'carModel', 'orderDetails'].forEach(id => document.getElementById(id).value = '');
      ['vehicleType', 'serviceType', 'material'].forEach(id => document.getElementById(id).selectedIndex = 0);
      clearSelectedSample();

      const sampleMsg = sampleId ? ` স্যাম্পল: ${sampleId}` : '';
      showToast('✅ অর্ডার সফল!', `অর্ডার নম্বর: ${order.id}।${sampleMsg} আমরা শীঘ্রই যোগাযোগ করব।`, 6000);
    }

    // ─── INIT ─────────────────────────────────────────────────────────────────────
    initReviewsModule();
    loadSamples();
    loadGallery();


