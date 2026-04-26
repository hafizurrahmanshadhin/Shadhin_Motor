export function byId(id) {
  return document.getElementById(id);
}

export function setModalTitle(modalId, title) {
  const modal = byId(modalId);
  const titleEl = modal?.querySelector(".modal-title");
  if (titleEl && title) titleEl.textContent = title;
}

export function resetModalFields(modalId) {
  const modal = byId(modalId);
  if (!modal) return;

  modal.querySelectorAll("input:not([type='hidden']):not([type='checkbox']):not([type='radio']), textarea").forEach(field => {
    field.value = "";
  });

  modal.querySelectorAll("select").forEach(select => {
    select.selectedIndex = 0;
  });

  modal.querySelectorAll("input[type='checkbox']").forEach(input => {
    input.checked = input.dataset.defaultChecked === "true";
  });
}

export function openStaticModal(modalId, title) {
  resetModalFields(modalId);
  setModalTitle(modalId, title);
  window.SMAdmin?.shell?.openMo?.(modalId);
}

export function bindFilterButtons({ root = document, wrapSelector, itemSelector, emptySelector, statusAttr = "status" }) {
  const wrap = root.querySelector(wrapSelector);
  if (!wrap) return;

  const apply = status => {
    const items = Array.from(root.querySelectorAll(itemSelector));
    let visible = 0;

    items.forEach(item => {
      const value = String(item.dataset[statusAttr] || "all").trim().toLowerCase();
      const show = status === "all" || value === status;
      item.hidden = !show;
      if (show) visible += 1;
    });

    const empty = root.querySelector(emptySelector);
    if (empty) empty.hidden = visible > 0;
  };

  wrap.querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
      wrap.querySelectorAll("[data-filter]").forEach(btn => {
        const active = btn === button;
        btn.classList.toggle("on", active);
        btn.setAttribute("aria-pressed", String(active));
      });
      apply(String(button.dataset.filter || "all").toLowerCase());
    });
  });
}

export function bindTableSearch(root, inputSelector, rowSelector, emptySelector) {
  const input = root.querySelector(inputSelector);
  if (!input) return;

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;

    root.querySelectorAll(rowSelector).forEach(row => {
      const show = !query || row.textContent.toLowerCase().includes(query);
      row.hidden = !show;
      if (show) visible += 1;
    });

    const empty = root.querySelector(emptySelector);
    if (empty) empty.hidden = visible > 0;
  });
}

export function onReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
    return;
  }

  callback();
}
