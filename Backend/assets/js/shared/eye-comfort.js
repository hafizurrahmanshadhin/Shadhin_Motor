// ══════════════════════════════════════════════════════════════════════════════
// EYE COMFORT MODE - JavaScript Controller
// ══════════════════════════════════════════════════════════════════════════════

(() => {
  'use strict';

  const STORAGE_KEY = 'sm_eye_comfort';
  const INTENSITY_STORAGE_KEY = 'sm_eye_comfort_intensity';
  const DEFAULT_INTENSITY = 65;
  const MIN_INTENSITY = 20;
  const MAX_INTENSITY = 100;
  const INTENSITY_STEP = 5;

  let control = null;
  let settingsBtn = null;
  let panel = null;
  let rangeInput = null;
  let valueEl = null;
  let panelOpen = false;

  function normalizeIntensity(value) {
    const numeric = Number.parseInt(value, 10);
    if (!Number.isFinite(numeric)) return DEFAULT_INTENSITY;
    const stepped = Math.round(numeric / INTENSITY_STEP) * INTENSITY_STEP;
    return Math.min(MAX_INTENSITY, Math.max(MIN_INTENSITY, stepped));
  }

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

  function getEyeComfortIntensity() {
    try {
      return normalizeIntensity(window.localStorage.getItem(INTENSITY_STORAGE_KEY));
    } catch {
      return DEFAULT_INTENSITY;
    }
  }

  function setEyeComfortIntensity(intensity) {
    try {
      window.localStorage.setItem(INTENSITY_STORAGE_KEY, String(intensity));
    } catch {
      console.warn('Could not save eye comfort intensity');
    }
  }

  function syncIntensityControl(intensity) {
    if (rangeInput) rangeInput.value = String(intensity);
    if (valueEl) valueEl.textContent = `${intensity}%`;
    settingsBtn?.setAttribute(
      'aria-label',
      `Adjust eye comfort yellow shield (${intensity}%)`
    );
  }

  function applyIntensity(intensity) {
    const normalized = normalizeIntensity(intensity);
    document.documentElement.style.setProperty(
      '--eye-comfort-intensity',
      (normalized / 100).toFixed(2)
    );
    syncIntensityControl(normalized);
    return normalized;
  }

  function updateIntensity(intensity) {
    const normalized = applyIntensity(intensity);
    setEyeComfortIntensity(normalized);
    return normalized;
  }

  function setPanelOpen(open) {
    panelOpen = Boolean(open && panel);
    control?.classList.toggle('settings-open', panelOpen);
    panel?.classList.toggle('show', panelOpen);
    panel?.setAttribute('aria-hidden', String(!panelOpen));
    settingsBtn?.setAttribute('aria-expanded', String(panelOpen));
  }

  function closeIntensityPanel() {
    setPanelOpen(false);
  }

  function toggleIntensityPanel() {
    setPanelOpen(!panelOpen);
  }

  function isEyeComfortEnabled() {
    return document.body.classList.contains('eye-comfort-mode');
  }

  function createIntensityControl(btn) {
    if (!btn || control) return;

    const parent = btn.parentElement;
    if (!parent) return;

    control = btn.closest('.eye-comfort-control');

    if (!control) {
      control = document.createElement('div');
      control.className = 'eye-comfort-control';
      parent.insertBefore(control, btn);
      control.appendChild(btn);
    }

    settingsBtn = document.createElement('button');
    settingsBtn.className = 'eye-comfort-settings-btn';
    settingsBtn.id = 'eyeComfortSettingsBtn';
    settingsBtn.type = 'button';
    settingsBtn.title = 'Adjust eye comfort yellow shield';
    settingsBtn.setAttribute('aria-controls', 'eyeComfortPanel');
    settingsBtn.setAttribute('aria-expanded', 'false');
    settingsBtn.innerHTML = '<i class="bi bi-sliders" aria-hidden="true"></i>';

    panel = document.createElement('div');
    panel.className = 'eye-comfort-panel';
    panel.id = 'eyeComfortPanel';
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('aria-label', 'Eye comfort yellow shield');
    panel.innerHTML = `
      <div class="eye-comfort-panel-head">
        <span class="eye-comfort-panel-title">Yellow Shield</span>
        <span class="eye-comfort-panel-value" id="eyeComfortIntensityValue">65%</span>
      </div>
      <label class="eye-comfort-range-label" for="eyeComfortIntensityRange">Warm tint strength</label>
      <input class="eye-comfort-range" id="eyeComfortIntensityRange" type="range" min="${MIN_INTENSITY}" max="${MAX_INTENSITY}" step="${INTENSITY_STEP}">
      <div class="eye-comfort-range-scale" aria-hidden="true">
        <span>Low</span>
        <span>Strong</span>
      </div>
    `;

    control.append(settingsBtn, panel);

    rangeInput = panel.querySelector('#eyeComfortIntensityRange');
    valueEl = panel.querySelector('#eyeComfortIntensityValue');

    settingsBtn.addEventListener('click', event => {
      event.stopPropagation();
      if (!isEyeComfortEnabled()) applyEyeComfort(true);
      toggleIntensityPanel();
      if (panelOpen) rangeInput?.focus();
    });

    rangeInput?.addEventListener('input', () => {
      updateIntensity(rangeInput.value);
    });

    rangeInput?.addEventListener('change', () => {
      updateIntensity(rangeInput.value);
    });

    panel.addEventListener('click', event => {
      event.stopPropagation();
    });

    document.addEventListener('click', event => {
      if (!panelOpen || !control || control.contains(event.target)) return;
      closeIntensityPanel();
    });

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !panelOpen) return;
      closeIntensityPanel();
      settingsBtn?.focus();
    });
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
      btn?.setAttribute('aria-pressed', 'true');
      control?.classList.add('active');
    } else {
      body.classList.remove('eye-comfort-mode');
      html.classList.remove('eye-comfort-mode');
      btn?.classList.remove('active');
      btn?.setAttribute('aria-pressed', 'false');
      control?.classList.remove('active');
      closeIntensityPanel();
    }

    setEyeComfortState(enabled);
  }

  // Toggle eye comfort mode
  function toggleEyeComfort() {
    const isEnabled = document.body.classList.contains('eye-comfort-mode');
    const newState = !isEnabled;

    applyEyeComfort(newState);
  }

  // Initialize eye comfort mode
  function initEyeComfort() {
    const savedIntensity = getEyeComfortIntensity();
    applyIntensity(savedIntensity);

    const btn = document.getElementById('eyeComfortBtn');
    if (btn) {
      createIntensityControl(btn);
      syncIntensityControl(savedIntensity);
    }

    // Apply saved state on page load
    const savedState = getEyeComfortState();
    if (savedState) {
      applyEyeComfort(true);
    }

    // Bind toggle button
    if (btn) {
      btn.addEventListener('click', toggleEyeComfort);

      // Add tooltip
      btn.setAttribute('title', 'Toggle Eye Comfort Mode');
      btn.setAttribute('aria-label', 'Toggle eye comfort mode for reduced eye strain');
      btn.setAttribute('aria-pressed', String(savedState));
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
      setIntensity: updateIntensity,
      getIntensity: getEyeComfortIntensity,
      isEnabled: () => document.body.classList.contains('eye-comfort-mode')
    };
  }
})();
