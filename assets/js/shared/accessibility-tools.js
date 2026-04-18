// Shared accessibility helper injected across all public pages.
// This module is intentionally standalone so pages can opt in with one script tag.
const FOCUSABLE_SELECTOR = 'button, a[href], [tabindex]:not([tabindex="-1"])';

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

  function formatTemplate(template, tokens = {}) {
    return String(template || '').replace(/\{(\w+)\}/g, (_, key) => {
      return Object.prototype.hasOwnProperty.call(tokens, key) ? String(tokens[key] ?? '') : '';
    });
  }

  function setupToolbar() {
    if (!document.body) return null;
    return document.querySelector('.a11y-tools');
  }

  export function initAccessibilityTools() {
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

    const getStatusText = key => {
      const value = shell.dataset?.[key];
      return typeof value === 'string' && value.trim() ? value.trim() : '';
    };

    const getActionLabel = key => {
      return actionButtons[key]?.textContent?.trim() || '';
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

    const closePanel = ({ returnFocus = false } = {}) => {
      shell.classList.remove('open');
      toggleBtn?.setAttribute('aria-expanded', 'false');
      panel?.setAttribute('aria-hidden', 'true');

      if (returnFocus) {
        toggleBtn?.focus();
        return;
      }

      if (toggleBtn instanceof HTMLElement && document.activeElement === toggleBtn) {
        toggleBtn.blur();
      }
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

      setStatus(formatTemplate(
        getStatusText('featureStatusTemplate'),
        {
          label: getActionLabel(key),
          state: state[key]
            ? getStatusText('featureOnLabel')
            : getStatusText('featureOffLabel')
        }
      ));
    };

    const scrollToContact = () => {
      const target = document.getElementById('contact') || document.getElementById('main-content') || document.querySelector('main');
      if (!target) {
        setStatus(getStatusText('targetMissingMessage'));
        return;
      }

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      setStatus(getStatusText('targetFoundMessage'));
    };

    const stopReading = () => {
      if (!('speechSynthesis' in window)) {
        setStatus(getStatusText('readUnsupportedMessage'));
        return;
      }
      window.speechSynthesis.cancel();
      state.isSpeaking = false;
      setStatus(getStatusText('stopMessage'));
    };

    const readAloud = () => {
      if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined') {
        setStatus(getStatusText('readUnsupportedMessage'));
        return;
      }

      const text = getReadablePageText();
      if (!text) {
        setStatus(getStatusText('readEmptyMessage'));
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
        setStatus(getStatusText('readStartMessage'));
      };
      utterance.onend = () => {
        state.isSpeaking = false;
        setStatus(getStatusText('readEndMessage'));
      };
      utterance.onerror = () => {
        state.isSpeaking = false;
        setStatus(getStatusText('readErrorMessage'));
      };

      window.speechSynthesis.speak(utterance);
    };

    const resetAll = () => {
      state.largeText = false;
      state.highContrast = false;
      state.easyRead = false;
      applyBodyClasses();
      syncPressedStates();
      stopReading();
      setStatus(getStatusText('resetMessage'));
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
      closePanel({ returnFocus: true });
    });

    window.addEventListener('beforeunload', () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    });

    syncPressedStates();
    setStatus(getStatusText('readyMessage'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccessibilityTools, { once: true });
  } else {
    initAccessibilityTools();
  }
