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
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

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
    loadSamples();
    loadGallery();
  

