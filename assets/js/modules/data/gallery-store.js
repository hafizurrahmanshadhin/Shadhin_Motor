import { cloneDefaultGallery, storageKeys } from '../../site-config.js';

export const GALLERY_STORAGE_KEY = storageKeys.gallery || 'ac_gallery';
export const CAT_LABELS = Object.freeze({
  car: 'প্রাইভেট কার',
  bike: 'মোটরসাইকেল',
  repair: 'রিপেয়ার',
  all: 'সব'
});
export const CAT_ICONS = Object.freeze({
  car: '🚗',
  bike: '🏍️',
  repair: '🔧'
});

const GALLERY_FILTER_VALUES = new Set(['all', 'car', 'bike', 'repair']);

export function normalizeGalleryFilter(value) {
  return GALLERY_FILTER_VALUES.has(value) ? value : 'all';
}

export function normalizeModels(item = {}) {
  const fromArray = Array.isArray(item.models) ? item.models : [];
  const fromStrings = [item.model, item.vehicleModel]
    .filter(value => typeof value === 'string' && value.trim())
    .flatMap(value => value.split(/[,;|]+/));

  return [...new Set([...fromArray, ...fromStrings]
    .map(value => String(value).trim())
    .filter(Boolean))];
}

export function normalizeGalleryItem(item = {}, index = 0) {
  const safeCat = ['car', 'bike', 'repair'].includes(item.cat) ? item.cat : 'car';

  return {
    ...item,
    id: item.id || `G${index + 1}`,
    title: item.title || item.name || `${CAT_LABELS[safeCat]} ডিজাইন ${String(index + 1).padStart(2, '0')}`,
    desc: item.desc || item.description || 'ডিটেইল দেখতে ক্লিক করুন',
    cat: safeCat,
    img: typeof item.img === 'string' ? item.img.trim() : '',
    models: normalizeModels(item)
  };
}

export function loadGalleryFromStorage(storage = window.localStorage, fallbackGallery = cloneDefaultGallery()) {
  const defaultGallery = fallbackGallery.map(normalizeGalleryItem);
  let stored = null;

  try {
    stored = storage.getItem(GALLERY_STORAGE_KEY);
  } catch {
    stored = null;
  }

  if (!stored) {
    return defaultGallery;
  }

  try {
    const parsed = JSON.parse(stored);
    const items = Array.isArray(parsed) ? parsed.map(normalizeGalleryItem) : [];
    const hasStoredImages = items.some(item => item.img.trim());
    return hasStoredImages ? items : defaultGallery;
  } catch {
    return defaultGallery;
  }
}

export function getPrimaryModel(item) {
  return Array.isArray(item?.models) && item.models.length ? String(item.models[0]).trim() : '';
}

export function getGroupLabel(item) {
  const explicit = [item?.groupLabel, item?.galleryGroup, item?.groupKey]
    .find(value => typeof value === 'string' && value.trim());

  return explicit ? explicit.trim() : (getPrimaryModel(item) || item?.title || '');
}

export function getGroupKey(item) {
  return getGroupLabel(item).toLowerCase();
}

export function buildGroupCountMap(items = []) {
  const map = new Map();
  items.forEach(item => {
    const key = getGroupKey(item);
    map.set(key, (map.get(key) || 0) + 1);
  });
  return map;
}

export function getGallerySearchText(item) {
  return [
    item.title,
    item.desc,
    CAT_LABELS[item.cat] || item.cat,
    ...(Array.isArray(item.models) ? item.models : [])
  ].join(' ').toLowerCase();
}
