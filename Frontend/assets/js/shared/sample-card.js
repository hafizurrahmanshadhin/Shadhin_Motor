import {
  getElementText,
  getImageSource,
  getInlineStyleValue
} from './dom-helpers.js';

function sanitizeColor(value, fallback) {
  const color = String(value || '').trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)) {
    return color;
  }

  return fallback;
}

function normalizeMaterialKey(value) {
  const material = String(value || '').trim().toLowerCase();
  if (material === 'leather') return 'leather';
  return 'rexine';
}

function resolveAvailability(card, orderButton) {
  const explicit = String(card?.dataset.available || '').trim().toLowerCase();
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;

  if (card?.classList.contains('out-of-stock')) return false;
  if (orderButton?.disabled) return false;
  return true;
}

export function escapeAttributeValue(value) {
  const text = String(value || '');
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(text);
  }

  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function getSampleIdFromCard(card) {
  if (!(card instanceof HTMLElement)) return '';
  return getElementText(card, '.sample-card-id span:first-child', card.dataset.sampleId || '');
}

export function getSampleCardData(card) {
  if (!(card instanceof HTMLElement)) return null;

  const material = normalizeMaterialKey(card.dataset.material);
  const fallbackHex = material === 'rexine' ? '#3d2010' : '#3b1f0a';
  const orderButton = card.querySelector('.sample-card-order-btn');

  return {
    id: getSampleIdFromCard(card),
    name: getElementText(card, '.sample-card-name', card.dataset.sampleName || ''),
    material,
    materialLabel: getElementText(card, '.sample-card-material-tag', card.dataset.material || ''),
    color: getElementText(card, '.sample-card-color-name', card.dataset.color || ''),
    hex: sanitizeColor(
      getInlineStyleValue(card, '.sample-card-color-dot', 'background', '')
      || getInlineStyleValue(card, '.sample-card-color-dot', 'background-color', '')
      || getInlineStyleValue(card, '.sample-card-swatch', 'background-color', '')
      || getInlineStyleValue(card, '.sample-card-swatch', 'background', '')
      || card.dataset.hex,
      fallbackHex
    ),
    available: resolveAvailability(card, orderButton),
    note: getElementText(card, '.sample-card-note', card.dataset.note || ''),
    img: getImageSource(card, '.sample-card-swatch img', card.dataset.img || ''),
    swatchFallback: getElementText(card, '.swatch-no-img', '')
  };
}
