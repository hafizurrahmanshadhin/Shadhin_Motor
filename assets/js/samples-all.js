/**
 * Samples catalog page controller.
 *
 * Responsibilities:
 * - normalize sample data from localStorage/admin panel
 * - provide filter/search interactions with URL sync
 * - handle accessible modal preview + order handoff
 */
(function () {
  'use strict';

const SAMPLE_LABELS = { all: 'সব', rexine: 'রেক্সিন', leather: 'লেদার' };

const DEFAULT_SAMPLES = [
  { id: 'RX-001', name: 'ডায়মন্ড কোয়িল্ট', material: 'rexine', color: 'কালো', hex: '#1a1a1a', available: true, note: 'সবচেয়ে জনপ্রিয় ডিজাইন। টেকসই ও পরিষ্কার করা সহজ।', img: '', featured: true },
  { id: 'RX-002', name: 'স্ট্রাইপ প্যাটার্ন', material: 'rexine', color: 'বাদামি-কালো', hex: '#3d2010', available: true, note: 'ক্লাসিক স্ট্রাইপ ডিজাইন, দীর্ঘস্থায়ী।', img: '', featured: true },
  { id: 'RX-003', name: 'প্লেইন ম্যাট', material: 'rexine', color: 'নেভি ব্লু', hex: '#1a2a4a', available: true, note: 'সিম্পল ও এলিগেন্ট। অফিসের গাড়ির জন্য উপযুক্ত।', img: '', featured: true },
  { id: 'RX-004', name: 'হানিকম্ব টেক্সচার', material: 'rexine', color: 'ধূসর', hex: '#4a4a4a', available: true, note: 'হেক্সাগোনাল প্যাটার্ন, স্পোর্টি লুক।', img: '' },
  { id: 'RX-005', name: 'ক্লাসিক পাঞ্চ', material: 'rexine', color: 'লাল-কালো', hex: '#6b0f0f', available: true, note: 'পাঞ্চড ডিজাইন, বায়ু চলাচল ভালো।', img: '' },
  { id: 'RX-006', name: 'বাক্স কোয়িল্ট', material: 'rexine', color: 'বেইজ', hex: '#c4a882', available: true, note: 'লাক্সারি বক্স কোয়িল্ট, গাড়ির ভেতর প্রিমিয়াম ফিল।', img: '' },
  { id: 'RX-007', name: 'ডবল স্টিচ লাইন', material: 'rexine', color: 'সাদা-ধূসর', hex: '#d0d0d0', available: true, note: 'দুই রঙের সেলাই, মডার্ন লুক।', img: '' },
  { id: 'RX-008', name: 'স্পোর্ট মেশ', material: 'rexine', color: 'কমলা-কালো', hex: '#c45010', available: false, note: 'স্টক শেষ। শীঘ্রই আসছে।', img: '' },
  { id: 'LT-001', name: 'স্মুথ ফুল লেদার', material: 'leather', color: 'কালো', hex: '#0d0d0d', available: true, note: 'খাঁটি নরম লেদার। প্রিমিয়াম গাড়ির জন্য পারফেক্ট।', img: '', featured: true },
  { id: 'LT-002', name: 'টেক্সচার্ড লেদার', material: 'leather', color: 'গাঢ় বাদামি', hex: '#3b1f0a', available: true, note: 'টেক্সচার্ড ফিনিশ, দীর্ঘস্থায়ী ও স্ক্র্যাচ-রেজিস্ট্যান্ট।', img: '', featured: true },
  { id: 'LT-003', name: 'পার্ফোরেটেড লেদার', material: 'leather', color: 'ধূসর', hex: '#5a5a5a', available: true, note: 'ছিদ্রযুক্ত লেদার — বায়ু চলাচল ও স্টাইল দুটোই।', img: '', featured: true },
  { id: 'LT-004', name: 'নাপা সফট লেদার', material: 'leather', color: 'আইভরি ক্রিম', hex: '#e8dbc8', available: true, note: 'অত্যন্ত নরম নাপা লেদার, উচ্চমানের ফিনিশ।', img: '' },
];

let allSamples = [];
let currentFilter = 'all';
let currentSearch = '';
let modalSample = null;
let lastSampleTrigger = null;
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');
const ACTIVATION_KEYS = new Set(['Enter', ' ']);

function isActivationKey(event) {
  return ACTIVATION_KEYS.has(event.key);
}

function findSampleById(sampleId) {
  return allSamples.find(item => item.id === sampleId) || null;
}

function normalizeSampleMaterial(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw.includes('leather') || raw.includes('চামড়') || raw.includes('চামড়া') || raw.includes('লেদার')) return 'leather';
  return 'rexine';
}

function normalizeFilter(value) {
  return ['all', 'rexine', 'leather'].includes(value) ? value : 'all';
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

function isFeaturedSample(sample) {
  return ['featured', 'showOnHome', 'home', 'isFeatured', 'popular', 'bestSeller', 'topSeller', 'homeFeatured']
    .some(key => {
      const value = sample[key];
      return value === true || value === 1 || value === '1' || value === 'true' || value === 'yes';
    });
}

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

  renderSamplesCatalog();
}

function getSearchText(sample) {
  return [
    sample.id,
    sample.name,
    sample.color,
    sample.note,
    sample.material === 'rexine' ? 'রেক্সিন Rexine' : 'লেদার Leather',
  ].join(' ').toLowerCase();
}

function getFilteredSamples() {
  const query = currentSearch.trim().toLowerCase();
  return allSamples.filter(sample => {
    const matchFilter = currentFilter === 'all' || sample.material === currentFilter;
    const matchSearch = !query || getSearchText(sample).includes(query);
    return matchFilter && matchSearch;
  });
}

function syncQueryParams() {
  const params = new URLSearchParams();
  if (currentFilter !== 'all') params.set('material', currentFilter);
  if (currentSearch) params.set('q', currentSearch);
  const query = params.toString();
  history.replaceState(null, '', query ? `samples-all.html?${query}` : 'samples-all.html');
}

function updateCatalogSummary(total) {
  const countEl = document.getElementById('samplesCatalogCount');
  const currentLabelEl = document.getElementById('samplesCatalogCurrentLabel');
  if (countEl) countEl.textContent = total;
  if (currentLabelEl) currentLabelEl.textContent = SAMPLE_LABELS[currentFilter] || 'সব';
}

function renderSamplesCatalog() {
  const filtered = getFilteredSamples();
  const grid = document.getElementById('samplesCatalogGrid');

  document.querySelectorAll('.sample-filter-btn[data-filter]').forEach(btn => {
    const isActive = btn.dataset.filter === currentFilter;
    btn.classList.toggle('active', isActive);
    if (isActive) btn.setAttribute('aria-current', 'true');
    else btn.removeAttribute('aria-current');
  });

  updateCatalogSummary(filtered.length);
  syncQueryParams();

  if (!filtered.length) {
    grid.innerHTML = `<div class="samples-catalog-empty">
      <span class="samples-catalog-empty-icon">🔍</span>
      <p>এই filter অনুযায়ী কোনো sample পাওয়া যায়নি। অন্য keyword বা material দিয়ে চেষ্টা করুন।</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(sampleCard).join('');

  grid.querySelectorAll('.sample-card-swatch img').forEach(imageEl => {
    imageEl.addEventListener('error', () => {
      imageEl.remove();
    }, { once: true });
  });

  grid.querySelectorAll('.sample-card[data-sample-id]').forEach(card => {
    if (card.classList.contains('out-of-stock')) return;
    card.addEventListener('click', () => openSampleModal(card.dataset.sampleId, card));
    card.addEventListener('keydown', event => {
      if (event.target.closest('[data-order-sample-id]')) return;
      if (!isActivationKey(event)) return;
      event.preventDefault();
      openSampleModal(card.dataset.sampleId, card);
    });
  });

  grid.querySelectorAll('[data-order-sample-id]').forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      orderSample(button.dataset.orderSampleId);
    });
  });
}

function sampleCard(sample) {
  const matTag = sample.material === 'rexine'
    ? '<span class="sample-card-material-tag tag-rexine">রেক্সিন</span>'
    : '<span class="sample-card-material-tag tag-leather">লেদার</span>';

  const swatchContent = sample.img
    ? `<img src="${sample.img}" alt="${sample.name}" loading="lazy" decoding="async">
       <span class="swatch-no-img">${sample.material === 'rexine' ? '🪡' : '🧥'}</span>`
    : `<span class="swatch-no-img">${sample.material === 'rexine' ? '🪡' : '🧥'}</span>`;

  const featuredBadge = isFeaturedSample(sample)
    ? '<div class="sample-card-featured-badge">জনপ্রিয় পছন্দ</div>'
    : '';

  const cardAttrs = sample.available
    ? `data-sample-id="${sample.id}" tabindex="0" aria-label="${sample.id} ${sample.name}"`
    : 'aria-disabled="true"';

  return `<article class="sample-card ${sample.available ? '' : 'out-of-stock'}" ${cardAttrs}>
    <div class="sample-card-swatch" style="background-color: ${sample.hex};">
      ${swatchContent}
      ${featuredBadge}
      ${!sample.available ? '<div class="sample-card-stock-badge">স্টক নেই</div>' : ''}
    </div>
    <div class="sample-card-body">
      <div class="sample-card-id">
        <span>${sample.id}</span>
        ${matTag}
      </div>
      <div class="sample-card-name">${sample.name}</div>
      <div class="sample-card-color-row">
        <div class="sample-card-color-dot" style="background:${sample.hex}"></div>
        <span class="sample-card-color-name">${sample.color}</span>
      </div>
      ${sample.note ? `<p class="sample-card-note">${sample.note}</p>` : ''}
      <button type="button" class="sample-card-order-btn" data-order-sample-id="${sample.id}" ${sample.available ? '' : 'disabled'}>
        ${sample.available ? 'অর্ডার শুরু করুন' : 'স্টক নেই'}
      </button>
    </div>
  </article>`;
}

function openSampleModal(id, triggerEl = null) {
  const sample = findSampleById(id);
  if (!sample) return;
  modalSample = sample;
  lastSampleTrigger = triggerEl instanceof HTMLElement
    ? triggerEl
    : (document.activeElement instanceof HTMLElement ? document.activeElement : null);

  document.getElementById('sampleModalId').textContent = `Sample ID: ${sample.id}`;
  document.getElementById('sampleModalIdVal').textContent = sample.id;
  document.getElementById('sampleModalName').textContent = sample.name;
  document.getElementById('sampleModalMaterial').textContent = sample.material === 'rexine' ? 'রেক্সিন (Rexine)' : 'চামড়া (Leather)';
  document.getElementById('sampleModalColorDot').style.background = sample.hex;
  document.getElementById('sampleModalColorName').textContent = sample.color;
  document.getElementById('sampleModalStock').innerHTML = sample.available
    ? '<span style="color:#2ecc71">✅ উপলব্ধ</span>'
    : '<span style="color:#e74c3c">❌ স্টক নেই</span>';

  const noteEl = document.getElementById('sampleModalNote');
  if (sample.note) {
    noteEl.textContent = sample.note;
    noteEl.style.display = '';
  } else {
    noteEl.style.display = 'none';
  }

  const swatchEl = document.getElementById('sampleModalSwatch');
  swatchEl.style.backgroundColor = sample.hex;
  const imgEl = document.getElementById('sampleModalImg');
  imgEl.src = sample.img || '';
  imgEl.alt = `${sample.name} (${sample.id})`;
  imgEl.style.display = sample.img ? '' : 'none';
  imgEl.onerror = () => { imgEl.style.display = 'none'; };
  document.getElementById('sampleModalSwatchFallback').textContent = sample.material === 'rexine' ? '🪡' : '🧥';

  const button = document.getElementById('sampleModalOrderBtn');
  if (!sample.available) {
    button.textContent = '❌ স্টক নেই';
    button.style.opacity = '0.4';
    button.style.pointerEvents = 'none';
  } else {
    button.textContent = '✅ এই স্যাম্পল নিয়ে অর্ডার করুন';
    button.style.opacity = '';
    button.style.pointerEvents = '';
  }

  const modalOverlay = document.getElementById('sampleModal');
  modalOverlay.classList.add('open');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const firstFocusable = modalOverlay.querySelector(FOCUSABLE_SELECTOR);
  if (firstFocusable) firstFocusable.focus();
}

function closeSampleModal() {
  const modalOverlay = document.getElementById('sampleModal');
  modalOverlay.classList.remove('open');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastSampleTrigger) lastSampleTrigger.focus();
}

function orderSample(sampleId) {
  const sample = findSampleById(sampleId);
  if (!sample || !sample.available) return;
  localStorage.setItem('ac_selected_sample_id', sampleId);
  window.location.href = `index.html?sample=${encodeURIComponent(sampleId)}#contact`;
}

document.querySelectorAll('.sample-filter-btn[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = normalizeFilter(button.dataset.filter);
    renderSamplesCatalog();
  });
});

document.getElementById('samplesCatalogSearchInput').addEventListener('input', (event) => {
  currentSearch = event.target.value.trim();
  renderSamplesCatalog();
});

document.getElementById('samplesCatalogResetBtn').addEventListener('click', () => {
  currentFilter = 'all';
  currentSearch = '';
  document.getElementById('samplesCatalogSearchInput').value = '';
  renderSamplesCatalog();
});

document.getElementById('sampleModalCloseBtn').addEventListener('click', closeSampleModal);
document.getElementById('sampleModal').addEventListener('click', (event) => {
  if (event.target === event.currentTarget) closeSampleModal();
});

document.getElementById('sampleModalOrderBtn').addEventListener('click', () => {
  if (!modalSample) return;
  orderSample(modalSample.id);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (document.getElementById('sampleModal').classList.contains('open')) closeSampleModal();
});

const initialParams = new URLSearchParams(window.location.search);
currentFilter = normalizeFilter(initialParams.get('material') || 'all');
currentSearch = initialParams.get('q') || '';
document.getElementById('samplesCatalogSearchInput').value = currentSearch;
loadSamples();

})();
