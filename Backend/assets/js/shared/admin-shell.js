let notifOpen = false;
let userOpen = false;
let profileState = {
  name: "Admin",
  email: "admin@shadhinmotor.com",
  bio: "Shop owner & manager"
};

function getModalInstance(id) {
  const el = document.getElementById(id);
  if (!el || !window.bootstrap?.Modal) return null;
  return bootstrap.Modal.getOrCreateInstance(el);
}

function openMo(id) {
  if (id === "moProfile") fillProfileForm();
  getModalInstance(id)?.show();
}

function closeMo(id) {
  getModalInstance(id)?.hide();
}

function closeUser() {
  userOpen = false;
  document.getElementById("userDrop")?.classList.remove("show");
  document.getElementById("uChev")?.classList.remove("up");
  document.getElementById("userBtn")?.setAttribute("aria-expanded", "false");
}

function closeNotif() {
  notifOpen = false;
  document.getElementById("notifPanel")?.classList.remove("show");
  document.getElementById("notifBtn")?.setAttribute("aria-expanded", "false");
}

function refreshNotifState() {
  const unread = document.querySelectorAll("#nList .n-item.unread").length;
  const dot = document.getElementById("nDot");
  if (dot) dot.style.display = unread > 0 ? "block" : "none";
}

function readN(item) {
  const row = item?.closest ? item.closest(".n-item") : null;
  if (!row) return;
  row.classList.remove("unread");
  row.querySelector(".n-dot")?.remove();
  refreshNotifState();
}

function readAll() {
  document.querySelectorAll("#nList .n-item.unread").forEach(item => {
    item.classList.remove("unread");
    item.querySelector(".n-dot")?.remove();
  });
  refreshNotifState();
  toast("success", "All notifications marked as read");
}

function togNotif() {
  notifOpen = !notifOpen;
  document.getElementById("notifPanel")?.classList.toggle("show", notifOpen);
  document.getElementById("notifBtn")?.setAttribute("aria-expanded", String(notifOpen));
  if (notifOpen) closeUser();
}

function togUser() {
  userOpen = !userOpen;
  document.getElementById("userDrop")?.classList.toggle("show", userOpen);
  document.getElementById("uChev")?.classList.toggle("up", userOpen);
  document.getElementById("userBtn")?.setAttribute("aria-expanded", String(userOpen));
  if (userOpen) closeNotif();
}

function togSB() {
  const isMobile = window.innerWidth < 992;
  const sidebar = document.getElementById("sb");
  const overlay = document.getElementById("sb-overlay");
  if (!sidebar || !overlay) return;

  if (isMobile) {
    const isOpen = sidebar.classList.toggle("open");
    overlay.style.display = isOpen ? "block" : "none";
    return;
  }

  document.body.classList.toggle("sb-collapsed");
  sidebar.classList.remove("open");
  overlay.style.display = "none";
}

function closeSB() {
  document.getElementById("sb")?.classList.remove("open");
  const overlay = document.getElementById("sb-overlay");
  if (overlay) overlay.style.display = "none";
}

function getProfileSnapshot() {
  return {
    name:
      document.getElementById("tbName")?.textContent.trim() ||
      document.getElementById("sbName")?.textContent.trim() ||
      profileState.name,
    email: document.getElementById("udEmail")?.textContent.trim() || profileState.email,
    bio: document.getElementById("pro_b")?.value?.trim() || profileState.bio
  };
}

function updateProfileUI(nextProfile) {
  profileState = { ...profileState, ...nextProfile };

  ["sbName", "tbName", "udName", "proName"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = profileState.name;
  });

  ["sbAv", "tbAv", "proAv"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = profileState.name.charAt(0).toUpperCase();
  });

  const emailEl = document.getElementById("udEmail");
  if (emailEl) emailEl.textContent = profileState.email;
}

function fillProfileForm() {
  profileState = getProfileSnapshot();
  const nameInput = document.getElementById("pro_n");
  const emailInput = document.getElementById("pro_e");
  const bioInput = document.getElementById("pro_b");

  if (nameInput) nameInput.value = profileState.name;
  if (emailInput) emailInput.value = profileState.email;
  if (bioInput) bioInput.value = profileState.bio;
}

function saveProfile() {
  const nameInput = document.getElementById("pro_n");
  const emailInput = document.getElementById("pro_e");
  const bioInput = document.getElementById("pro_b");

  const nextProfile = {
    name: nameInput?.value.trim() || "Admin",
    email: emailInput?.value.trim() || "admin@shadhinmotor.com",
    bio: bioInput?.value.trim() || "Shop owner & manager"
  };

  updateProfileUI(nextProfile);
  closeMo("moProfile");
  closeUser();
  toast("success", "Profile updated", "Static preview only");
}

function bindStaticForms() {
  document.querySelectorAll("form[data-static-form]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      event.stopPropagation();
      form.classList.add("was-validated");

      if (typeof form.checkValidity === "function" && !form.checkValidity()) return;

      const success = form.dataset.successTitle || "Saved";
      const desc = form.dataset.successText || "Static preview only";
      const modal = form.closest(".modal");
      if (modal && window.bootstrap?.Modal) {
        bootstrap.Modal.getInstance(modal)?.hide();
      }
      toast("success", success, desc);
    });
  });
}

function bindShellChrome() {
  document.addEventListener("click", event => {
    const modalTrigger = event.target.closest("[data-modal-open]");
    if (modalTrigger) {
      const targetId = modalTrigger.dataset.modalOpen;
      if (targetId) {
        event.preventDefault();
        openMo(targetId);
        return;
      }
    }

    const actionEl = event.target.closest("[data-action]");
    if (actionEl) {
      const action = actionEl.dataset.action;

      if (action === "noop") {
        event.preventDefault();
        return;
      }

      if (action === "sidebar-close") {
        closeSB();
        return;
      }

      if (action === "sidebar-toggle") {
        togSB();
        return;
      }

      if (action === "theme-toggle") {
        event.preventDefault();
        togTheme();
        return;
      }

      if (action === "notif-toggle") {
        event.preventDefault();
        togNotif();
        return;
      }

      if (action === "notif-read-all") {
        event.preventDefault();
        readAll();
        return;
      }

      if (action === "user-toggle") {
        event.preventDefault();
        togUser();
        return;
      }

      if (action === "profile-save") {
        event.preventDefault();
        saveProfile();
        return;
      }
    }

    const notifItem = event.target.closest("#nList .n-item");
    if (notifItem) {
      readN(notifItem);
      return;
    }

    if (!event.target.closest("#userDrop, [data-action='user-toggle']")) {
      closeUser();
    }

    if (!event.target.closest("#notifPanel, [data-action='notif-toggle']")) {
      closeNotif();
    }
  });

  const mainEl = document.getElementById("main");
  if (mainEl) {
    mainEl.addEventListener("scroll", () => {
      document.getElementById("tb")?.classList.toggle("scrolled", mainEl.scrollTop > 10);
    });
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 992) closeSB();
  });
}

function syncShellState() {
  document.querySelectorAll(".nav-row[data-nav]").forEach(link => {
    const active = link.dataset.nav === PAGE;
    link.classList.toggle("on", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function initAdminShell() {
  bindShellChrome();
  bindStaticForms();
  updateProfileUI(getProfileSnapshot());

  runPreloader(() => {
    syncShellState();
    refreshNotifState();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (PAGE && PAGE !== "login") initAdminShell();
});

window.openMo = openMo;
window.closeUser = closeUser;
window.readAll = readAll;
window.readN = readN;
window.togNotif = togNotif;
window.togUser = togUser;
window.togSB = togSB;
window.closeSB = closeSB;
window.saveProfile = saveProfile;
