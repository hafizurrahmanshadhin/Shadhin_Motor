import { cloneDefaultSamples, storageKeys } from '../../site-config.js';

export const SAMPLE_STORAGE_KEY = storageKeys.samples || 'ac_samples';
export const SELECTED_SAMPLE_STORAGE_KEY = storageKeys.selectedSample || 'ac_selected_sample_id';

const SAMPLE_FILTER_VALUES = new Set(['all', 'rexine', 'leather']);

export function normalizeSampleFilter(value) {
  return SAMPLE_FILTER_VALUES.has(value) ? value : 'all';
}

export function normalizeSampleMaterial(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw.includes('leather') || raw.includes('চামড়') || raw.includes('চামড়া') || raw.includes('লেদার')) {
    return 'leather';
  }

  return 'rexine';
}

export function sanitizeColor(value, fallback) {
  const color = String(value || '').trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)) {
    return color;
  }

  return fallback;
}

export function normalizeSampleItem(sample, index = 0) {
  const material = normalizeSampleMaterial(sample?.material);
  const fallbackPrefix = material === 'rexine' ? 'RX' : 'LT';
  const fallbackHex = material === 'rexine' ? '#3d2010' : '#3b1f0a';

  return {
    ...sample,
    id: String(sample?.id || `${fallbackPrefix}-${String(index + 1).padStart(3, '0')}`),
    name: sample?.name || `${material === 'rexine' ? 'রেক্সিন' : 'লেদার'} স্যাম্পল`,
    material,
    color: sample?.color || 'রং উল্লেখ নেই',
    hex: sanitizeColor(sample?.hex, fallbackHex),
    available: sample?.available !== false,
    img: typeof sample?.img === 'string' ? sample.img.trim() : '',
    note: typeof sample?.note === 'string' ? sample.note.trim() : ''
  };
}

export function isFeaturedSample(sample = {}) {
  return ['featured', 'showOnHome', 'home', 'isFeatured', 'popular', 'bestSeller', 'topSeller', 'homeFeatured']
    .some(key => {
      const value = sample[key];
      return value === true || value === 1 || value === '1' || value === 'true' || value === 'yes';
    });
}

export function loadSamplesFromStorage(storage = window.localStorage, fallbackSamples = cloneDefaultSamples()) {
  const defaultSamples = fallbackSamples.map(normalizeSampleItem);
  let stored = null;

  try {
    stored = storage.getItem(SAMPLE_STORAGE_KEY);
  } catch {
    stored = null;
  }

  if (!stored) {
    return defaultSamples;
  }

  try {
    const parsed = JSON.parse(stored);
    const items = Array.isArray(parsed) ? parsed.map(normalizeSampleItem) : [];
    return items.length ? items : defaultSamples;
  } catch {
    return defaultSamples;
  }
}

export function getSampleSearchText(sample) {
  return [
    sample.id,
    sample.name,
    sample.color,
    sample.note,
    sample.material === 'rexine' ? 'রেক্সিন Rexine' : 'লেদার Leather'
  ].join(' ').toLowerCase();
}
