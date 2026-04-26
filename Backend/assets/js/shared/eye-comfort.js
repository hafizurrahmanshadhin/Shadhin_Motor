// ══════════════════════════════════════════════════════════════════════════════
// EYE COMFORT MODE - JavaScript Controller
// ══════════════════════════════════════════════════════════════════════════════

(() => {
  'use strict';

  const STORAGE_KEY = 'sm_eye_comfort';
  const INDICATOR_TIMEOUT = 5000; // 5 seconds

  // Get stored eye comfort state
  function getEyeComfortState() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  // Set eye comfort state
  function setEyeComfortState(enabled) {
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    } catch {
      console.warn('Could not save eye comfort state');
    }
  }

  // Apply eye comfort mode
  function applyEyeComfort(enabled) {
    const body = document.body;
    const html = document.documentElement;
    const btn = document.getElementById('eyeComfortBtn');

    if (enabled) {
      body.classList.add('eye-comfort-mode');
      html.classList.add('eye-comfort-mode');
      btn?.classList.add('active');

      // Hide indicator after timeout
      setTimeout(() => {
        body.classList.add('indicator-hidden');
      }, INDICATOR_TIMEOUT);
    } else {
      body.classList.remove('eye-comfort-mode', 'indicator-hidden');
      html.classList.remove('eye-comfort-mode');
      btn?.classList.remove('active');
    }

    setEyeComfortState(enabled);
  }

  // Toggle eye comfort mode
  function toggleEyeComfort() {
    const isEnabled = document.body.classList.contains('eye-comfort-mode');
    const newState = !isEnabled;

    applyEyeComfort(newState);

    // Show toast notification
    if (window.SMAdmin?.ui?.toast) {
      window.SMAdmin.ui.toast(
        'success',
        newState ? 'Eye Comfort Enabled' : 'Eye Comfort Disabled',
        newState
          ? 'Enhanced text clarity and reduced eye strain activated'
          : 'Standard display mode restored'
      );
    }
  }

  // Initialize eye comfort mode
  function initEyeComfort() {
    // Apply saved state on page load
    const savedState = getEyeComfortState();
    if (savedState) {
      applyEyeComfort(true);
    }

    // Bind toggle button
    const btn = document.getElementById('eyeComfortBtn');
    if (btn) {
      btn.addEventListener('click', toggleEyeComfort);

      // Add tooltip
      btn.setAttribute('title', 'Toggle Eye Comfort Mode');
      btn.setAttribute('aria-label', 'Toggle eye comfort mode for reduced eye strain');
    }

    // Keyboard shortcut: Ctrl+Shift+E
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        toggleEyeComfort();
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEyeComfort);
  } else {
    initEyeComfort();
  }

  // Expose to global SMAdmin object
  if (window.SMAdmin) {
    window.SMAdmin.eyeComfort = {
      toggle: toggleEyeComfort,
      enable: () => applyEyeComfort(true),
      disable: () => applyEyeComfort(false),
      isEnabled: () => document.body.classList.contains('eye-comfort-mode')
    };
  }
})();
