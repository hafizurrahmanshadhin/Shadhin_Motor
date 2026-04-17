import { escapeAttr, escapeHTML } from '../core/dom-helpers.js';
import { EMPTY_IMAGE_DATA_URI } from '../core/media-helpers.js';
import {
  isFeaturedSample,
  loadSamplesFromStorage,
  sanitizeColor,
  SELECTED_SAMPLE_STORAGE_KEY
} from '../data/sample-store.js';

const SAMPLE_MATERIAL_LABELS = Object.freeze({
  all: 'সব',
  rexine: 'রেক্সিন',
  leather: 'লেদার'
});

const HOME_SAMPLE_LIMITS = Object.freeze({
  rexine: 5,
  leather: 5
});

export function initHomeSamples({
  orderStorageKey,
  openDialog,
  closeDialog,
  focusWithoutScroll,
  restoreFocus,
  captureViewportPosition,
  scheduleViewportRestore,
  syncBodyScrollLockState,
  showToast
}) {
  let allSamples = [];
  let currentFilter = 'all';
  let selectedSample = null;
  let modalSample = null;
  let sampleModalTrigger = null;
  let sampleModalViewport = null;
  let sampleConfirmViewport = null;

  const orderConfirmState = {
    secondaryAction: 'choose-sample',
    lastTrigger: null
  };

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
        const featuredDiff = Number(isFeaturedSample(a)) === Number(isFeaturedSample(b))
          ? 0
          : (isFeaturedSample(a) ? -1 : 1);
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
    const pendingId = params.get('sample') || localStorage.getItem(SELECTED_SAMPLE_STORAGE_KEY) || '';
    if (!pendingId) return;

    localStorage.removeItem(SELECTED_SAMPLE_STORAGE_KEY);
    clearPendingSampleParams();

    const pendingSample = allSamples.find(sample => sample.id === pendingId);
    if (!pendingSample || !pendingSample.available) return;
    selectSample(pendingSample.id);
  }

  function loadSamples() {
    allSamples = loadSamplesFromStorage(localStorage);
    renderSamples();
    applyPendingSampleSelection();
  }

  function getFilteredSamples() {
    const baseSamples = currentFilter === 'all'
      ? [...getHomeMaterialSamples('rexine'), ...getHomeMaterialSamples('leather')]
      : getHomeMaterialSamples(currentFilter);

    return injectSelectedHomeSample(baseSamples);
  }

  function setActiveSampleFilterButton(filterValue) {
    document.querySelectorAll('[data-sample-filter]').forEach(button => {
      const isActive = button.dataset.sampleFilter === filterValue;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function filterSamples(filterValue, button) {
    currentFilter = filterValue;
    if (button) setActiveSampleFilterButton(button.dataset.sampleFilter || filterValue);
    else setActiveSampleFilterButton(filterValue);
    renderSamples();
  }

  function renderSamples() {
    const grid = document.getElementById('samplesGrid');
    const filtered = getFilteredSamples();

    updateSamplesOverview(filtered.length);
    setActiveSampleFilterButton(currentFilter);

    if (!grid) return;

    if (!filtered.length) {
      grid.innerHTML = `<li class="samples-empty">
      <span class="samples-empty-icon">🔍</span>
      <p>কোনো স্যাম্পল পাওয়া যায়নি।</p>
    </li>`;
      return;
    }

    grid.innerHTML = filtered.map(sample => {
      const isSelected = selectedSample && selectedSample.id === sample.id;
      const safeId = escapeHTML(sample.id);
      const safeName = escapeHTML(sample.name);
      const safeColor = escapeHTML(sample.color);
      const safeHex = sanitizeColor(sample.hex, sample.material === 'rexine' ? '#3d2010' : '#3b1f0a');
      const matTag = sample.material === 'rexine'
        ? '<span class="sample-card-material-tag tag-rexine">রেক্সিন</span>'
        : '<span class="sample-card-material-tag tag-leather">লেদার</span>';

      const swatchContent = sample.img
        ? `<img src="${escapeAttr(sample.img)}" alt="${escapeAttr(sample.name)}" loading="lazy" decoding="async">
         <span class="swatch-no-img">${sample.material === 'rexine' ? '🪡' : '🧥'}</span>`
        : `<span class="swatch-no-img">${sample.material === 'rexine' ? '🪡' : '🧥'}</span>`;

      const previewContent = `
      <div class="sample-card-swatch" style="background-color: ${safeHex};">
        ${swatchContent}
        <div class="sample-card-selected-badge">✓</div>
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
      </div>`;

      const previewMarkup = sample.available
        ? `<a href="#sampleModal" class="sample-card-preview" data-preview-sample-id="${escapeAttr(sample.id)}" aria-label="${escapeAttr(`${sample.id} ${sample.name}`)}">${previewContent}</a>`
        : `<div class="sample-card-preview sample-card-preview-static">${previewContent}</div>`;

      return `
    <li class="sample-card-item">
      <article class="sample-card ${isSelected ? 'selected' : ''} ${!sample.available ? 'out-of-stock' : ''}">
        ${previewMarkup}
        <button type="button" class="sample-card-order-btn" data-select-sample-id="${escapeAttr(sample.id)}" ${sample.available ? '' : 'disabled'}>
          ${isSelected ? '✓ নির্বাচিত' : (sample.available ? '+ অর্ডারে যোগ করুন' : 'স্টক নেই')}
        </button>
      </article>
    </li>`;
    }).join('');

    bindSampleCardImages(grid);
  }

  function bindSampleCardImages(root) {
    if (!root) return;

    root.querySelectorAll('.sample-card-swatch img').forEach(img => {
      img.addEventListener('error', () => {
        img.remove();
      }, { once: true });
    });
  }

  function initSamplesGridInteractions() {
    const grid = document.getElementById('samplesGrid');
    if (!grid || grid.dataset.accessibilityBound === 'true') return;

    grid.addEventListener('click', event => {
      const selectBtn = event.target.closest('[data-select-sample-id]');
      if (selectBtn) {
        event.stopPropagation();
        const sampleId = selectBtn.dataset.selectSampleId;
        if (sampleId) selectSample(sampleId);
        return;
      }

      const previewLink = event.target.closest('.sample-card-preview[data-preview-sample-id]');
      if (!previewLink || !grid.contains(previewLink)) return;
      event.preventDefault();
      const sampleId = previewLink.dataset.previewSampleId;
      if (!sampleId) return;

      openSampleModal(sampleId, previewLink);
    });

    grid.addEventListener('keydown', event => {
      if (event.key !== ' ') return;
      if (event.target.closest('[data-select-sample-id]')) return;

      const previewLink = event.target.closest('.sample-card-preview[data-preview-sample-id]');
      if (!previewLink || !grid.contains(previewLink)) return;

      event.preventDefault();
      const sampleId = previewLink.dataset.previewSampleId;
      if (!sampleId) return;
      openSampleModal(sampleId, previewLink);
    });

    grid.dataset.accessibilityBound = 'true';
  }

  function openSampleModal(sampleId, triggerEl = null) {
    const sample = allSamples.find(item => item.id === sampleId);
    if (!sample) return;

    const modalOverlay = document.getElementById('sampleModal');
    if (!modalOverlay) return;

    modalSample = sample;
    sampleModalTrigger = triggerEl instanceof HTMLElement
      ? triggerEl
      : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    sampleModalViewport = captureViewportPosition();

    document.getElementById('sampleModalId').textContent = `Sample ID: ${sample.id}`;
    document.getElementById('sampleModalIdVal').textContent = sample.id;
    document.getElementById('sampleModalName').textContent = sample.name;
    document.getElementById('sampleModalMaterial').textContent = sample.material === 'rexine' ? 'রেক্সিন (Rexine)' : 'চামড়া (Leather)';
    const sampleHex = sanitizeColor(sample.hex, sample.material === 'rexine' ? '#3d2010' : '#3b1f0a');
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
    imgEl.onerror = () => {
      imgEl.hidden = true;
    };

    document.getElementById('sampleModalSwatchFallback').textContent = sample.material === 'rexine' ? '🪡' : '🧥';

    const orderBtn = document.getElementById('sampleModalOrderBtn');
    orderBtn.disabled = !sample.available;
    if (sample.available) {
      const alreadySelected = selectedSample && selectedSample.id === sample.id;
      orderBtn.textContent = alreadySelected ? '✓ ইতোমধ্যে নির্বাচিত — অর্ডারে যান' : '✅ এই স্যাম্পল নির্বাচন করুন';
    } else {
      orderBtn.textContent = '❌ স্টক নেই';
    }

    openDialog(modalOverlay);
    syncBodyScrollLockState();
    focusWithoutScroll(document.getElementById('sampleModalCloseBtn'));
    scheduleViewportRestore(sampleModalViewport);
  }

  function closeSampleModal(restoreViewport = true) {
    const modalOverlay = document.getElementById('sampleModal');
    if (!modalOverlay) return;

    const viewport = sampleModalViewport || captureViewportPosition();

    closeDialog(modalOverlay);
    syncBodyScrollLockState();
    restoreFocus(sampleModalTrigger);
    if (restoreViewport) scheduleViewportRestore(viewport);
    sampleModalViewport = null;
  }

  function selectFromModal() {
    if (!modalSample) return;
    selectSample(modalSample.id);
    closeSampleModal(false);
    scrollToSectionById('contact', 200);
  }

  function scrollToSectionById(sectionId, delayMs = 0, block = 'start') {
    const target = document.getElementById(sectionId);
    if (!target) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block });
    }, delayMs);
  }

  function selectSample(sampleId) {
    const sample = allSamples.find(item => item.id === sampleId);
    if (!sample || !sample.available) return;
    selectedSample = sample;

    const bar = document.getElementById('selectedSampleBar');
    const sampleHex = sanitizeColor(sample.hex, sample.material === 'rexine' ? '#3d2010' : '#3b1f0a');
    document.getElementById('selectedBarSwatch').style.background = sampleHex;
    document.getElementById('selectedBarName').textContent = `${sample.id} — ${sample.name}`;
    document.getElementById('selectedBarMeta').textContent =
      `${sample.material === 'rexine' ? 'রেক্সিন' : 'লেদার'} · ${sample.color}`;
    bar.classList.add('visible');

    document.getElementById('selectedSampleId').value = sample.id;
    const strip = document.getElementById('formSampleStrip');
    document.getElementById('formSwatchDot').style.background = sampleHex;
    document.getElementById('formSampleLabel').textContent =
      `${sample.id} — ${sample.name} (${sample.material === 'rexine' ? 'রেক্সিন' : 'লেদার'}, ${sample.color})`;
    strip.style.display = 'flex';

    document.getElementById('material').value = sample.material === 'rexine' ? 'রেক্সিন (Rexine)' : 'চামড়া (Leather)';
    renderSamples();

    showToast('✅ স্যাম্পল নির্বাচিত!', `${sample.id} — ${sample.name} নির্বাচন হয়েছে। এখন অর্ডার ফর্ম পূরণ করুন।`, 4000);
  }

  function clearSelectedSample() {
    selectedSample = null;
    document.getElementById('selectedSampleBar').classList.remove('visible');
    document.getElementById('selectedSampleId').value = '';
    document.getElementById('formSampleStrip').style.display = 'none';
    renderSamples();
  }

  function scrollToOrder() {
    scrollToSectionById('contact', 100);
  }

  function getSampleMaterialLabel(sample) {
    if (!sample) return '';
    return sample.material === 'rexine' ? 'রেক্সিন' : 'লেদার';
  }

  function openSampleConfirmModal() {
    const modal = document.getElementById('sampleConfirmModal');
    if (!modal) return;

    const badge = document.getElementById('sampleConfirmBadge');
    const title = document.getElementById('sampleConfirmTitle');
    const copy = document.getElementById('sampleConfirmCopy');
    const primaryHighlightTitle = document.getElementById('sampleConfirmHighlightPrimaryTitle');
    const primaryHighlightCopy = document.getElementById('sampleConfirmHighlightPrimaryCopy');
    const secondaryHighlightTitle = document.getElementById('sampleConfirmHighlightSecondaryTitle');
    const secondaryHighlightCopy = document.getElementById('sampleConfirmHighlightSecondaryCopy');
    const secondaryBtn = document.getElementById('sampleConfirmSecondaryBtn');
    const primaryBtn = document.getElementById('sampleConfirmPrimaryBtn');
    const sampleId = document.getElementById('selectedSampleId').value.trim();
    const sample = sampleId
      ? (allSamples.find(item => item.id === sampleId) || selectedSample)
      : null;

    orderConfirmState.lastTrigger = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    sampleConfirmViewport = captureViewportPosition();

    if (sample) {
      orderConfirmState.secondaryAction = 'edit-order';
      badge.textContent = 'স্যাম্পল নির্বাচন করা হয়েছে';
      title.textContent = 'নির্বাচিত Sample ID সহ অর্ডার জমা দিতে চান?';
      copy.textContent = `আপনার অর্ডারের সঙ্গে ${sample.id} স্যাম্পলটি যুক্ত থাকবে। confirm করলে অর্ডার জমা হয়ে যাবে, পরে আমরা এই স্যাম্পল অনুযায়ী যোগাযোগ করব।`;
      primaryHighlightTitle.textContent = `${sample.id} — ${sample.name}`;
      primaryHighlightCopy.textContent = `${getSampleMaterialLabel(sample)} · ${sample.color}`;
      secondaryHighlightTitle.textContent = 'জমা দেওয়ার আগে';
      secondaryHighlightCopy.textContent = 'ফর্ম বা স্যাম্পল বদলাতে চাইলে এখন ফিরে গিয়ে আবার দেখে নিতে পারেন।';
      secondaryBtn.textContent = '✏️ আরেকবার দেখে নেই';
      primaryBtn.textContent = '✅ হ্যাঁ, অর্ডার জমা দিন';
    } else {
      orderConfirmState.secondaryAction = 'choose-sample';
      badge.textContent = 'স্যাম্পল এখনো বাছাই করা হয়নি';
      title.textContent = 'Sample ID ছাড়া অর্ডার জমা দিতে চান?';
      copy.textContent = 'আপনি চাইলে এখনই ফর্ম জমা দিতে পারেন। তবে একটি স্যাম্পল বেছে নিলে আমরা রং, ফিনিশ ও মেটেরিয়াল আরও দ্রুত এবং নির্ভুলভাবে বুঝে নিতে পারব।';
      primaryHighlightTitle.textContent = 'স্যাম্পল বেছে নিলে';
      primaryHighlightCopy.textContent = 'দ্রুত মূল্য ও ডিজাইন ম্যাচ করা সহজ হবে';
      secondaryHighlightTitle.textContent = 'স্যাম্পল ছাড়া দিলেও';
      secondaryHighlightCopy.textContent = 'অর্ডার যাবে, পরে আমরা কথা বলে বিস্তারিত নেব';
      secondaryBtn.textContent = '🪡 আগে স্যাম্পল বেছে নেব';
      primaryBtn.textContent = '✅ স্যাম্পল ছাড়া অর্ডার জমা দিন';
    }

    openDialog(modal);
    syncBodyScrollLockState();
    focusWithoutScroll(primaryBtn);
    scheduleViewportRestore(sampleConfirmViewport);
  }

  function closeSampleConfirmModal(restoreViewport = true) {
    const modal = document.getElementById('sampleConfirmModal');
    if (!modal) return;

    const viewport = sampleConfirmViewport || captureViewportPosition();

    closeDialog(modal);
    syncBodyScrollLockState();
    restoreFocus(orderConfirmState.lastTrigger);
    if (restoreViewport) scheduleViewportRestore(viewport);
    sampleConfirmViewport = null;
  }

  function goChooseSample() {
    closeSampleConfirmModal(false);
    scrollToSectionById('samples', 120, 'start');
    showToast('🪡 একটি স্যাম্পল বেছে নিন', 'Sample ID নির্বাচন করলে আমরা ডিজাইন, রং ও মূল্যের বিষয়ে আরও দ্রুত সাহায্য করতে পারব।', 5000);
  }

  function handleOrderConfirmSecondaryAction() {
    if (orderConfirmState.secondaryAction === 'choose-sample') {
      goChooseSample();
      return;
    }

    closeSampleConfirmModal();
  }

  function confirmSubmitOrder() {
    closeSampleConfirmModal();
    submitOrder(true);
  }

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

    if (!skipSampleConfirmation) {
      openSampleConfirmModal();
      return;
    }

    const order = {
      id: `ORD-${Date.now()}`,
      name,
      phone,
      vehicle,
      carModel: document.getElementById('carModel').value,
      service,
      material: document.getElementById('material').value,
      sampleId: sampleId || null,
      sampleName: sampleId ? (allSamples.find(sample => sample.id === sampleId)?.name || '') : '',
      details: document.getElementById('orderDetails').value,
      status: 'pending',
      date: new Date().toLocaleDateString('bn-BD'),
      dateISO: new Date().toISOString()
    };

    const orders = JSON.parse(localStorage.getItem(orderStorageKey) || '[]');
    orders.unshift(order);
    localStorage.setItem(orderStorageKey, JSON.stringify(orders));

    ['custName', 'custPhone', 'carModel', 'orderDetails'].forEach(id => {
      document.getElementById(id).value = '';
    });
    ['vehicleType', 'serviceType', 'material'].forEach(id => {
      document.getElementById(id).selectedIndex = 0;
    });
    clearSelectedSample();

    const sampleMsg = sampleId ? ` স্যাম্পল: ${sampleId}` : '';
    showToast('✅ অর্ডার সফল!', `অর্ডার নম্বর: ${order.id}।${sampleMsg} আমরা শীঘ্রই যোগাযোগ করব।`, 6000);
  }

  document.getElementById('sampleModal')?.addEventListener('click', event => {
    if (event.target === event.currentTarget) closeSampleModal();
  });
  document.getElementById('sampleModal')?.addEventListener('cancel', event => {
    event.preventDefault();
    closeSampleModal();
  });
  document.getElementById('sampleModalCloseBtn')?.addEventListener('click', closeSampleModal);
  document.getElementById('sampleModalOrderBtn')?.addEventListener('click', selectFromModal);

  document.getElementById('sampleConfirmModal')?.addEventListener('click', event => {
    if (event.target === event.currentTarget) closeSampleConfirmModal();
  });
  document.getElementById('sampleConfirmModal')?.addEventListener('cancel', event => {
    event.preventDefault();
    closeSampleConfirmModal();
  });

  document.querySelectorAll('[data-sample-filter]').forEach(button => {
    button.addEventListener('click', () => {
      filterSamples(button.dataset.sampleFilter || 'all', button);
    });
  });

  document.getElementById('selectedSampleOrderBtn')?.addEventListener('click', event => {
    event.preventDefault();
    scrollToOrder();
  });
  document.getElementById('selectedSampleClearBtn')?.addEventListener('click', clearSelectedSample);
  document.getElementById('formSampleClearBtn')?.addEventListener('click', clearSelectedSample);
  document.getElementById('sampleConfirmCloseBtn')?.addEventListener('click', closeSampleConfirmModal);
  document.getElementById('sampleConfirmSecondaryBtn')?.addEventListener('click', handleOrderConfirmSecondaryAction);
  document.getElementById('sampleConfirmPrimaryBtn')?.addEventListener('click', confirmSubmitOrder);
  document.getElementById('orderForm')?.addEventListener('submit', event => {
    event.preventDefault();
    submitOrder();
  });

  initSamplesGridInteractions();
  loadSamples();

  return {
    closeSampleConfirmModal,
    closeSampleModal
  };
}
