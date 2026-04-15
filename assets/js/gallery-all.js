    const CAT_LABELS = { car: 'প্রাইভেট কার', bike: 'মোটরসাইকেল', repair: 'রিপেয়ার', all: 'সব' };
    const CAT_ICONS = { car: '🚗', bike: '🏍️', repair: '🔧' };

    const DEFAULT_GALLERY = [
      { id: 'G1', title: 'প্রাইভেট কার ডিজাইন 01', cat: 'car', img: 'assets/images/cars/1.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Corolla Axio/Fielder'] },
      { id: 'G2', title: 'প্রাইভেট কার ডিজাইন 02', cat: 'car', img: 'assets/images/cars/2.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Aqua Hybrid'] },
      { id: 'G3', title: 'প্রাইভেট কার ডিজাইন 03', cat: 'car', img: 'assets/images/cars/3.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Allion'] },
      { id: 'G4', title: 'প্রাইভেট কার ডিজাইন 04', cat: 'car', img: 'assets/images/cars/4.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Corolla Axio/Fielder'] },
      { id: 'G5', title: 'প্রাইভেট কার ডিজাইন 05', cat: 'car', img: 'assets/images/cars/5.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Premio'] },
      { id: 'G6', title: 'প্রাইভেট কার ডিজাইন 06', cat: 'car', img: 'assets/images/cars/6.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Corolla Axio/Fielder'] },
      { id: 'G7', title: 'প্রাইভেট কার ডিজাইন 07', cat: 'car', img: 'assets/images/cars/7.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Noah'] },
      { id: 'G8', title: 'প্রাইভেট কার ডিজাইন 08', cat: 'car', img: 'assets/images/cars/8.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Aqua Hybrid'] },
      { id: 'G9', title: 'প্রাইভেট কার ডিজাইন 09', cat: 'car', img: 'assets/images/cars/9.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Corolla'] },
      { id: 'G10', title: 'প্রাইভেট কার ডিজাইন 10', cat: 'car', img: 'assets/images/cars/10.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Allion'] },
      { id: 'G11', title: 'মোটরসাইকেল ডিজাইন 01', cat: 'bike', img: 'assets/images/bikes/11.jpeg', desc: 'মোটরসাইকেল সিট কভার ডিজাইন', models: ['Yamaha R15'] },
      { id: 'G12', title: 'মোটরসাইকেল ডিজাইন 02', cat: 'bike', img: 'assets/images/bikes/12.jpeg', desc: 'মোটরসাইকেল সিট কভার ডিজাইন', models: ['Bajaj Pulsar'] },
      { id: 'G13', title: 'মোটরসাইকেল ডিজাইন 03', cat: 'bike', img: 'assets/images/bikes/13.jpeg', desc: 'মোটরসাইকেল সিট কভার ডিজাইন', models: ['Honda Hornet'] },
      { id: 'G14', title: 'মোটরসাইকেল ডিজাইন 04', cat: 'bike', img: 'assets/images/bikes/14.jpeg', desc: 'মোটরসাইকেল সিট কভার ডিজাইন', models: ['Suzuki Gixxer'] },
      { id: 'G15', title: 'রিপেয়ার ডিজাইন 01', cat: 'repair', img: 'assets/images/others/15.jpeg', desc: 'রিপেয়ার ও রিফিনিশ কাজ', models: ['সিট রিপেয়ার'] },
      { id: 'G16', title: 'রিপেয়ার ডিজাইন 02', cat: 'repair', img: 'assets/images/others/16.jpeg', desc: 'রিপেয়ার ও রিফিনিশ কাজ', models: ['ড্যাশবোর্ড রিফিনিশ'] },
      { id: 'G17', title: 'রিপেয়ার ডিজাইন 03', cat: 'repair', img: 'assets/images/others/17.jpeg', desc: 'রিপেয়ার ও রিফিনিশ কাজ', models: ['হোম ফিটিং'] },
    ];

    let allGallery = [];
    let currentFilter = 'all';
    let currentModel = '';
    let currentSearch = '';
    let displayedGalleryItems = [];
    let galleryGroupCountMap = new Map();
    let lightboxItems = [];
    let lightboxIdx = 0;

    function normalizeFilter(value) {
      return ['all', 'car', 'bike', 'repair'].includes(value) ? value : 'all';
    }

    function normalizeModels(item) {
      const fromArray = Array.isArray(item.models) ? item.models : [];
      const fromStrings = [item.model, item.vehicleModel]
        .filter(value => typeof value === 'string' && value.trim())
        .flatMap(value => value.split(/[,;|]+/));

      return [...new Set([...fromArray, ...fromStrings]
        .map(value => String(value).trim())
        .filter(Boolean))];
    }

    function normalizeGalleryItem(item, index) {
      const safeCat = ['car', 'bike', 'repair'].includes(item.cat) ? item.cat : 'car';
      return {
        ...item,
        id: item.id || `G${index + 1}`,
        title: item.title || item.name || `${CAT_LABELS[safeCat]} ডিজাইন ${String(index + 1).padStart(2, '0')}`,
        desc: item.desc || item.description || 'ডিটেইল দেখতে ক্লিক করুন',
        cat: safeCat,
        img: typeof item.img === 'string' ? item.img : '',
        models: normalizeModels(item),
      };
    }

    function getPrimaryModel(item) {
      return Array.isArray(item.models) && item.models.length ? String(item.models[0]).trim() : '';
    }

    function getGroupLabel(item) {
      const explicit = [item.groupLabel, item.galleryGroup, item.groupKey]
        .find(value => typeof value === 'string' && value.trim());
      return explicit ? explicit.trim() : (getPrimaryModel(item) || item.title);
    }

    function getGroupKey(item) {
      return getGroupLabel(item).toLowerCase();
    }

    function buildGroupCountMap(items) {
      const map = new Map();
      items.forEach(item => {
        const key = getGroupKey(item);
        map.set(key, (map.get(key) || 0) + 1);
      });
      return map;
    }

    function getRelatedGroupItems(item) {
      const key = getGroupKey(item);
      const related = allGallery.filter(candidate => candidate.cat === item.cat && getGroupKey(candidate) === key);
      return related.length ? related : [item];
    }

    function getCategoryScopedGallery() {
      return currentFilter === 'all' ? allGallery : allGallery.filter(item => item.cat === currentFilter);
    }

    function getAvailableModels(items) {
      return [...new Set(items.flatMap(item => Array.isArray(item.models) ? item.models : []))]
        .sort((a, b) => a.localeCompare(b, 'bn'));
    }

    function populateModelOptions(items) {
      const select = document.getElementById('catalogModelSelect');
      const models = getAvailableModels(items);

      if (currentModel && !models.includes(currentModel)) {
        currentModel = '';
      }

      select.innerHTML = ['<option value="">সব মডেল</option>', ...models.map(model =>
        `<option value="${model.replace(/"/g, '&quot;')}">${model}</option>`)].join('');
      select.value = currentModel;
    }

    function getSearchText(item) {
      return [
        item.title,
        item.desc,
        CAT_LABELS[item.cat] || item.cat,
        ...(Array.isArray(item.models) ? item.models : []),
      ].join(' ').toLowerCase();
    }

    function syncQueryParams() {
      const params = new URLSearchParams();
      if (currentFilter !== 'all') params.set('cat', currentFilter);
      if (currentModel) params.set('model', currentModel);
      if (currentSearch) params.set('q', currentSearch);
      const query = params.toString();
      history.replaceState(null, '', query ? `gallery-all.html?${query}` : 'gallery-all.html');
    }

    function loadGallery() {
      const stored = localStorage.getItem('ac_gallery');
      try {
        const parsed = stored ? JSON.parse(stored) : DEFAULT_GALLERY;
        const storedItems = Array.isArray(parsed) ? parsed.map(normalizeGalleryItem) : [];
        const hasStoredImages = storedItems.some(item => item.img.trim());
        allGallery = hasStoredImages ? storedItems : DEFAULT_GALLERY.map(normalizeGalleryItem);
      } catch {
        allGallery = DEFAULT_GALLERY.map(normalizeGalleryItem);
      }
      renderGalleryPage();
    }

    function getFilteredGallery() {
      const q = currentSearch.trim().toLowerCase();
      return getCategoryScopedGallery().filter(item => {
        const matchModel = !currentModel || (Array.isArray(item.models) && item.models.includes(currentModel));
        const matchSearch = !q || getSearchText(item).includes(q);
        return matchModel && matchSearch;
      });
    }

    function setFilter(nextFilter) {
      currentFilter = normalizeFilter(nextFilter);
      renderGalleryPage();
    }

    function renderGalleryPage() {
      const grid = document.getElementById('galleryPageGrid');
      const categoryScoped = getCategoryScopedGallery();
      galleryGroupCountMap = buildGroupCountMap(categoryScoped);
      populateModelOptions(categoryScoped);
      const filtered = getFilteredGallery();
      displayedGalleryItems = filtered;
      syncQueryParams();

      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === currentFilter);
      });

      document.getElementById('catalogCurrentLabel').textContent = CAT_LABELS[currentFilter] || 'সব';
      document.getElementById('catalogCount').textContent = filtered.length;

      if (!filtered.length) {
        grid.innerHTML = `<div class="gallery-empty">
          <span class="gallery-empty-icon">📷</span>
          <p>এই ক্যাটাগরিতে এখনো কোনো ডিজাইন যোগ করা হয়নি।</p>
        </div>`;
        return;
      }

      grid.innerHTML = filtered.map((item, idx) => galleryCard(item, idx)).join('');
    }

    function galleryCard(item, idx) {
      const catLabel = CAT_LABELS[item.cat] || item.cat;
      const catIcon = CAT_ICONS[item.cat] || '📷';
      const groupCount = galleryGroupCountMap.get(getGroupKey(item)) || 1;
      const groupBadge = groupCount > 1 ? `<div class="gallery-card-group-badge">${groupCount} ছবি</div>` : '';
      const modelPills = Array.isArray(item.models) && item.models.length
        ? `<div class="gallery-card-models">${item.models.map(model => `<span class="gallery-card-model-pill">${model}</span>`).join('')}</div>`
        : '';
      const imageHtml = item.img
        ? `<img class="gallery-card-img" src="${item.img}" alt="${item.title}" loading="lazy" decoding="async" onload="this.parentElement.querySelector('.gallery-card-placeholder').style.display='none'" onerror="this.parentElement.querySelector('.gallery-card-placeholder').style.display='flex';this.style.display='none'">`
        : '';

      return `<article class="gallery-card" data-cat="${item.cat}" onclick="openLightbox(${idx})">
        ${imageHtml}
        ${groupBadge}
        <div class="gallery-card-placeholder">
          <span class="gallery-card-placeholder-icon">${catIcon}</span>
          <span class="gallery-card-placeholder-label">${catLabel}</span>
        </div>
        <div class="gallery-card-overlay">
          <div class="gallery-card-cat">${catLabel}</div>
          <h3 class="gallery-card-title">${item.title}</h3>
          ${modelPills}
          <p class="gallery-card-desc">${item.desc || 'ডিটেইল দেখতে ক্লিক করুন'}</p>
        </div>
      </article>`;
    }

    function openLightbox(idx) {
      const sourceItem = displayedGalleryItems[idx];
      if (!sourceItem) return;
      lightboxItems = getRelatedGroupItems(sourceItem);
      lightboxIdx = Math.max(0, lightboxItems.findIndex(item => item.id === sourceItem.id));
      renderLightbox();
      document.getElementById('lightboxOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox(event) {
      if (event && event.target !== document.getElementById('lightboxOverlay') && !event.currentTarget.classList.contains('lightbox-close-btn')) return;
      document.getElementById('lightboxOverlay').classList.remove('open');
      document.body.style.overflow = '';
    }

    function lightboxNav(dir) {
      if (!lightboxItems.length) return;
      lightboxIdx = (lightboxIdx + dir + lightboxItems.length) % lightboxItems.length;
      renderLightbox();
    }

    function renderLightbox() {
      const item = lightboxItems[lightboxIdx];
      if (!item) return;

      document.getElementById('lightboxCat').textContent = [CAT_LABELS[item.cat] || item.cat, getGroupLabel(item)].filter(Boolean).join(' · ');
      document.getElementById('lightboxTitle').textContent = item.title;
      document.getElementById('lightboxCounter').textContent = `${lightboxIdx + 1} / ${lightboxItems.length}`;

      const wrap = document.getElementById('lightboxImgWrap');
      if (item.img) {
        wrap.innerHTML = `<img src="${item.img}" alt="${item.title}" onerror="this.outerHTML='<div class=\\'lightbox-placeholder-full\\'><span>${CAT_ICONS[item.cat] || '📷'}</span><small style=\\'font-size:14px;color:var(--cream-dim)\\'>${item.title}</small></div>'">`;
      } else {
        wrap.innerHTML = `<div class="lightbox-placeholder-full">
          <span>${CAT_ICONS[item.cat] || '📷'}</span>
          <small style="font-size:14px;color:var(--cream-dim)">${item.title}</small>
        </div>`;
      }
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });

    document.getElementById('catalogModelSelect').addEventListener('change', (event) => {
      currentModel = event.target.value;
      renderGalleryPage();
    });

    document.getElementById('catalogSearchInput').addEventListener('input', (event) => {
      currentSearch = event.target.value.trim();
      renderGalleryPage();
    });

    document.getElementById('catalogResetBtn').addEventListener('click', () => {
      currentModel = '';
      currentSearch = '';
      document.getElementById('catalogSearchInput').value = '';
      renderGalleryPage();
    });

    document.addEventListener('keydown', (event) => {
      if (!document.getElementById('lightboxOverlay').classList.contains('open')) return;
      if (event.key === 'ArrowRight') lightboxNav(+1);
      if (event.key === 'ArrowLeft') lightboxNav(-1);
      if (event.key === 'Escape') closeLightbox();
    });

    const initialParams = new URLSearchParams(window.location.search);
    currentFilter = normalizeFilter(initialParams.get('cat') || 'all');
    currentModel = initialParams.get('model') || '';
    currentSearch = initialParams.get('q') || '';
    document.getElementById('catalogSearchInput').value = currentSearch;
    loadGallery();
  

