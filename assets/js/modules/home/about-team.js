import { escapeHTML } from '../core/dom-helpers.js';

const ABOUT_TEAM_MOTION_SPEED = 34;
const ABOUT_TEAM_FALLBACK_IMAGE = 'assets/images/about/employee-1.jpeg';
const ABOUT_TEAM_MEMBERS = Object.freeze([
  {
    name: 'মোঃ রায়হান ইসলাম',
    role: 'মাস্টার কাটিং কারিগর',
    duty: 'গাড়ির seat frame অনুযায়ী pattern prepare করে accuracy বজায় রেখে material cut করেন।',
    exp: '১২+ বছর',
    image: 'assets/images/about/employee-1.jpeg'
  },
  {
    name: 'মোঃ সাগর হোসেন',
    role: 'স্টিচিং ও ডিজাইন স্পেশালিস্ট',
    duty: 'panel join, thread matching এবং design line detailing step-by-step সম্পন্ন করেন।',
    exp: '৯+ বছর',
    image: 'assets/images/about/employee-2.jpeg'
  },
  {
    name: 'মোঃ নাঈম আহমেদ',
    role: 'ফিটিং ও ফিনিশিং টেকনিশিয়ান',
    duty: 'final stretch, edge alignment এবং wrinkle-free fitting নিশ্চিত করেন।',
    exp: '৮+ বছর',
    image: 'assets/images/about/employee-3.jpeg'
  },
  {
    name: 'মোঃ তানভীর রহমান',
    role: 'গ্রাহক সাপোর্ট ও ডেলিভারি সহকারী',
    duty: 'order follow-up, delivery coordination এবং after-service support দেখেন।',
    exp: '৬+ বছর',
    image: 'assets/images/about/employee-4.jpeg'
  },
  {
    name: 'মোঃ রাকিব হাসান',
    role: 'ফোম শেইপিং কারিগর',
    duty: 'seat cushion contour অনুযায়ী foam shaping ও edge balancing করে comfort level বাড়ান।',
    exp: '৭+ বছর',
    image: 'assets/images/about/employee-5.jpeg'
  },
  {
    name: 'মোঃ জাহিদ মিয়া',
    role: 'কাটিং সহকারী',
    duty: 'master cutter-এর নির্দেশনায় precision marking ও pre-cut preparation সম্পন্ন করেন।',
    exp: '৫+ বছর',
    image: 'assets/images/about/employee-6.jpeg'
  },
  {
    name: 'মোঃ ফারুক খান',
    role: 'সেলাই মেশিন অপারেটর',
    duty: 'heavy stitch machine-এ consistent seam depth বজায় রেখে daily production complete করেন।',
    exp: '৬+ বছর',
    image: 'assets/images/about/employee-7.jpeg'
  },
  {
    name: 'মোঃ মানিক সরকার',
    role: 'সাইড প্যানেল ফিটিং সহকারী',
    duty: 'door panel cover, side fitting ও corner locking carefully সেটআপ করেন।',
    exp: '৪+ বছর',
    image: 'assets/images/about/employee-8.jpeg'
  },
  {
    name: 'মোঃ আল-আমিন',
    role: 'ফাইনাল ক্লিনিং এক্সিকিউটিভ',
    duty: 'delivery-এর আগে loose thread cleanup, surface finishing এবং shine balance maintain করেন।',
    exp: '৫+ বছর',
    image: 'assets/images/about/employee-9.jpeg'
  },
  {
    name: 'মোঃ হৃদয় ইসলাম',
    role: 'কোয়ালিটি চেক সহকারী',
    duty: 'stitch line, fitting tension এবং customer spec অনুযায়ী final quality checklist সম্পন্ন করেন।',
    exp: '৪+ বছর',
    image: 'assets/images/about/employee-10.jpeg'
  },
  {
    name: 'মোঃ সাব্বির আহমেদ',
    role: 'ইনস্টলেশন ও ডেলিভারি টেক',
    duty: 'on-spot fitment adjustment, customer handover briefing এবং basic care instruction দেন।',
    exp: '৫+ বছর',
    image: 'assets/images/about/employee-11.jpeg'
  }
]);

export function initHomeAboutTeam({
  openDialog,
  closeDialog,
  focusWithoutScroll,
  restoreFocus,
  captureViewportPosition,
  scheduleViewportRestore,
  syncBodyScrollLockState
}) {
  const aboutTeamState = {
    motionRaf: 0,
    motionLastTs: 0,
    motionOffset: 0,
    motionCycle: 0,
    pauseReasons: new Set(),
    resizeTick: 0,
    dragging: false,
    dragMoved: false,
    pointerDown: false,
    pointerId: null,
    dragStartX: 0,
    dragStartOffset: 0,
    suppressClick: false
  };

  let previewTrigger = null;
  let previewViewport = null;

  function updateAboutTeamPauseState() {
    const paused = aboutTeamState.pauseReasons.size > 0;
    document.getElementById('aboutTeamSlider')?.classList.toggle('is-paused', paused);
    return paused;
  }

  function setAboutTeamPaused(reason, paused) {
    if (!reason) return;
    if (paused) aboutTeamState.pauseReasons.add(reason);
    else aboutTeamState.pauseReasons.delete(reason);
    updateAboutTeamPauseState();
  }

  function destroyAboutTeamMotion() {
    cancelAnimationFrame(aboutTeamState.motionRaf);
    aboutTeamState.motionRaf = 0;
    aboutTeamState.motionLastTs = 0;
  }

  function normalizeAboutTeamOffset(offset) {
    if (!aboutTeamState.motionCycle) return 0;

    let nextOffset = offset % aboutTeamState.motionCycle;
    if (nextOffset < 0) nextOffset += aboutTeamState.motionCycle;
    return nextOffset;
  }

  function applyAboutTeamOffset() {
    const track = document.getElementById('aboutTeamGrid');
    if (!track) return;
    track.style.transform = `translate3d(${-aboutTeamState.motionOffset}px, 0, 0)`;
  }

  function startAboutTeamMotion() {
    if (!aboutTeamState.motionCycle || aboutTeamState.motionRaf) return;

    const step = timestamp => {
      if (!aboutTeamState.motionLastTs) aboutTeamState.motionLastTs = timestamp;
      const delta = (timestamp - aboutTeamState.motionLastTs) / 1000;
      aboutTeamState.motionLastTs = timestamp;

      if (aboutTeamState.pauseReasons.size === 0) {
        aboutTeamState.motionOffset = normalizeAboutTeamOffset(
          aboutTeamState.motionOffset + (ABOUT_TEAM_MOTION_SPEED * delta)
        );
        applyAboutTeamOffset();
      }

      aboutTeamState.motionRaf = requestAnimationFrame(step);
    };

    aboutTeamState.motionRaf = requestAnimationFrame(step);
  }

  function syncAboutTeamMarquee() {
    const track = document.getElementById('aboutTeamGrid');
    const viewport = document.getElementById('aboutTeamMarqueeViewport');
    destroyAboutTeamMotion();
    if (!track || !viewport) return;

    const groups = track.querySelectorAll('.about-team-marquee-group');
    if (groups.length < 2 || ABOUT_TEAM_MEMBERS.length < 2) {
      aboutTeamState.motionCycle = 0;
      aboutTeamState.motionOffset = 0;
      bindAboutTeamInteractions();
      applyAboutTeamOffset();
      return;
    }

    const computedStyle = getComputedStyle(track);
    const gap = parseFloat(computedStyle.gap || computedStyle.columnGap || 12) || 12;
    const groupWidth = groups[0].scrollWidth;

    aboutTeamState.motionCycle = groupWidth + gap;
    aboutTeamState.motionOffset = normalizeAboutTeamOffset(aboutTeamState.motionOffset);
    bindAboutTeamInteractions();
    applyAboutTeamOffset();
    startAboutTeamMotion();
  }

  function bindAboutTeamInteractions() {
    const shell = document.querySelector('.about-team-marquee-shell');
    const viewport = document.getElementById('aboutTeamMarqueeViewport');
    if (!shell || !viewport) return;

    const endDrag = event => {
      const hadDrag = aboutTeamState.dragging && aboutTeamState.dragMoved;

      if (event && aboutTeamState.dragging && viewport.hasPointerCapture && viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }

      aboutTeamState.pointerDown = false;
      aboutTeamState.pointerId = null;

      if (aboutTeamState.dragging) {
        aboutTeamState.dragging = false;
        shell.classList.remove('is-dragging');
      }

      if (hadDrag) {
        aboutTeamState.suppressClick = true;
        setTimeout(() => {
          aboutTeamState.suppressClick = false;
        }, 220);
      }

      aboutTeamState.dragMoved = false;
      setAboutTeamPaused('pointer', false);
    };

    viewport.onpointerdown = event => {
      if (event.pointerType !== 'mouse') return;
      if (event.button !== 0) return;

      aboutTeamState.pointerDown = true;
      aboutTeamState.pointerId = event.pointerId;
      aboutTeamState.dragging = false;
      aboutTeamState.dragMoved = false;
      aboutTeamState.dragStartX = event.clientX;
      aboutTeamState.dragStartOffset = aboutTeamState.motionOffset;
      setAboutTeamPaused('pointer', true);
    };

    viewport.onpointermove = event => {
      if (!aboutTeamState.pointerDown || event.pointerId !== aboutTeamState.pointerId) return;
      const deltaX = event.clientX - aboutTeamState.dragStartX;

      if (!aboutTeamState.dragging) {
        if (Math.abs(deltaX) <= 6) return;
        aboutTeamState.dragging = true;
        aboutTeamState.dragMoved = true;
        shell.classList.add('is-dragging');
        viewport.setPointerCapture(event.pointerId);
      }

      event.preventDefault();
      aboutTeamState.motionOffset = normalizeAboutTeamOffset(aboutTeamState.dragStartOffset - deltaX);
      applyAboutTeamOffset();
    };

    viewport.onpointerup = event => endDrag(event);
    viewport.onpointercancel = event => endDrag(event);
    viewport.onlostpointercapture = event => endDrag(event);
    viewport.ondragstart = () => false;
  }

  function bindAboutTeamCardImageFallbacks(root = document) {
    root.querySelectorAll('.about-team-photo').forEach(img => {
      const fallbackToDefault = () => {
        if (img.src.includes(ABOUT_TEAM_FALLBACK_IMAGE)) return;
        img.src = ABOUT_TEAM_FALLBACK_IMAGE;
      };

      img.addEventListener('error', fallbackToDefault, { once: true });
    });
  }

  function buildAboutTeamCard(member) {
    const safeName = escapeHTML(member.name);
    const safeRole = escapeHTML(member.role);
    const safeDuty = escapeHTML(member.duty);
    const safeExp = escapeHTML(member.exp);
    const safeImage = escapeHTML(member.image || ABOUT_TEAM_FALLBACK_IMAGE);

    return `
      <article class="about-team-card">
        <div class="about-team-top">
          <button
            type="button"
            class="about-team-photo-btn"
            data-team-preview-src="${safeImage}"
            data-team-preview-name="${safeName}"
            data-team-preview-role="${safeRole}"
            aria-label="${safeName} এর ছবি বড় করে দেখুন">
            <img
              src="${safeImage}"
              alt="কর্মচারীর ছবি: ${safeName}"
              class="about-team-photo"
              loading="lazy"
              decoding="async">
          </button>
          <div class="about-team-headline">
            <h4 class="about-team-name">${safeName}</h4>
            <p class="about-team-role">${safeRole}</p>
          </div>
        </div>
        <p class="about-team-duty">${safeDuty}</p>
        <span class="about-team-exp">অভিজ্ঞতা: ${safeExp}</span>
      </article>
    `;
  }

  function renderAboutTeamCards() {
    const track = document.getElementById('aboutTeamGrid');
    if (!track) return;

    if (!ABOUT_TEAM_MEMBERS.length) {
      track.innerHTML = '<div class="about-team-empty">এই মুহূর্তে কোনো কর্মচারী তথ্য দেখানো যাচ্ছে না।</div>';
      destroyAboutTeamMotion();
      return;
    }

    const primaryGroup = `<div class="about-team-marquee-group">${ABOUT_TEAM_MEMBERS.map(member => buildAboutTeamCard(member)).join('')}</div>`;
    const duplicateGroup = ABOUT_TEAM_MEMBERS.length > 1
      ? `<div class="about-team-marquee-group" aria-hidden="true">${ABOUT_TEAM_MEMBERS.map(member => buildAboutTeamCard(member)).join('')}</div>`
      : '';

    track.innerHTML = `${primaryGroup}${duplicateGroup}`;
    bindAboutTeamCardImageFallbacks(track);
    syncAboutTeamMarquee();
  }

  function openAboutTeamPreview(imageSrc, name, role, triggerEl = null) {
    const overlay = document.getElementById('aboutTeamPreviewOverlay');
    const image = document.getElementById('aboutTeamPreviewImage');
    const nameEl = document.getElementById('aboutTeamPreviewName');
    const roleEl = document.getElementById('aboutTeamPreviewRole');

    if (!overlay || !image || !nameEl || !roleEl) return;

    previewTrigger = triggerEl instanceof HTMLElement
      ? triggerEl
      : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    previewViewport = captureViewportPosition();

    const previewSrc = imageSrc || ABOUT_TEAM_FALLBACK_IMAGE;
    const previewName = name || 'শাধিন মোটর টিম';
    const previewRole = role || 'টিম মেম্বার';

    image.src = previewSrc;
    image.alt = `${previewName} - বড় প্রিভিউ`;
    image.onerror = () => {
      if (image.src.includes(ABOUT_TEAM_FALLBACK_IMAGE)) return;
      image.src = ABOUT_TEAM_FALLBACK_IMAGE;
    };

    nameEl.textContent = previewName;
    roleEl.textContent = previewRole;

    setAboutTeamPaused('preview', true);
    openDialog(overlay);
    syncBodyScrollLockState();
    focusWithoutScroll(document.getElementById('aboutTeamPreviewCloseBtn'));
    scheduleViewportRestore(previewViewport);
  }

  function closeAboutTeamPreview() {
    const overlay = document.getElementById('aboutTeamPreviewOverlay');
    if (!overlay) return;

    const viewport = previewViewport || captureViewportPosition();

    closeDialog(overlay);
    syncBodyScrollLockState();
    restoreFocus(previewTrigger);
    scheduleViewportRestore(viewport);
    previewViewport = null;
    setAboutTeamPaused('preview', false);
  }

  const track = document.getElementById('aboutTeamGrid');
  const slider = document.getElementById('aboutTeamSlider');
  if (!track || !slider) {
    return {
      closeAboutTeamPreview
    };
  }

  aboutTeamState.pauseReasons.clear();
  renderAboutTeamCards();

  track.addEventListener('click', event => {
    if (aboutTeamState.suppressClick) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const trigger = event.target.closest('[data-team-preview-src]');
    if (!trigger || !track.contains(trigger)) return;

    openAboutTeamPreview(
      trigger.dataset.teamPreviewSrc || ABOUT_TEAM_FALLBACK_IMAGE,
      trigger.dataset.teamPreviewName || '',
      trigger.dataset.teamPreviewRole || '',
      trigger
    );
  });

  track.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    const trigger = event.target.closest('[data-team-preview-src]');
    if (!trigger || !track.contains(trigger)) return;

    event.preventDefault();
    openAboutTeamPreview(
      trigger.dataset.teamPreviewSrc || ABOUT_TEAM_FALLBACK_IMAGE,
      trigger.dataset.teamPreviewName || '',
      trigger.dataset.teamPreviewRole || '',
      trigger
    );
  });

  const previewOverlay = document.getElementById('aboutTeamPreviewOverlay');
  previewOverlay?.addEventListener('click', event => {
    if (event.target === previewOverlay) closeAboutTeamPreview();
  });
  previewOverlay?.addEventListener('cancel', event => {
    event.preventDefault();
    closeAboutTeamPreview();
  });

  document.getElementById('aboutTeamPreviewCloseBtn')?.addEventListener('click', closeAboutTeamPreview);

  const ownerPreviewTrigger = document.querySelector('.about-owner-photo-btn[data-team-preview-src]');
  ownerPreviewTrigger?.addEventListener('click', () => {
    openAboutTeamPreview(
      ownerPreviewTrigger.dataset.teamPreviewSrc || ABOUT_TEAM_FALLBACK_IMAGE,
      ownerPreviewTrigger.dataset.teamPreviewName || 'প্রতিষ্ঠাতা ও প্রধান কারিগর',
      ownerPreviewTrigger.dataset.teamPreviewRole || 'Owner & Workshop Lead',
      ownerPreviewTrigger
    );
  });

  slider.addEventListener('mouseenter', () => setAboutTeamPaused('hover', true));
  slider.addEventListener('mouseleave', () => setAboutTeamPaused('hover', false));
  slider.addEventListener('focusin', () => setAboutTeamPaused('focus', true));
  slider.addEventListener('focusout', event => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && slider.contains(nextTarget)) return;
    setAboutTeamPaused('focus', false);
  });

  document.addEventListener('visibilitychange', () => {
    setAboutTeamPaused('hidden', document.hidden);
  });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(aboutTeamState.resizeTick);
    aboutTeamState.resizeTick = requestAnimationFrame(syncAboutTeamMarquee);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncAboutTeamMarquee);
  }

  setAboutTeamPaused('hidden', document.hidden);

  return {
    closeAboutTeamPreview
  };
}
