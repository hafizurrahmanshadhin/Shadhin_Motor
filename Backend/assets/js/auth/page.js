(() => {
  'use strict';

  let activeTrigger = null;

  function openDialog(dialog, trigger) {
    if (!(dialog instanceof HTMLDialogElement)) return;

    activeTrigger = trigger instanceof HTMLElement ? trigger : null;

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      return;
    }

    dialog.setAttribute('open', '');
  }

  function closeDialog(dialog, focusTargetId) {
    if (!(dialog instanceof HTMLDialogElement)) return;

    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }

    const focusTarget = focusTargetId ? document.getElementById(focusTargetId) : null;
    if (focusTarget instanceof HTMLElement) {
      focusTarget.focus();
      return;
    }

    activeTrigger?.focus();
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const openButton = target.closest('[data-auth-dialog-open]');
    if (openButton) {
      const dialog = document.getElementById(openButton.dataset.authDialogOpen || '');
      openDialog(dialog, openButton);
      return;
    }

    const closeButton = target.closest('[data-auth-dialog-close]');
    if (closeButton) {
      closeDialog(closeButton.closest('dialog'), closeButton.dataset.authFocus);
      return;
    }

    if (target instanceof HTMLDialogElement) {
      closeDialog(target);
    }
  });
})();
