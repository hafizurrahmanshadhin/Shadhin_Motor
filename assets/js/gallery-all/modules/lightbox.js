import { getElementText, getImageSource } from '../../shared/dom-helpers.js';

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

function isFocusVisible(target) {
  if (!(target instanceof HTMLElement)) return false;

  try {
    return target.matches(':focus-visible');
  } catch {
    return false;
  }
}

function normalizeGroupKey(value) {
  return String(value || '')
    .split('|')
    .map(part => part.trim().toLowerCase())
    .filter(Boolean)
    .join('|');
}

export function createGalleryLightbox({ grid, getVisibleTriggers, getFilterLabel }) {
  const overlay = document.getElementById('lightboxOverlay');
  const titleEl = document.getElementById('lightboxTitle');
  const catEl = document.getElementById('lightboxCat');
  const counterEl = document.getElementById('lightboxCounter');
  const imageWrap = document.getElementById('lightboxImgWrap');
  const prevBtn = document.getElementById('lightboxPrevBtn');
  const nextBtn = document.getElementById('lightboxNextBtn');
  const closeBtn = document.getElementById('lightboxCloseBtn');
  const defaultTitle = titleEl?.textContent?.trim() || '';

  let lightboxItems = [];
  let lightboxIdx = 0;
  let lastLightboxTrigger = null;
  let keepTriggerFocusOnClose = false;

  const getTriggerData = trigger => {
    const card = trigger.closest('.gallery-card, .gallery-item');
    const shell = trigger.closest('.gallery-card-item, .gallery-item-shell');
    const models = Array.from(card?.querySelectorAll('.gallery-card-model-pill') || [])
      .map(node => node.textContent?.trim() || '')
      .filter(Boolean);
    const fallbackModels = String(shell?.dataset.models || trigger.dataset.galleryModels || '')
      .split('|')
      .map(value => value.trim())
      .filter(Boolean);
    const cat = shell?.dataset.cat || card?.dataset.cat || trigger.dataset.galleryCat || 'all';
    const groupLabel = models.join(', ') || String(shell?.dataset.group || '').trim() || fallbackModels.join(', ');

    return {
      cat,
      label: getElementText(card, '.gallery-card-cat, .gallery-overlay-cat', getFilterLabel(cat)),
      icon: getElementText(card, '.gallery-card-placeholder-icon, .gallery-item-placeholder-icon', ''),
      title: getElementText(card, '.gallery-card-title, .gallery-overlay-title', trigger.dataset.galleryTitle || defaultTitle),
      img: getImageSource(card, '.gallery-card-img, .gallery-item-img', trigger.dataset.galleryImg || ''),
      groupLabel,
      groupKey: normalizeGroupKey(shell?.dataset.group || trigger.dataset.galleryGroup || models.join('|') || fallbackModels.join('|'))
    };
  };

  const renderPlaceholder = item => {
    if (!imageWrap) return;

    const placeholder = document.createElement('div');
    placeholder.className = 'lightbox-placeholder-full';

    const iconEl = document.createElement('span');
    iconEl.textContent = item.icon || '';

    const labelEl = document.createElement('small');
    labelEl.style.fontSize = '14px';
    labelEl.style.color = 'var(--cream-dim)';
    labelEl.textContent = item.title;

    placeholder.append(iconEl, labelEl);
    imageWrap.replaceChildren(placeholder);
  };

  const render = () => {
    const trigger = lightboxItems[lightboxIdx];
    if (!trigger) return;

    const item = getTriggerData(trigger);
    if (catEl) catEl.textContent = [item.label, item.groupLabel].filter(Boolean).join(' · ');
    if (titleEl) titleEl.textContent = item.title;
    if (counterEl) counterEl.textContent = `${lightboxIdx + 1} / ${lightboxItems.length}`;
    if (!imageWrap) return;

    if (!item.img) {
      renderPlaceholder(item);
      return;
    }

    const image = document.createElement('img');
    image.src = item.img;
    image.alt = item.title;
    image.addEventListener('error', () => renderPlaceholder(item), { once: true });
    imageWrap.replaceChildren(image);
  };

  const open = trigger => {
    if (!(trigger instanceof HTMLElement) || !overlay) return;

    const visibleTriggers = getVisibleTriggers();
    if (!visibleTriggers.length) return;

    const source = getTriggerData(trigger);
    const scopedItems = visibleTriggers.filter(item => {
      const entry = getTriggerData(item);
      if (!source.groupKey) {
        return entry.cat === source.cat;
      }

      return entry.cat === source.cat && entry.groupKey === source.groupKey;
    });

    lightboxItems = scopedItems.length ? scopedItems : visibleTriggers;
    lightboxIdx = Math.max(0, lightboxItems.indexOf(trigger));
    lastLightboxTrigger = trigger;
    keepTriggerFocusOnClose = isFocusVisible(lastLightboxTrigger);
    render();
    openDialogModal(overlay);

    const firstFocusable = overlay.querySelector(FOCUSABLE_SELECTOR);
    if (firstFocusable) firstFocusable.focus();
  };

  const close = event => {
    if (!overlay) return;
    if (event && event.target !== overlay) return;

    closeDialogModal(overlay);
    if (lastLightboxTrigger instanceof HTMLElement && lastLightboxTrigger.isConnected) {
      lastLightboxTrigger.focus();
      if (!keepTriggerFocusOnClose) {
        requestAnimationFrame(() => {
          lastLightboxTrigger.blur();
        });
      }
    }
  };

  const navigate = direction => {
    if (!lightboxItems.length) return;
    lightboxIdx = (lightboxIdx + direction + lightboxItems.length) % lightboxItems.length;
    render();
  };

  grid.addEventListener('click', event => {
    const trigger = event.target.closest('a.gallery-card-trigger, button.gallery-card-trigger, a.gallery-item-trigger, button.gallery-item-trigger');
    if (!trigger || !grid.contains(trigger)) return;
    event.preventDefault();
    open(trigger);
  });

  grid.addEventListener('keydown', event => {
    if (event.key !== ' ') return;
    const trigger = event.target.closest('a.gallery-card-trigger, button.gallery-card-trigger, a.gallery-item-trigger, button.gallery-item-trigger');
    if (!trigger || !grid.contains(trigger)) return;
    event.preventDefault();
    open(trigger);
  });

  overlay?.addEventListener('click', event => {
    if (event.target === overlay) close(event);
  });

  overlay?.addEventListener('cancel', event => {
    event.preventDefault();
    close();
  });

  prevBtn?.addEventListener('click', () => navigate(-1));
  nextBtn?.addEventListener('click', () => navigate(1));
  closeBtn?.addEventListener('click', () => close());

  document.addEventListener('keydown', event => {
    if (!overlay?.classList.contains('open')) return;
    if (event.key === 'ArrowRight') navigate(1);
    if (event.key === 'ArrowLeft') navigate(-1);
    if (event.key === 'Escape') close();
  });
}
