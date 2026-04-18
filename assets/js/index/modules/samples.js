import {
  buildRelativeUrl,
  cleanLeadingIcon,
  hasServerFormAction,
  submitFormNative,
  syncPressedState
} from '../../shared/page-helpers.js';

function sanitizeColor(value, fallback) {
  const color = String(value || '').trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)) {
    return color;
  }

  return fallback;
}

function openDialog(dialog) {
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

function closeDialog(dialog) {
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
  const currentX = window.scrollX || window.pageXOffset || 0;
  const currentY = window.scrollY || window.pageYOffset || 0;

  if (Math.abs(currentX - restoreX) < 1 && Math.abs(currentY - restoreY) < 1) return;

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

function lockBodyScroll(root, body) {
  if (!root || !body) return;

  body.classList.add('body-scroll-locked');
  body.dataset.scrollLockActive = 'true';
  root.style.overflowY = 'hidden';
}

function unlockBodyScroll(root, body) {
  if (!root || !body) return;

  body.classList.remove('body-scroll-locked');
  body.style.removeProperty('overflow');
  root.style.removeProperty('overflow-y');

  if (body.dataset.scrollLockActive !== 'true') return;

  delete body.dataset.scrollLockActive;

  body.style.removeProperty('position');
  body.style.removeProperty('top');
  body.style.removeProperty('left');
  body.style.removeProperty('right');
  body.style.removeProperty('width');
  body.style.removeProperty('padding-right');
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

  unlockBodyScroll(root, body);
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

export function initHomeSamples() {
  const samplesSection = document.getElementById('samples');
  const grid = document.getElementById('samplesGrid');
  const filterButtons = Array.from(samplesSection?.querySelectorAll('[data-sample-filter]') || []);

  if (!samplesSection || !grid) {
    return {
      closeSampleConfirmModal() {},
      closeSampleModal() {}
    };
  }

  let currentFilter = 'all';
  let selectedSample = null;
  let modalSample = null;
  let sampleModalTrigger = null;
  let sampleModalViewport = null;
  let sampleModalShouldKeepFocus = false;
  let sampleConfirmViewport = null;
  let sampleConfirmShouldKeepFocus = false;
  const orderForm = document.getElementById('orderForm');

  const uiTextRoot = document.getElementById('homeSamplesUiText');
  const sampleParamKey = samplesSection.dataset.sampleParam || 'sample';

  const orderConfirmState = {
    secondaryAction: 'choose-sample',
    lastTrigger: null
  };

  function getUiText(key) {
    const value = uiTextRoot?.querySelector(`[data-key="${key}"]`)?.textContent?.trim();
    return value || '';
  }

  function formatText(template, tokens = {}) {
    return String(template || '').replace(/\{(\w+)\}/g, (_, key) => {
      return Object.prototype.hasOwnProperty.call(tokens, key) ? String(tokens[key] ?? '') : '';
    });
  }

  function isFocusVisible(target) {
    if (!(target instanceof HTMLElement)) return false;

    try {
      return target.matches(':focus-visible');
    } catch {
      return false;
    }
  }

  function getSampleItems() {
    return Array.from(grid.querySelectorAll('.sample-card-item'));
  }

  function getSampleCardById(sampleId) {
    return grid.querySelector(`.sample-card[data-sample-id="${CSS.escape(sampleId)}"]`);
  }

  function getSampleFromCard(card) {
    if (!(card instanceof HTMLElement)) return null;

    const material = card.dataset.material === 'leather' ? 'leather' : 'rexine';
    const fallbackHex = material === 'rexine' ? '#3d2010' : '#3b1f0a';

    return {
      id: card.dataset.sampleId || '',
      name: card.dataset.sampleName || '',
      material,
      color: card.dataset.color || '',
      hex: sanitizeColor(card.dataset.hex, fallbackHex),
      available: card.dataset.available !== 'false',
      note: card.dataset.note || '',
      img: card.dataset.img || '',
      materialLabel: card.querySelector('.sample-card-material-tag')?.textContent?.trim() || '',
      swatchFallback: card.querySelector('.swatch-no-img')?.textContent?.trim() || ''
    };
  }

  function findSampleById(sampleId) {
    const card = getSampleCardById(sampleId);
    return card ? getSampleFromCard(card) : null;
  }

  function getVisibleSampleItems() {
    return getSampleItems().filter(item => !item.hidden);
  }

  function setActiveSampleFilterButton(filterValue) {
    syncPressedState(filterButtons, button => button.dataset.sampleFilter === filterValue);
  }

  function getFilterLabel(filterValue) {
    const button = filterButtons.find(item => item.dataset.sampleFilter === filterValue);
    return cleanLeadingIcon(button?.textContent || filterButtons[0]?.textContent || '') || '';
  }

  function updateSamplesOverview() {
    const visibleTotal = getVisibleSampleItems().length;
    const countEl = samplesSection.querySelector('#samplesCountInfo');
    const viewAllBtn = samplesSection.querySelector('#samplesViewAllBtn');

    if (countEl) {
      countEl.textContent = currentFilter === 'all'
        ? formatText(getUiText('countAllTemplate'), { count: visibleTotal })
        : formatText(getUiText('countFilteredTemplate'), {
          label: getFilterLabel(currentFilter),
          count: visibleTotal
        });
    }

    if (viewAllBtn) {
      if (!viewAllBtn.dataset.baseHref) {
        viewAllBtn.dataset.baseHref = viewAllBtn.getAttribute('href') || '';
      }

      viewAllBtn.href = buildRelativeUrl(viewAllBtn.dataset.baseHref || window.location.href, {
        material: currentFilter === 'all' ? '' : currentFilter
      });
    }
  }

  function updateCardStates() {
    grid.querySelectorAll('.sample-card').forEach(card => {
      const sample = getSampleFromCard(card);
      const isSelected = selectedSample && selectedSample.id === sample?.id;
      const orderBtn = card.querySelector('[data-select-sample-id]');

      card.classList.toggle('selected', Boolean(isSelected));

      if (orderBtn) {
        orderBtn.textContent = isSelected
          ? getUiText('buttonSelectedLabel')
          : (sample?.available
            ? getUiText('buttonDefaultLabel')
            : getUiText('buttonUnavailableLabel'));
      }
    });
  }

  function applyFilter() {
    getSampleItems().forEach(item => {
      const matches = currentFilter === 'all' || item.dataset.material === currentFilter;
      item.hidden = !matches;
    });

    setActiveSampleFilterButton(currentFilter);
    updateSamplesOverview();
  }

  function clearPendingSampleParams() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(sampleParamKey)) return;
    url.searchParams.delete(sampleParamKey);
    const nextQuery = url.searchParams.toString();
    history.replaceState(null, '', `${url.pathname}${nextQuery ? `?${nextQuery}` : ''}${url.hash}`);
  }

  function scrollToSectionById(sectionId, delayMs = 0, block = 'start') {
    const target = document.getElementById(sectionId);
    if (!target) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block });
    }, delayMs);
  }

  function getSampleMaterialLabel(sample) {
    if (sample?.materialLabel) return sample.materialLabel;
    return sample?.material === 'leather'
      ? getUiText('materialLeatherShort')
      : getUiText('materialRexineShort');
  }

  function syncSelectionUi() {
    const bar = document.getElementById('selectedSampleBar');
    const strip = document.getElementById('formSampleStrip');
    const hiddenInput = document.getElementById('selectedSampleId');
    if (!bar || !strip || !hiddenInput) return;

    if (!selectedSample) {
      bar.classList.remove('visible');
      strip.style.display = 'none';
      hiddenInput.value = '';
      updateCardStates();
      return;
    }

    const sampleHex = selectedSample.hex;
    document.getElementById('selectedBarSwatch').style.background = sampleHex;
    document.getElementById('selectedBarName').textContent = `${selectedSample.id} — ${selectedSample.name}`;
    document.getElementById('selectedBarMeta').textContent = `${getSampleMaterialLabel(selectedSample)} · ${selectedSample.color}`;
    bar.classList.add('visible');

    hiddenInput.value = selectedSample.id;
    document.getElementById('formSwatchDot').style.background = sampleHex;
    document.getElementById('formSampleLabel').textContent =
      `${selectedSample.id} — ${selectedSample.name} (${getSampleMaterialLabel(selectedSample)}, ${selectedSample.color})`;
    strip.style.display = 'flex';

    const materialSelect = document.getElementById('material');
    if (materialSelect) {
      materialSelect.value = selectedSample.material === 'rexine'
        ? getUiText('materialRexineLong')
        : getUiText('materialLeatherLong');
    }

    updateCardStates();
  }

  function applyPendingSampleSelection() {
    const params = new URLSearchParams(window.location.search);
    const pendingId = params.get(sampleParamKey) || '';
    if (!pendingId) return;

    clearPendingSampleParams();

    const pendingSample = findSampleById(pendingId);
    if (!pendingSample || !pendingSample.available) return;
    selectedSample = pendingSample;
    syncSelectionUi();
  }

  function openSampleModal(sampleId, triggerEl = null) {
    const sample = findSampleById(sampleId);
    if (!sample) return;

    const modalOverlay = document.getElementById('sampleModal');
    if (!modalOverlay) return;

    modalSample = sample;
    sampleModalTrigger = triggerEl instanceof HTMLElement
      ? triggerEl
      : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    sampleModalViewport = captureViewportPosition();
    sampleModalShouldKeepFocus = isFocusVisible(sampleModalTrigger);

    document.getElementById('sampleModalId').textContent = `${getUiText('modalIdPrefix')} ${sample.id}`;
    document.getElementById('sampleModalIdVal').textContent = sample.id;
    document.getElementById('sampleModalName').textContent = sample.name;
    document.getElementById('sampleModalMaterial').textContent = sample.material === 'rexine'
      ? getUiText('materialRexineLong')
      : getUiText('materialLeatherLong');
    document.getElementById('sampleModalColorDot').style.background = sample.hex;
    document.getElementById('sampleModalColorName').textContent = sample.color;

    const stockEl = document.getElementById('sampleModalStock');
    stockEl.textContent = sample.available
      ? getUiText('modalStockAvailableLabel')
      : getUiText('modalStockUnavailableLabel');
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
    swatchEl.style.backgroundColor = sample.hex;

    const imgEl = document.getElementById('sampleModalImg');
    imgEl.src = sample.img || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    imgEl.alt = sample.img ? `${sample.name} (${sample.id})` : getUiText('modalPreviewAlt');
    imgEl.hidden = !sample.img;
    imgEl.onerror = () => {
      imgEl.hidden = true;
    };

    document.getElementById('sampleModalSwatchFallback').textContent = sample.swatchFallback || '';

    const orderBtn = document.getElementById('sampleModalOrderBtn');
    orderBtn.disabled = !sample.available;
    if (sample.available) {
      orderBtn.textContent = selectedSample && selectedSample.id === sample.id
        ? getUiText('modalOrderSelectedLabel')
        : getUiText('modalOrderAvailableLabel');
    } else {
      orderBtn.textContent = getUiText('modalOrderUnavailableLabel');
    }

    openDialog(modalOverlay);
    syncBodyScrollLockState();
    focusWithoutScroll(document.getElementById('sampleModalCloseBtn'));
  }

  function closeSampleModal(restoreViewport = true) {
    const modalOverlay = document.getElementById('sampleModal');
    if (!modalOverlay) return;

    const viewportState = sampleModalViewport || captureViewportPosition();

    closeDialog(modalOverlay);
    syncBodyScrollLockState();
    restoreFocus(sampleModalTrigger);
    if (restoreViewport) restoreViewportPosition(viewportState);
    if (!sampleModalShouldKeepFocus && sampleModalTrigger instanceof HTMLElement) {
      requestAnimationFrame(() => {
        sampleModalTrigger.blur();
      });
    }
    sampleModalViewport = null;
    sampleModalShouldKeepFocus = false;
  }

  function selectSample(sampleId) {
    const sample = findSampleById(sampleId);
    if (!sample || !sample.available) return;

    selectedSample = sample;
    syncSelectionUi();
    showToast(
      getUiText('toastSampleSelectedTitle'),
      formatText(getUiText('toastSampleSelectedMessage'), {
        sampleId: sample.id,
        sampleName: sample.name
      }),
      4000
    );
  }

  function clearSelectedSample() {
    selectedSample = null;
    syncSelectionUi();
  }

  function selectFromModal() {
    if (!modalSample) return;
    selectSample(modalSample.id);
    closeSampleModal(false);
    scrollToSectionById('contact', 200);
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

    orderConfirmState.lastTrigger = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    sampleConfirmViewport = captureViewportPosition();
    sampleConfirmShouldKeepFocus = isFocusVisible(orderConfirmState.lastTrigger);

    if (selectedSample) {
      orderConfirmState.secondaryAction = 'edit-order';
      badge.textContent = getUiText('confirmSelectedBadge');
      title.textContent = getUiText('confirmSelectedTitle');
      copy.textContent = formatText(
        getUiText('confirmSelectedCopy'),
        { sampleId: selectedSample.id }
      );
      primaryHighlightTitle.textContent = `${selectedSample.id} — ${selectedSample.name}`;
      primaryHighlightCopy.textContent = formatText(
        getUiText('confirmSelectedPrimaryMeta'),
        { material: getSampleMaterialLabel(selectedSample), color: selectedSample.color }
      );
      secondaryHighlightTitle.textContent = getUiText('confirmSelectedSecondaryTitle');
      secondaryHighlightCopy.textContent = getUiText('confirmSelectedSecondaryCopy');
      secondaryBtn.textContent = getUiText('confirmSelectedSecondaryBtn');
      primaryBtn.textContent = getUiText('confirmSelectedPrimaryBtn');
    } else {
      orderConfirmState.secondaryAction = 'choose-sample';
      badge.textContent = getUiText('confirmUnselectedBadge');
      title.textContent = getUiText('confirmUnselectedTitle');
      copy.textContent = getUiText('confirmUnselectedCopy');
      primaryHighlightTitle.textContent = getUiText('confirmUnselectedPrimaryTitle');
      primaryHighlightCopy.textContent = getUiText('confirmUnselectedPrimaryCopy');
      secondaryHighlightTitle.textContent = getUiText('confirmUnselectedSecondaryTitle');
      secondaryHighlightCopy.textContent = getUiText('confirmUnselectedSecondaryCopy');
      secondaryBtn.textContent = getUiText('confirmUnselectedSecondaryBtn');
      primaryBtn.textContent = getUiText('confirmUnselectedPrimaryBtn');
    }

    openDialog(modal);
    syncBodyScrollLockState();
    focusWithoutScroll(primaryBtn);
  }

  function closeSampleConfirmModal(restoreViewport = true) {
    const modal = document.getElementById('sampleConfirmModal');
    if (!modal) return;

    const viewportState = sampleConfirmViewport || captureViewportPosition();

    closeDialog(modal);
    syncBodyScrollLockState();
    restoreFocus(orderConfirmState.lastTrigger);
    if (restoreViewport) restoreViewportPosition(viewportState);
    if (!sampleConfirmShouldKeepFocus && orderConfirmState.lastTrigger instanceof HTMLElement) {
      requestAnimationFrame(() => {
        orderConfirmState.lastTrigger.blur();
      });
    }
    sampleConfirmViewport = null;
    sampleConfirmShouldKeepFocus = false;
  }

  function goChooseSample() {
    closeSampleConfirmModal(false);
    scrollToSectionById('samples', 120, 'start');
    showToast(
      getUiText('toastChooseSampleTitle'),
      getUiText('toastChooseSampleMessage'),
      5000
    );
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
      showToast(
        getUiText('toastIncompleteTitle'),
        getUiText('toastIncompleteMessage')
      );
      return;
    }

    if (!skipSampleConfirmation) {
      openSampleConfirmModal();
      return;
    }

    if (hasServerFormAction(orderForm)) {
      submitFormNative(orderForm);
      return;
    }

    ['custName', 'custPhone', 'carModel', 'orderDetails'].forEach(id => {
      document.getElementById(id).value = '';
    });
    ['vehicleType', 'serviceType', 'material'].forEach(id => {
      document.getElementById(id).selectedIndex = 0;
    });

    clearSelectedSample();

    showToast(
      getUiText('toastOrderSuccessTitle'),
      getUiText('toastOrderSuccessMessage'),
      6000
    );
  }

  grid.querySelectorAll('.sample-card-swatch img').forEach(img => {
    img.addEventListener('error', () => {
      img.remove();
    }, { once: true });
  });

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.sampleFilter || 'all';
      applyFilter();
    });
  });

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
    openSampleModal(previewLink.dataset.previewSampleId, previewLink);
  });

  grid.addEventListener('keydown', event => {
    if (event.key !== ' ') return;
    if (event.target.closest('[data-select-sample-id]')) return;

    const previewLink = event.target.closest('.sample-card-preview[data-preview-sample-id]');
    if (!previewLink || !grid.contains(previewLink)) return;

    event.preventDefault();
    openSampleModal(previewLink.dataset.previewSampleId, previewLink);
  });

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
  document.getElementById('sampleConfirmCloseBtn')?.addEventListener('click', closeSampleConfirmModal);
  document.getElementById('sampleConfirmSecondaryBtn')?.addEventListener('click', handleOrderConfirmSecondaryAction);
  document.getElementById('sampleConfirmPrimaryBtn')?.addEventListener('click', confirmSubmitOrder);
  document.getElementById('selectedSampleOrderBtn')?.addEventListener('click', event => {
    event.preventDefault();
    scrollToSectionById('contact', 100);
  });
  document.getElementById('selectedSampleClearBtn')?.addEventListener('click', clearSelectedSample);
  document.getElementById('formSampleClearBtn')?.addEventListener('click', clearSelectedSample);
  orderForm?.addEventListener('submit', event => {
    event.preventDefault();
    submitOrder();
  });

  window.addEventListener('pageshow', syncBodyScrollLockState);
  window.addEventListener('resize', syncBodyScrollLockState);
  window.addEventListener('orientationchange', syncBodyScrollLockState);
  syncBodyScrollLockState();
  applyFilter();
  syncSelectionUi();
  applyPendingSampleSelection();

  return {
    closeSampleConfirmModal,
    closeSampleModal
  };
}
