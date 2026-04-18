export function cleanLeadingIcon(text = '') {
  return String(text || '').replace(/^[^\u0980-\u09FFA-Za-z0-9]+/u, '').trim();
}

export function syncPressedState(buttons, isActive) {
  buttons.forEach(button => {
    const active = Boolean(isActive(button));
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

export function buildRelativeUrl(target, state = {}) {
  const url = new URL(String(target || window.location.href), window.location.href);

  Object.entries(state).forEach(([key, rawValue]) => {
    if (rawValue === null || rawValue === undefined) {
      url.searchParams.delete(key);
      return;
    }

    const value = typeof rawValue === 'string'
      ? rawValue.trim()
      : String(rawValue).trim();

    if (!value) {
      url.searchParams.delete(key);
      return;
    }

    url.searchParams.set(key, value);
  });

  return url.origin === window.location.origin
    ? `${url.pathname}${url.search}${url.hash}`
    : url.toString();
}

export function replaceUrlState(target, state = {}) {
  history.replaceState(null, '', buildRelativeUrl(target, state));
}
