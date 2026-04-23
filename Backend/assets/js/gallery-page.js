function getGalleryItems() {
  return Array.from(document.querySelectorAll("#gGrid .g-item"));
}

function updateGalleryCount() {
  const countEl = document.getElementById("gCnt");
  if (!countEl) return;

  const visibleItems = getGalleryItems().filter(item => item.style.display !== "none");
  countEl.textContent = String(visibleItems.length);
}

function filtGal(type, btn) {
  document.querySelectorAll("#galFilterWrap .f-btn").forEach(filterBtn => {
    filterBtn.classList.toggle("on", filterBtn === btn);
  });

  getGalleryItems().forEach(item => {
    const cardType = item.dataset.cat || "all";
    item.style.display = type === "all" || cardType === type ? "" : "none";
  });

  updateGalleryCount();
}

function resetGalleryModal() {
  const modal = document.getElementById("moGallery");
  if (!modal) return;

  modal.querySelectorAll("input:not([type='hidden']), textarea").forEach(field => {
    field.value = "";
  });

  modal.querySelectorAll("select").forEach(select => {
    select.selectedIndex = 0;
  });

  modal.querySelectorAll("input[type='hidden']").forEach(field => {
    field.value = "";
  });
}

function openGalMo(trigger) {
  resetGalleryModal();
  const titleEl = document.getElementById("moGT");
  if (titleEl) titleEl.textContent = trigger?.dataset?.galleryModalTitle || "Add Photo";
  openMo("moGallery");
}

function saveGalItem() {
  closeMo("moGallery");
  toast("success", "Gallery item saved", "Static preview only");
}

function initGalleryPage() {
  if (PAGE !== "gallery") return;

  document.querySelectorAll("[data-gallery-filter]").forEach(button => {
    button.addEventListener("click", () => filtGal(button.dataset.galleryFilter, button));
  });

  document.querySelectorAll("[data-gallery-modal]").forEach(button => {
    button.addEventListener("click", () => openGalMo(button));
  });

  document.querySelector('[data-action="gallery-save"]')?.addEventListener("click", saveGalItem);
  updateGalleryCount();

  if (window.location.hash === "#add-photo") {
    openGalMo(document.querySelector("[data-gallery-modal]"));
  }
}

document.addEventListener("DOMContentLoaded", initGalleryPage);

window.filtGal = filtGal;
window.openGalMo = openGalMo;
window.saveGalItem = saveGalItem;
