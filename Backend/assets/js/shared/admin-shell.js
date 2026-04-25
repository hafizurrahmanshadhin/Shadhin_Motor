(() => {
  const PAGE_NAME = window.SMAdmin?.page || window.PAGE || document.body?.dataset.page || "";
  const ROLE_STORAGE_KEY = "sm_role_preview";
  const ROLE_LABELS = {
    superadmin: "Super Admin",
    admin: "Admin",
    subadmin: "Sub Admin",
    manager: "Manager",
    employee: "Employee",
    finance: "Finance",
    editor: "Content Editor",
    user: "User"
  };
  const ROLE_PERMISSIONS = {
    superadmin: ["*"],
    admin: ["dashboard", "orders", "samples", "gallery", "reviews", "frontend-content", "media", "employees"],
    subadmin: ["dashboard", "orders", "samples", "gallery", "reviews", "media", "employees"],
    manager: ["dashboard", "orders", "samples", "gallery", "reviews", "frontend-content", "employees", "wages", "finance"],
    employee: ["dashboard", "employees", "wages"],
    finance: ["dashboard", "orders", "finance"],
    editor: ["dashboard", "samples", "gallery", "reviews", "frontend-content", "media"],
    user: ["dashboard", "orders"]
  };
  const DYNAMIC_NAV_ITEMS = [
    {
      section: "Content",
      after: "gallery",
      key: "reviews",
      href: "reviews.html",
      icon: "bi bi-star-fill",
      label: "Reviews",
      badge: "9"
    },
    {
      section: "Content",
      after: "reviews",
      key: "frontend-content",
      href: "frontend-content.html",
      icon: "bi bi-layout-text-window-reverse",
      label: "Frontend Content"
    },
    {
      section: "Content",
      after: "frontend-content",
      key: "media",
      href: "media.html",
      icon: "bi bi-folder2-open",
      label: "Media Library"
    },
    {
      section: "Management",
      after: "finance",
      key: "users",
      href: "users.html",
      icon: "bi bi-person-gear",
      label: "Users"
    },
    {
      section: "Management",
      after: "users",
      key: "roles",
      href: "roles.html",
      icon: "bi bi-shield-lock-fill",
      label: "Roles & Permissions"
    }
  ];
  let notifOpen = false;
  let userOpen = false;
  let profileState = {};
  let activeRole = getStoredRole();

  function getStoredRole() {
    try {
      const saved = window.localStorage.getItem(ROLE_STORAGE_KEY);
      return ROLE_LABELS[saved] ? saved : "superadmin";
    } catch {
      return "superadmin";
    }
  }

  function setStoredRole(role) {
    const nextRole = ROLE_LABELS[role] ? role : "superadmin";
    activeRole = nextRole;
    try {
      window.localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
    } catch {
      // Static file previews may block storage.
    }
    applyPermissionVisibility();
  }

  function hasPermission(moduleKey) {
    if (!moduleKey || moduleKey === "dashboard") return true;
    const permissions = ROLE_PERMISSIONS[activeRole] || ROLE_PERMISSIONS.user;
    return permissions.includes("*") || permissions.includes(moduleKey);
  }

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
    const panel = document.getElementById("userDrop");
    panel?.classList.remove("show");
    panel?.setAttribute("aria-hidden", "true");
    document.getElementById("uChev")?.classList.remove("up");
    document.getElementById("userBtn")?.setAttribute("aria-expanded", "false");
  }

  function closeNotif() {
    notifOpen = false;
    const panel = document.getElementById("notifPanel");
    panel?.classList.remove("show");
    panel?.setAttribute("aria-hidden", "true");
    document.getElementById("notifBtn")?.setAttribute("aria-expanded", "false");
  }

  function refreshNotifState() {
    const unread = document.querySelectorAll("#nList .n-item.unread").length;
    const dot = document.getElementById("nDot");
    if (dot) dot.hidden = unread <= 0;
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
    window.toast?.("success", "All notifications marked as read");
  }

  function togNotif() {
    notifOpen = !notifOpen;
    const panel = document.getElementById("notifPanel");
    panel?.classList.toggle("show", notifOpen);
    panel?.setAttribute("aria-hidden", String(!notifOpen));
    document.getElementById("notifBtn")?.setAttribute("aria-expanded", String(notifOpen));
    if (notifOpen) closeUser();
  }

  function togUser() {
    userOpen = !userOpen;
    const panel = document.getElementById("userDrop");
    panel?.classList.toggle("show", userOpen);
    panel?.setAttribute("aria-hidden", String(!userOpen));
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
      document.body.classList.toggle("sb-mobile-open", isOpen);
      overlay.hidden = !isOpen;
      overlay.setAttribute("aria-hidden", String(!isOpen));
      document.getElementById("sbToggle")?.setAttribute("aria-expanded", String(isOpen));
      return;
    }

    document.body.classList.remove("sb-mobile-open");
    document.body.classList.toggle("sb-collapsed");
    document
      .getElementById("sbToggle")
      ?.setAttribute("aria-expanded", String(!document.body.classList.contains("sb-collapsed")));
    sidebar.classList.remove("open");
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
  }

  function closeSB() {
    document.getElementById("sb")?.classList.remove("open");
    document.body.classList.remove("sb-mobile-open");
    const overlay = document.getElementById("sb-overlay");
    if (overlay) {
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
    }
    const expanded = window.innerWidth >= 992 && !document.body.classList.contains("sb-collapsed");
    document.getElementById("sbToggle")?.setAttribute("aria-expanded", String(expanded));
  }

  function getProfileSnapshot() {
    return {
      name:
        document.getElementById("tbName")?.textContent.trim() ||
        profileState.name ||
        "",
      email: document.getElementById("udEmail")?.textContent.trim() || profileState.email || "",
      bio: document.getElementById("pro_b")?.value?.trim() || profileState.bio || ""
    };
  }

  function updateProfileUI(nextProfile) {
    profileState = { ...profileState, ...nextProfile };

    ["tbName", "udName", "proName"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = profileState.name;
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
    const currentProfile = getProfileSnapshot();

    const nextProfile = {
      name: nameInput?.value.trim() || currentProfile.name,
      email: emailInput?.value.trim() || currentProfile.email,
      bio: bioInput?.value.trim() || currentProfile.bio
    };

    updateProfileUI(nextProfile);
    closeMo("moProfile");
    closeUser();
    window.toast?.("success", "Profile updated", "Static preview only");
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
        window.toast?.("success", success, desc);
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
          event.preventDefault();
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

      const mobileNavLink = event.target.closest("#sb.open a[href]");
      if (mobileNavLink && window.innerWidth < 992) {
        closeSB();
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

    const sidebar = document.getElementById("sb");
    const sidebarNav = sidebar?.querySelector(".sb-nav");
    if (sidebar && sidebarNav) {
      sidebar.addEventListener(
        "wheel",
        event => {
          if (window.innerWidth >= 992 || !sidebar.classList.contains("open")) return;
          sidebarNav.scrollTop += event.deltaY;
          event.preventDefault();
        },
        { passive: false }
      );
    }

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 992) closeSB();
    });

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      closeNotif();
      closeUser();
      closeSB();
    });
  }

  function findSidebarSection(title) {
    return Array.from(document.querySelectorAll("#sb .sb-sec")).find(section => {
      return section.textContent.trim().toLowerCase() === String(title || "").trim().toLowerCase();
    });
  }

  function createNavRow(item) {
    const link = document.createElement("a");
    link.className = "nav-row";
    link.dataset.nav = item.key;
    link.dataset.permission = item.key;
    link.href = item.href;

    const iconWrap = document.createElement("span");
    iconWrap.className = "ic";
    const icon = document.createElement("i");
    icon.className = item.icon;
    iconWrap.append(icon);

    link.append(iconWrap, document.createTextNode(item.label));

    if (item.badge) {
      const badge = document.createElement("span");
      badge.className = "nav-n";
      badge.textContent = item.badge;
      link.append(badge);
    }

    return link;
  }

  function ensureDynamicNavigation() {
    const nav = document.querySelector("#sb .sb-nav");
    if (!nav) return;

    DYNAMIC_NAV_ITEMS.forEach(item => {
      if (nav.querySelector(`[data-nav="${item.key}"]`)) return;

      const row = createNavRow(item);
      const after = nav.querySelector(`[data-nav="${item.after}"]`);
      if (after) {
        after.insertAdjacentElement("afterend", row);
        return;
      }

      const section = findSidebarSection(item.section);
      if (section) {
        section.insertAdjacentElement("afterend", row);
        return;
      }

      const divider = nav.querySelector(".sb-div");
      nav.insertBefore(row, divider || null);
    });
  }

  function ensureRolePreviewControl() {
    const topbarRight = document.querySelector("#tb .tb-r");
    if (!topbarRight || document.getElementById("rolePreviewSelect")) return;

    const select = document.createElement("select");
    select.id = "rolePreviewSelect";
    select.className = "role-preview-select d-none d-lg-block";
    select.setAttribute("aria-label", "Preview admin role permissions");
    select.title = "Preview sidebar permissions";

    Object.entries(ROLE_LABELS).forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.append(option);
    });

    select.value = activeRole;
    select.addEventListener("change", () => {
      setStoredRole(select.value);
      window.toast?.("info", "Role preview updated", `${ROLE_LABELS[activeRole]} permissions are now visible.`);
    });

    topbarRight.insertBefore(select, topbarRight.firstElementChild);
  }

  function syncRolePreviewUi() {
    const select = document.getElementById("rolePreviewSelect");
    if (select) select.value = activeRole;

    const roleName = ROLE_LABELS[activeRole] || "Super Admin";
    document.querySelectorAll("[data-current-role-label]").forEach(node => {
      node.textContent = roleName;
    });
  }

  function ensurePermissionNotice() {
    const main = document.getElementById("main");
    if (!main || document.getElementById("permissionBlocked")) return;

    const notice = document.createElement("section");
    notice.id = "permissionBlocked";
    notice.className = "permission-blocked";
    notice.hidden = true;
    notice.innerHTML = `
      <span class="permission-blocked-icon"><i class="bi bi-shield-lock-fill"></i></span>
      <h2>Module access restricted</h2>
      <p>This static preview follows role permissions. Switch to Super Admin or update the role permission matrix before opening this module.</p>
    `;

    const footer = main.querySelector(".app-foot");
    if (footer) {
      main.insertBefore(notice, footer);
      return;
    }

    main.append(notice);
  }

  function syncCurrentPageAccess() {
    if (!PAGE_NAME) return;

    ensurePermissionNotice();
    const allowed = hasPermission(PAGE_NAME);
    const notice = document.getElementById("permissionBlocked");
    if (notice) notice.hidden = allowed;

    document.querySelectorAll("#main > .page-shell").forEach(section => {
      section.hidden = !allowed;
    });

    if (!allowed) {
      document.body.dataset.permissionWarning = "true";
    } else {
      delete document.body.dataset.permissionWarning;
    }
  }

  function syncSidebarSectionVisibility() {
    document.querySelectorAll("#sb .sb-sec").forEach(section => {
      let sibling = section.nextElementSibling;
      let hasVisibleModule = false;

      while (sibling && !sibling.classList.contains("sb-sec")) {
        if (sibling.matches?.("[data-nav]") && !sibling.hidden) {
          hasVisibleModule = true;
        }
        sibling = sibling.nextElementSibling;
      }

      section.hidden = !hasVisibleModule;
    });
  }

  function applyPermissionVisibility() {
    document.querySelectorAll("#sb [data-nav], [data-permission-gate]").forEach(node => {
      const moduleKey = node.dataset.permissionGate || node.dataset.nav || "";
      node.hidden = !hasPermission(moduleKey);
    });

    syncSidebarSectionVisibility();
    syncRolePreviewUi();
    syncCurrentPageAccess();
  }

  function syncShellState() {
    ensureDynamicNavigation();
    ensureRolePreviewControl();
    applyPermissionVisibility();

    document.querySelectorAll(".nav-row[data-nav], .sb-settings[data-nav]").forEach(link => {
      const active = link.dataset.nav === PAGE_NAME;
      link.classList.toggle("on", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    document.getElementById("notifPanel")?.setAttribute("aria-hidden", "true");
    document.getElementById("userDrop")?.setAttribute("aria-hidden", "true");
    const overlay = document.getElementById("sb-overlay");
    if (overlay) {
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
    }
  }

  function initAdminShell() {
    bindShellChrome();
    bindStaticForms();

    const finishShellInit = () => {
      syncShellState();
      refreshNotifState();
    };

    if (window.runPreloader) {
      window.runPreloader(finishShellInit);
      return;
    }

    finishShellInit();
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("app") && document.getElementById("sb")) initAdminShell();
  });

  window.SMAdmin = {
    ...(window.SMAdmin || {}),
    permissions: {
      roles: ROLE_LABELS,
      rolePermissions: ROLE_PERMISSIONS,
      getRole: () => activeRole,
      setRole: setStoredRole,
      hasPermission
    },
    shell: {
      openMo,
      closeMo,
      closeUser,
      readAll,
      readN,
      togNotif,
      togUser,
      togSB,
      closeSB,
      saveProfile
    }
  };

  window.openMo = openMo;
  window.closeMo = closeMo;
  window.closeUser = closeUser;
  window.readAll = readAll;
  window.readN = readN;
  window.togNotif = togNotif;
  window.togUser = togUser;
  window.togSB = togSB;
  window.closeSB = closeSB;
  window.saveProfile = saveProfile;
})();
