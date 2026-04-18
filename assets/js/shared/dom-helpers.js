function normalizeFallback(value = '') {
  return String(value || '').trim();
}

export function getElementText(root, selector, fallback = '') {
  if (!root || typeof root.querySelector !== 'function') {
    return normalizeFallback(fallback);
  }

  const value = root.querySelector(selector)?.textContent?.trim();
  return value || normalizeFallback(fallback);
}

export function getElementAttribute(root, selector, attribute, fallback = '') {
  if (!root || typeof root.querySelector !== 'function') {
    return normalizeFallback(fallback);
  }

  const value = root.querySelector(selector)?.getAttribute(attribute)?.trim();
  return value || normalizeFallback(fallback);
}

export function getImageSource(root, selector, fallback = '') {
  if (!root || typeof root.querySelector !== 'function') {
    return normalizeFallback(fallback);
  }

  const image = root.querySelector(selector);
  if (!(image instanceof HTMLImageElement)) {
    return normalizeFallback(fallback);
  }

  return String(image.currentSrc || image.getAttribute('src') || fallback || '').trim();
}

export function getInlineStyleValue(root, selector, propertyName, fallback = '') {
  if (!root || typeof root.querySelector !== 'function') {
    return normalizeFallback(fallback);
  }

  const node = root.querySelector(selector);
  if (!(node instanceof HTMLElement)) {
    return normalizeFallback(fallback);
  }

  const inlineValue = node.style.getPropertyValue(propertyName).trim();
  if (inlineValue) return inlineValue;

  const styleAttr = String(node.getAttribute('style') || '').trim();
  if (!styleAttr) return normalizeFallback(fallback);

  const matcher = new RegExp(`${propertyName}\\s*:\\s*([^;]+)`, 'i');
  const match = styleAttr.match(matcher);
  return match?.[1]?.trim() || normalizeFallback(fallback);
}
