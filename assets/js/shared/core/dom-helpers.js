export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

export const ACTIVATION_KEYS = Object.freeze(new Set(['Enter', ' ']));

export function isActivationKey(event) {
  return ACTIVATION_KEYS.has(event.key);
}

export function escapeHTML(value = '') {
  return String(value ?? '').replace(/[&<>"']/g, char => {
    if (char === '&') return '&amp;';
    if (char === '<') return '&lt;';
    if (char === '>') return '&gt;';
    if (char === '"') return '&quot;';
    return '&#39;';
  });
}

export function escapeAttr(value = '') {
  return escapeHTML(value).replace(/`/g, '&#96;');
}
