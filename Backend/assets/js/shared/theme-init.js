(() => {
  const root = document.documentElement;
  const fallback = root.getAttribute("data-theme") || "dark";
  let theme = fallback;

  try {
    const saved = window.localStorage.getItem("sm_theme");
    if (saved === "light" || saved === "dark") theme = saved;
  } catch {
    // Storage can be unavailable in restricted static previews.
  }

  root.setAttribute("data-theme", theme);
  root.setAttribute("data-bs-theme", theme);
})();
