'use strict';

// Progressive enhancement only: browser validation runs before this event.
// Server responses, not this script, determine whether an operation succeeded.
document.querySelectorAll('form[method="post"]').forEach((form) => {
  form.addEventListener('submit', () => {
    form.querySelectorAll('button[type="submit"]').forEach((button) => {
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
    });
  });
});

// Restore buttons when returning through the browser's back/forward cache.
window.addEventListener('pageshow', () => {
  document.querySelectorAll('button[aria-busy="true"]').forEach((button) => {
    button.disabled = false;
    button.removeAttribute('aria-busy');
  });
});
