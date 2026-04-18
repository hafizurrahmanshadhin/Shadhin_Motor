const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

function openDialogModal(dialog) {
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

function closeDialogModal(dialog) {
  if (!dialog) return;

  dialog.classList.remove('open');

  if (typeof dialog.close === 'function' && dialog.open) {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
}

function sanitizeColor(value, fallback) {
  const color = String(value || '').trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)) {
    return color;
  }

  return fallback;
}

export function createSamplesCatalogModal({ grid, getUiText }) {
  const modalOverlay = document.getElementById('sampleModal');
  const orderBtn = document.getElementById('sampleModalOrderBtn');

  let modalSample = null;
  let lastSampleTrigger = null;

  const getSampleFromCard = card => {
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
      swatchFallback: card.querySelector('.swatch-no-img')?.textContent?.trim() || ''
    };
  };

  const findSampleById = sampleId => {
    const card = grid.querySelector(`.sample-card[data-sample-id="${CSS.escape(sampleId)}"]`);
    return card ? getSampleFromCard(card) : null;
  };

  const orderSample = sampleId => {
    const sample = findSampleById(sampleId);
    if (!sample || !sample.available) return;
    window.location.href = `index.html?sample=${encodeURIComponent(sampleId)}#contact`;
  };

  const openSampleModal = (id, triggerEl = null) => {
    const sample = findSampleById(id);
    if (!sample || !modalOverlay || !orderBtn) return;

    modalSample = sample;
    lastSampleTrigger = triggerEl instanceof HTMLElement
      ? triggerEl
      : (document.activeElement instanceof HTMLElement ? document.activeElement : null);

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

    const imageEl = document.getElementById('sampleModalImg');
    imageEl.src = sample.img || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    imageEl.alt = sample.img ? `${sample.name} (${sample.id})` : getUiText('modalPreviewAlt');
    imageEl.hidden = !sample.img;
    imageEl.onerror = () => {
      imageEl.hidden = true;
    };

    document.getElementById('sampleModalSwatchFallback').textContent = sample.swatchFallback || '';

    orderBtn.disabled = !sample.available;
    orderBtn.textContent = sample.available
      ? getUiText('modalOrderAvailableLabel')
      : getUiText('modalOrderUnavailableLabel');

    openDialogModal(modalOverlay);
    const firstFocusable = modalOverlay.querySelector(FOCUSABLE_SELECTOR);
    if (firstFocusable) firstFocusable.focus();
  };

  const closeSampleModal = () => {
    if (!modalOverlay) return;
    closeDialogModal(modalOverlay);
    if (lastSampleTrigger) lastSampleTrigger.focus();
  };

  grid.querySelectorAll('.sample-card-swatch img').forEach(imageEl => {
    imageEl.addEventListener('error', () => {
      imageEl.remove();
    }, { once: true });
  });

  grid.addEventListener('click', event => {
    const orderButton = event.target.closest('[data-order-sample-id]');
    if (orderButton) {
      event.stopPropagation();
      orderSample(orderButton.dataset.orderSampleId);
      return;
    }

    const previewTrigger = event.target.closest('.sample-card-preview[data-preview-sample-id]');
    if (!previewTrigger || !grid.contains(previewTrigger)) return;
    event.preventDefault();
    openSampleModal(previewTrigger.dataset.previewSampleId, previewTrigger);
  });

  grid.addEventListener('keydown', event => {
    if (event.key !== ' ') return;

    const previewTrigger = event.target.closest('.sample-card-preview[data-preview-sample-id]');
    if (!previewTrigger || !grid.contains(previewTrigger)) return;

    event.preventDefault();
    openSampleModal(previewTrigger.dataset.previewSampleId, previewTrigger);
  });

  document.getElementById('sampleModalCloseBtn')?.addEventListener('click', closeSampleModal);
  modalOverlay?.addEventListener('click', event => {
    if (event.target === event.currentTarget) closeSampleModal();
  });
  modalOverlay?.addEventListener('cancel', event => {
    event.preventDefault();
    closeSampleModal();
  });
  orderBtn?.addEventListener('click', () => {
    if (!modalSample) return;
    orderSample(modalSample.id);
  });
}
