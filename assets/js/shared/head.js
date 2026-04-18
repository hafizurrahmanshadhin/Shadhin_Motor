(() => {
  const currentUrl = new URL(window.location.href);
  currentUrl.search = '';
  currentUrl.hash = '';
  const absoluteUrl = currentUrl.toString();

  document.getElementById('canonicalLink')?.setAttribute('href', absoluteUrl);
  document.getElementById('localeLink')?.setAttribute('href', absoluteUrl);
  document.getElementById('ogUrlMeta')?.setAttribute('content', absoluteUrl);

  const structuredData = document.getElementById('pageStructuredData');
  if (!structuredData) return;

  try {
    const payload = JSON.parse(structuredData.textContent);
    const syncUrls = node => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        node.forEach(syncUrls);
        return;
      }

      if (typeof node.url === 'string') {
        node.url = absoluteUrl;
      }

      Object.values(node).forEach(syncUrls);
    };

    syncUrls(payload);
    structuredData.textContent = JSON.stringify(payload);
  } catch {}
})();
