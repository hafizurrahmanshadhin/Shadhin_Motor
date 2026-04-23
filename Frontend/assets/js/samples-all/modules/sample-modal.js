import { buildRelativeUrl } from '../../shared/page-helpers.js';
import {
  escapeAttributeValue,
  getSampleCardData,
  getSampleIdFromCard
} from '../../shared/sample-card.js';
import {
  closeDialog as closeDialogModal,
  focusFirstIn,
  initDialogGlobals,
  isFocusVisible,
  openDialog as openDialogModal,
  restoreFocus,
  syncBodyScrollLockState
} from '../../shared/dialog.js';

export function createSamplesCatalogModal({ grid, getUiText }) {
  initDialogGlobals();

  const modalOverlay = document.getElementById('sampleModal');
  const orderBtn = document.getElementById('sampleModalOrderBtn');
  const orderLink = grid.closest('.samples-catalog-panel')?.querySelector('.samples-catalog-order-link');

  let modalSample = null;
  let lastSampleTrigger = null;
  let keepTriggerFocusOnClose = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchTracking = false;

  const modalCard = modalOverlay?.querySelector('.sample-modal');

  const getSampleFromCard = card => getSampleCardData(card);

  const findSampleById = sampleId => {
    const card = grid.querySelector(`.sample-card[data-sample-id="${escapeAttributeValue(sampleId)}"]`)
      || Array.from(grid.querySelectorAll('.sample-card')).find(entry => getSampleIdFromCard(entry) === sampleId);
    return card ? getSampleFromCard(card) : null;
  };

  const orderSample = sampleId => {
    const sample = findSampleById(sampleId);
    if (!sample || !sample.available) return;

    const sampleParamKey = orderLink?.dataset.orderSampleParam?.trim() || 'sample';
    const targetUrl = orderLink?.getAttribute('href') || window.location.href;
    window.location.assign(buildRelativeUrl(targetUrl, {
      [sampleParamKey]: sampleId
    }));
  };

  const openSampleModal = (id, triggerEl = null) => {
    const sample = findSampleById(id);
    if (!sample || !modalOverlay || !orderBtn) return;

    modalSample = sample;
    lastSampleTrigger = triggerEl instanceof HTMLElement
      ? triggerEl
      : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    keepTriggerFocusOnClose = isFocusVisible(lastSampleTrigger);

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
    syncBodyScrollLockState();
    focusFirstIn(modalOverlay);
  };

  const closeSampleModal = () => {
    if (!modalOverlay) return;
    closeDialogModal(modalOverlay);
    syncBodyScrollLockState();
    if (lastSampleTrigger instanceof HTMLElement && lastSampleTrigger.isConnected) {
      restoreFocus(lastSampleTrigger);
      if (!keepTriggerFocusOnClose) {
        requestAnimationFrame(() => {
          lastSampleTrigger.blur();
        });
      }
    }
  };

  grid.querySelectorAll('.sample-card-swatch img').forEach(imageEl => {
    imageEl.addEventListener('error', () => {
      imageEl.remove();
    }, { once: true });
  });

  grid.addEventListener('click', event => {
    const orderButton = event.target.closest('.sample-card-order-btn');
    if (orderButton) {
      event.stopPropagation();
      const sampleId = getSampleFromCard(orderButton.closest('.sample-card'))?.id || orderButton.dataset.orderSampleId;
      if (sampleId) orderSample(sampleId);
      return;
    }

    const previewTrigger = event.target.closest('a.sample-card-preview, button.sample-card-preview');
    if (!previewTrigger || !grid.contains(previewTrigger)) return;
    event.preventDefault();
    const sampleId = getSampleFromCard(previewTrigger.closest('.sample-card'))?.id || previewTrigger.dataset.previewSampleId;
    if (sampleId) openSampleModal(sampleId, previewTrigger);
  });

  grid.addEventListener('keydown', event => {
    if (event.key !== ' ') return;

    const previewTrigger = event.target.closest('a.sample-card-preview, button.sample-card-preview');
    if (!previewTrigger || !grid.contains(previewTrigger)) return;

    event.preventDefault();
    const sampleId = getSampleFromCard(previewTrigger.closest('.sample-card'))?.id || previewTrigger.dataset.previewSampleId;
    if (sampleId) openSampleModal(sampleId, previewTrigger);
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

  modalCard?.addEventListener('touchstart', event => {
    if (!modalOverlay?.classList.contains('open')) return;
    if (modalCard.scrollTop > 4) return;

    const touch = event.touches?.[0];
    if (!touch) return;

    touchTracking = true;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  modalCard?.addEventListener('touchend', event => {
    if (!touchTracking || !modalOverlay?.classList.contains('open')) return;
    touchTracking = false;

    const touch = event.changedTouches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (deltaY < 88 || deltaY < Math.abs(deltaX) * 1.15) return;
    closeSampleModal();
  }, { passive: true });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!modalOverlay?.classList.contains('open')) return;
    closeSampleModal();
  });
}
