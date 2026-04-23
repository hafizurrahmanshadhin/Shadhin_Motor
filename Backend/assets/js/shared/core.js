const PAGE = document.body?.dataset.page || "";

function getStoredTheme() {
  try {
    return window.localStorage.getItem("sm_theme");
  } catch {
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    window.localStorage.setItem("sm_theme", theme);
  } catch {
    // Ignore storage failures in file previews or restrictive browser modes.
  }
}

let curTheme =
  getStoredTheme() ||
  document.documentElement.getAttribute("data-theme") ||
  "dark";

function setThemeIcon(theme) {
  document.querySelectorAll("#themeIc, [data-theme-icon]").forEach(icon => {
    icon.className = theme === "dark" ? "bi bi-moon-stars-fill" : "bi bi-sun-fill";
  });
}

function applyTheme(theme) {
  curTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-bs-theme", theme);
  setStoredTheme(theme);
  setThemeIcon(theme);
}

function togTheme() {
  const nextTheme = curTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  toast(
    "success",
    "Theme changed",
    nextTheme === "dark" ? "Dark mode activated" : "Light mode activated"
  );
}

applyTheme(curTheme);

async function confirm2(title, text = "This action is for static preview only.", icon = "warning") {
  if (!window.Swal) {
    return window.confirm(`${title}\n\n${text}`);
  }

  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: "Yes, continue",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true
  });

  return result.isConfirmed;
}

function toast(type, title, msg = "", dur = 2800) {
  if (!window.Swal) return;

  Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: dur,
    timerProgressBar: true,
    background: "var(--card)",
    color: "var(--txt)"
  }).fire({
    icon: type,
    title: `<span style="font-size:13px;font-weight:700;color:var(--txt)">${title}</span>`,
    html: msg ? `<span style="font-size:11px;color:var(--txt2)">${msg}</span>` : ""
  });
}

function runPreloader(onReady) {
  const preloader = document.getElementById("pre");
  if (!preloader) {
    document.body?.classList.remove("preloading");
    onReady?.();
    return;
  }

  let done = false;
  document.body?.classList.add("preloading");

  const finish = () => {
    if (done) return;
    done = true;
    window.clearTimeout(safety);
    preloader.classList.add("out");
    document.body?.classList.remove("preloading");
    onReady?.();
  };

  const safety = window.setTimeout(finish, 4500);
  window.setTimeout(finish, 950);
}

window.PAGE = PAGE;
window.applyTheme = applyTheme;
window.togTheme = togTheme;
window.confirm2 = confirm2;
window.toast = toast;
window.runPreloader = runPreloader;
