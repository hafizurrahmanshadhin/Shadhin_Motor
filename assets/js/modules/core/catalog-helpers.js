export function replaceCatalogQuery(basePath, state = {}) {
  const params = new URLSearchParams();

  Object.entries(state).forEach(([key, rawValue]) => {
    if (rawValue === null || rawValue === undefined) return;

    const value = typeof rawValue === 'string'
      ? rawValue.trim()
      : String(rawValue).trim();

    if (!value) return;
    params.set(key, value);
  });

  const query = params.toString();
  history.replaceState(null, '', query ? `${basePath}?${query}` : basePath);
}

export function syncPressedState(buttons, isActive) {
  buttons.forEach(button => {
    const active = Boolean(isActive(button));
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
