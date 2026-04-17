/**
 * Samples catalog page controller.
 *
 * Responsibilities:
 * - normalize sample data from localStorage/admin panel
 * - provide filter/search interactions with URL sync
 * - handle accessible modal preview + order handoff
 */
import { closeDialogModal, openDialogModal } from '../core/dialog-helpers.js';
import { escapeAttr, escapeHTML, FOCUSABLE_SELECTOR } from '../core/dom-helpers.js';
import { EMPTY_IMAGE_DATA_URI } from '../core/media-helpers.js';
import {
  getSampleSearchText,
  isFeaturedSample,
  loadSamplesFromStorage,
  normalizeSampleFilter,
  sanitizeColor,
  SELECTED_SAMPLE_STORAGE_KEY
} from '../data/sample-store.js';

const SAMPLE_LABELS = Object.freeze({
  all: 'সব',
  rexine: 'রেক্সিন',
  leather: 'লেদার'
});

export function initSamplesCatalogPage() {
  let allSamples = [];
  let currentFilter = 'all';
  let currentSearch = '';
  let modalSample = null;
  let lastSampleTrigger = null;

  function findSampleById(sampleId) {
    return allSamples.find(item => item.id === sampleId) || null;
  }

function loadSamples() {
  allSamples = loadSamplesFromStorage(localStorage);
  renderSamplesCatalog();
}

function getFilteredSamples() {
  const query = currentSearch.trim().toLowerCase();
  return allSamples.filter(sample => {
    const matchFilter = currentFilter === 'all' || sample.material === currentFilter;
    const matchSearch = !query || getSampleSearchText(sample).includes(query);
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
    btn.setAttribute('aria-pressed', String(isActive));
  });

  updateCatalogSummary(filtered.length);
  syncQueryParams();

  if (!filtered.length) {
    grid.innerHTML = `<li class="samples-catalog-empty">
      <span class="samples-catalog-empty-icon">🔍</span>
      <p>এই filter অনুযায়ী কোনো sample পাওয়া যায়নি। অন্য keyword বা material দিয়ে চেষ্টা করুন।</p>
    </li>`;
    return;
  }

  grid.innerHTML = filtered.map(sampleCard).join('');

  grid.querySelectorAll('.sample-card-swatch img').forEach(imageEl => {
    imageEl.addEventListener('error', () => {
      imageEl.remove();
    }, { once: true });
  });

  grid.querySelectorAll('.sample-card-preview[data-preview-sample-id]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      event.preventDefault();
      openSampleModal(trigger.dataset.previewSampleId, trigger);
    });

    trigger.addEventListener('keydown', event => {
      if (event.key !== ' ') return;
      event.preventDefault();
      openSampleModal(trigger.dataset.previewSampleId, trigger);
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
  const safeId = escapeHTML(sample.id);
  const safeName = escapeHTML(sample.name);
  const safeColor = escapeHTML(sample.color);
  const safeHex = sanitizeColor(sample.hex, sample.material === 'rexine' ? '#3d2010' : '#3b1f0a');
  const safeIdAttr = escapeAttr(sample.id);
  const safeAriaLabel = escapeAttr(`${sample.id} ${sample.name}`);
  const matTag = sample.material === 'rexine'
    ? '<span class="sample-card-material-tag tag-rexine">রেক্সিন</span>'
    : '<span class="sample-card-material-tag tag-leather">লেদার</span>';

  const swatchContent = sample.img
    ? `<img src="${escapeAttr(sample.img)}" alt="${escapeAttr(sample.name)}" loading="lazy" decoding="async">
       <span class="swatch-no-img">${sample.material === 'rexine' ? '🪡' : '🧥'}</span>`
    : `<span class="swatch-no-img">${sample.material === 'rexine' ? '🪡' : '🧥'}</span>`;

  const featuredBadge = isFeaturedSample(sample)
    ? '<div class="sample-card-featured-badge">জনপ্রিয় পছন্দ</div>'
    : '';

  const previewContent = `
    <div class="sample-card-swatch" style="background-color: ${safeHex};">
      ${swatchContent}
      ${featuredBadge}
      ${!sample.available ? '<div class="sample-card-stock-badge">স্টক নেই</div>' : ''}
    </div>
    <div class="sample-card-body">
      <div class="sample-card-id">
        <span>${safeId}</span>
        ${matTag}
      </div>
      <h3 class="sample-card-name">${safeName}</h3>
      <div class="sample-card-color-row">
        <div class="sample-card-color-dot" style="background:${safeHex}"></div>
        <span class="sample-card-color-name">${safeColor}</span>
      </div>
      ${sample.note ? `<p class="sample-card-note">${escapeHTML(sample.note)}</p>` : ''}
    </div>`;

  const previewMarkup = sample.available
    ? `<a href="#sampleModal" class="sample-card-preview" data-preview-sample-id="${safeIdAttr}" aria-label="${safeAriaLabel}">${previewContent}</a>`
    : `<div class="sample-card-preview sample-card-preview-static">${previewContent}</div>`;

  return `<li class="sample-card-item">
    <article class="sample-card ${sample.available ? '' : 'out-of-stock'}">
      ${previewMarkup}
      <button type="button" class="sample-card-order-btn" data-order-sample-id="${safeIdAttr}" ${sample.available ? '' : 'disabled'}>
        ${sample.available ? 'অর্ডার শুরু করুন' : 'স্টক নেই'}
      </button>
    </article>
  </li>`;
}

function openSampleModal(id, triggerEl = null) {
  const sample = findSampleById(id);
  if (!sample) return;
  const sampleHex = sanitizeColor(sample.hex, sample.material === 'rexine' ? '#3d2010' : '#3b1f0a');
  modalSample = sample;
  lastSampleTrigger = triggerEl instanceof HTMLElement
    ? triggerEl
    : (document.activeElement instanceof HTMLElement ? document.activeElement : null);

  document.getElementById('sampleModalId').textContent = `Sample ID: ${sample.id}`;
  document.getElementById('sampleModalIdVal').textContent = sample.id;
  document.getElementById('sampleModalName').textContent = sample.name;
  document.getElementById('sampleModalMaterial').textContent = sample.material === 'rexine' ? 'রেক্সিন (Rexine)' : 'চামড়া (Leather)';
  document.getElementById('sampleModalColorDot').style.background = sampleHex;
  document.getElementById('sampleModalColorName').textContent = sample.color;
  const stockEl = document.getElementById('sampleModalStock');
  stockEl.textContent = sample.available ? '✅ উপলব্ধ' : '❌ স্টক নেই';
  stockEl.dataset.stockState = sample.available ? 'available' : 'unavailable';

  const noteEl = document.getElementById('sampleModalNote');
  if (sample.note) {
    noteEl.textContent = sample.note;
    noteEl.hidden = false;
  } else {
    noteEl.textContent = '';
    noteEl.hidden = true;
  }

  const swatchEl = document.getElementById('sampleModalSwatch');
  swatchEl.style.backgroundColor = sampleHex;
  const imgEl = document.getElementById('sampleModalImg');
  imgEl.src = sample.img || EMPTY_IMAGE_DATA_URI;
  imgEl.alt = sample.img ? `${sample.name} (${sample.id})` : 'স্যাম্পল প্রিভিউ';
  imgEl.hidden = !sample.img;
  imgEl.onerror = () => { imgEl.hidden = true; };
  document.getElementById('sampleModalSwatchFallback').textContent = sample.material === 'rexine' ? '🪡' : '🧥';

  const button = document.getElementById('sampleModalOrderBtn');
  button.disabled = !sample.available;
  button.textContent = sample.available ? '✅ এই স্যাম্পল নিয়ে অর্ডার করুন' : '❌ স্টক নেই';

  const modalOverlay = document.getElementById('sampleModal');
  openDialogModal(modalOverlay);
  const firstFocusable = modalOverlay.querySelector(FOCUSABLE_SELECTOR);
  if (firstFocusable) firstFocusable.focus();
}

function closeSampleModal() {
  const modalOverlay = document.getElementById('sampleModal');
  closeDialogModal(modalOverlay);
  if (lastSampleTrigger) lastSampleTrigger.focus();
}

function orderSample(sampleId) {
  const sample = findSampleById(sampleId);
  if (!sample || !sample.available) return;
  localStorage.setItem(SELECTED_SAMPLE_STORAGE_KEY, sampleId);
  window.location.href = `index.html?sample=${encodeURIComponent(sampleId)}#contact`;
}

document.querySelectorAll('.sample-filter-btn[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = normalizeSampleFilter(button.dataset.filter);
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
document.getElementById('sampleModal').addEventListener('cancel', (event) => {
  event.preventDefault();
  closeSampleModal();
});

document.getElementById('sampleModalOrderBtn').addEventListener('click', () => {
  if (!modalSample) return;
  orderSample(modalSample.id);
});

const initialParams = new URLSearchParams(window.location.search);
currentFilter = normalizeSampleFilter(initialParams.get('material') || 'all');
currentSearch = initialParams.get('q') || '';
document.getElementById('samplesCatalogSearchInput').value = currentSearch;
loadSamples();
}
