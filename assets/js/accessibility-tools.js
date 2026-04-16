(function () {
  'use strict';

  // Shared accessibility helper injected across all public pages.
  // This module is intentionally standalone so pages can opt in with one script tag.
  const STORAGE_KEY = 'shadhinMotorA11yPrefs.v1';
  const FOCUSABLE_SELECTOR = 'button, a[href], [tabindex]:not([tabindex="-1"])';
  const WHATSAPP_LINK = 'https://wa.me/8801911387254?text=Assalamu%20Alaikum%20Shadhin%20Motor%2C%20ami%20seat%20cover%20service%20niye%20kotha%20bolte%20chai.';
  const CALL_LINK = 'tel:+8801911387254';
  const ACTION_LABELS = {
    largeText: 'বড় লেখা',
    highContrast: 'উচ্চ কনট্রাস্ট',
    easyRead: 'সহজ পাঠ মোড'
  };

  const state = {
    largeText: false,
    highContrast: false,
    easyRead: false,
    isSpeaking: false
  };

  const classMap = {
    largeText: 'a11y-large-text',
    highContrast: 'a11y-high-contrast',
    easyRead: 'a11y-easy-read'
  };

  function safeParse(jsonText) {
    try {
      return JSON.parse(jsonText || '{}');
    } catch {
      return {};
    }
  }

  function loadState() {
    let stored = {};
    try {
      stored = safeParse(localStorage.getItem(STORAGE_KEY));
    } catch {
      stored = {};
    }
    state.largeText = stored.largeText === true;
    state.highContrast = stored.highContrast === true;
    state.easyRead = stored.easyRead === true;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        largeText: state.largeText,
        highContrast: state.highContrast,
        easyRead: state.easyRead
      }));
    } catch {
      // Ignore storage failures in privacy-restricted modes.
    }
  }

  function applyBodyClasses() {
    document.body.classList.toggle(classMap.largeText, state.largeText);
    document.body.classList.toggle(classMap.highContrast, state.highContrast);
    document.body.classList.toggle(classMap.easyRead, state.easyRead);
  }

  function getReadablePageText() {
    const sourceRoot = document.querySelector('main') || document.body;
    // Prioritize content-heavy elements so read-aloud is useful instead of noisy.
    const selectors = [
      'h1', 'h2', 'h3',
      '.section-label', '.section-title', '.section-lead',
      'p', 'li', 'label',
      'button', 'a'
    ];

    const chunks = Array.from(sourceRoot.querySelectorAll(selectors.join(',')))
      .map(node => (node.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .filter(text => text.length > 2)
      .slice(0, 120);

    return chunks.join('। ').slice(0, 3500);
  }

  function pickBanglaVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find(voice => String(voice.lang || '').toLowerCase().startsWith('bn')) || null;
  }

  function setupToolbar() {
    if (!document.body || document.querySelector('.a11y-tools')) return null;

    const shell = document.createElement('aside');
    shell.className = 'a11y-tools';
    shell.setAttribute('aria-label', 'সহজ ব্যবহার সহায়তা');

    shell.innerHTML = `
      <button type="button" class="a11y-tools-toggle" aria-expanded="false">
        সহজ ব্যবহার সহায়তা
      </button>
      <div class="a11y-tools-panel" aria-hidden="true">
        <h2 class="a11y-tools-title">সবাইয়ের জন্য সহজ ব্যবহার</h2>
        <p class="a11y-tools-copy">যাদের পড়তে কষ্ট হয়, কম দেখতে পান, বা সহজে ব্যবহার করতে চান - এখানে প্রয়োজনীয় সেটিং চালু করুন।</p>
        <div class="a11y-tools-grid">
          <button type="button" class="a11y-tools-action" data-a11y-action="largeText" aria-pressed="false">বড় লেখা</button>
          <button type="button" class="a11y-tools-action" data-a11y-action="highContrast" aria-pressed="false">উচ্চ কনট্রাস্ট</button>
          <button type="button" class="a11y-tools-action" data-a11y-action="easyRead" aria-pressed="false">সহজ পাঠ মোড</button>
          <button type="button" class="a11y-tools-action" data-a11y-action="gotoContact" aria-pressed="false">অর্ডার সেকশনে যান</button>
          <button type="button" class="a11y-tools-action" data-a11y-action="readAloud" aria-pressed="false">পেজ শুনুন</button>
          <button type="button" class="a11y-tools-action" data-a11y-action="stopRead" aria-pressed="false">শুনানো বন্ধ</button>
          <a class="a11y-tools-link" href="${CALL_LINK}">কল করুন</a>
          <a class="a11y-tools-link" href="${WHATSAPP_LINK}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <button type="button" class="a11y-tools-action a11y-tools-action-wide" data-a11y-action="reset" aria-pressed="false">সব ডিফল্টে নিন</button>
        </div>
        <div class="a11y-tools-status" role="status" aria-live="polite" aria-atomic="true"></div>
      </div>
    `;

    document.body.appendChild(shell);
    return shell;
  }

  function init() {
    loadState();
    applyBodyClasses();

    const shell = setupToolbar();
    if (!shell) return;

    const toggleBtn = shell.querySelector('.a11y-tools-toggle');
    const panel = shell.querySelector('.a11y-tools-panel');
    const statusEl = shell.querySelector('.a11y-tools-status');

    const actionButtons = {
      largeText: shell.querySelector('[data-a11y-action="largeText"]'),
      highContrast: shell.querySelector('[data-a11y-action="highContrast"]'),
      easyRead: shell.querySelector('[data-a11y-action="easyRead"]')
    };

    const setStatus = message => {
      if (!statusEl) return;
      statusEl.textContent = message;
    };

    const openPanel = () => {
      shell.classList.add('open');
      toggleBtn?.setAttribute('aria-expanded', 'true');
      panel?.setAttribute('aria-hidden', 'false');
      const firstFocusable = panel?.querySelector(FOCUSABLE_SELECTOR);
      if (firstFocusable) firstFocusable.focus();
    };

    const closePanel = () => {
      shell.classList.remove('open');
      toggleBtn?.setAttribute('aria-expanded', 'false');
      panel?.setAttribute('aria-hidden', 'true');
      toggleBtn?.focus();
    };

    const syncPressedStates = () => {
      actionButtons.largeText?.setAttribute('aria-pressed', String(state.largeText));
      actionButtons.highContrast?.setAttribute('aria-pressed', String(state.highContrast));
      actionButtons.easyRead?.setAttribute('aria-pressed', String(state.easyRead));
    };

    const toggleFeature = key => {
      state[key] = !state[key];
      applyBodyClasses();
      syncPressedStates();
      saveState();

      setStatus(`${ACTION_LABELS[key]} ${state[key] ? 'চালু' : 'বন্ধ'} হয়েছে`);
    };

    const scrollToContact = () => {
      const target = document.getElementById('contact') || document.getElementById('main-content') || document.querySelector('main');
      if (!target) {
        setStatus('টার্গেট সেকশন পাওয়া যায়নি');
        return;
      }

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      setStatus('প্রয়োজনীয় সেকশনে নিয়ে যাওয়া হয়েছে');
    };

    const stopReading = () => {
      if (!('speechSynthesis' in window)) {
        setStatus('এই ব্রাউজারে পেজ শুনানোর সুবিধা নেই');
        return;
      }
      window.speechSynthesis.cancel();
      state.isSpeaking = false;
      setStatus('শুনানো বন্ধ করা হয়েছে');
    };

    const readAloud = () => {
      if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined') {
        setStatus('এই ব্রাউজারে পেজ শুনানোর সুবিধা নেই');
        return;
      }

      const text = getReadablePageText();
      if (!text) {
        setStatus('শুনানোর মতো কনটেন্ট পাওয়া যায়নি');
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = document.documentElement.lang || 'bn-BD';
      utterance.rate = state.easyRead ? 0.88 : 0.96;
      utterance.pitch = 1;
      const voice = pickBanglaVoice();
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        state.isSpeaking = true;
        setStatus('পেজ শুনানো শুরু হয়েছে');
      };
      utterance.onend = () => {
        state.isSpeaking = false;
        setStatus('পেজ শুনানো শেষ হয়েছে');
      };
      utterance.onerror = () => {
        state.isSpeaking = false;
        setStatus('দুঃখিত, পেজ শুনানো যায়নি');
      };

      window.speechSynthesis.speak(utterance);
    };

    const resetAll = () => {
      state.largeText = false;
      state.highContrast = false;
      state.easyRead = false;
      applyBodyClasses();
      syncPressedStates();
      saveState();
      stopReading();
      setStatus('সব সেটিং ডিফল্টে নেওয়া হয়েছে');
    };

    const actionHandlers = {
      largeText: () => toggleFeature('largeText'),
      highContrast: () => toggleFeature('highContrast'),
      easyRead: () => toggleFeature('easyRead'),
      gotoContact: scrollToContact,
      readAloud,
      stopRead: stopReading,
      reset: resetAll
    };

    toggleBtn?.addEventListener('click', () => {
      if (shell.classList.contains('open')) closePanel();
      else openPanel();
    });

    shell.addEventListener('click', event => {
      const actionEl = event.target.closest('[data-a11y-action]');
      if (!actionEl) return;

      const action = actionEl.getAttribute('data-a11y-action');
      const handler = action ? actionHandlers[action] : null;
      if (typeof handler === 'function') handler();
    });

    document.addEventListener('click', event => {
      if (!shell.classList.contains('open')) return;
      if (shell.contains(event.target)) return;
      closePanel();
    });

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (!shell.classList.contains('open')) return;
      closePanel();
    });

    window.addEventListener('beforeunload', () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    });

    syncPressedStates();
    setStatus('সহায়তা টুল প্রস্তুত। প্রয়োজনমতো অপশন চালু করুন।');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
