(() => {
  const PAGE = document.body?.dataset.page || "";
  const SMAdmin = window.SMAdmin || {};
  window.SMAdmin = SMAdmin;

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

  function escapeToastHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function toast(type, title, msg = "", dur = 2800) {
    if (!window.Swal) return;

    const toastType = ["success", "error", "warning", "info", "question"].includes(type) ? type : "info";
    const safeTitle = escapeToastHtml(title);
    const safeMessage = escapeToastHtml(msg);

    Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      showCloseButton: true,
      timer: dur,
      timerProgressBar: true,
      width: "auto",
      background: "var(--card)",
      color: "var(--txt)",
      customClass: {
        popup: "sm-classic-toast",
        title: "sm-classic-toast-title",
        htmlContainer: "sm-classic-toast-message",
        closeButton: "sm-classic-toast-close",
        timerProgressBar: "sm-classic-toast-progress"
      }
    }).fire({
      icon: toastType,
      title: `<span>${safeTitle}</span>`,
      html: safeMessage ? `<span>${safeMessage}</span>` : ""
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
    window.setTimeout(finish, 720);
  }

  SMAdmin.page = PAGE;
  SMAdmin.ui = {
    applyTheme,
    toggleTheme: togTheme,
    confirm: confirm2,
    toast,
    runPreloader
  };
})();
