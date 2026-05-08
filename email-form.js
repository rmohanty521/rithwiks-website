// Email modal — opens a form on contact page, submits to Formspree.
//
// SETUP: replace FORMSPREE_ENDPOINT below with your form URL.
//   1) Sign up at https://formspree.io
//   2) Create a new form
//   3) Copy its endpoint, e.g. https://formspree.io/f/abcd1234
//   4) Paste it on the line marked TODO below
(function() {
  // TODO: replace with your real Formspree endpoint
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

  function getModal() { return document.getElementById('email-modal'); }
  function getStatus() { return document.getElementById('form-status'); }
  function getForm() { return document.getElementById('email-form'); }

  function openModal() {
    const modal = getModal();
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const first = modal.querySelector('input, textarea');
      if (first) first.focus();
    }, 80);
  }

  function closeModal() {
    const modal = getModal();
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    const status = getStatus();
    if (status) { status.textContent = ''; status.className = 'form-status'; }
  }

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open-email]');
    if (opener) {
      e.preventDefault();
      openModal();
      return;
    }
    const closer = e.target.closest('[data-modal-close]');
    if (closer) {
      e.preventDefault();
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = getModal();
      if (modal && !modal.hidden) closeModal();
    }
  });

  document.addEventListener('submit', async (e) => {
    if (!e.target.matches('#email-form')) return;
    e.preventDefault();
    const form = e.target;
    const status = getStatus();
    const btn = form.querySelector('button[type=submit]');

    if (FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')) {
      status.className = 'form-status err';
      status.textContent = 'form endpoint not set yet — email rithmohanty07@gmail.com directly.';
      return;
    }

    btn.disabled = true;
    status.className = 'form-status';
    status.textContent = 'sending...';
    try {
      const data = new FormData(form);
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error('send failed: ' + res.status);
      status.className = 'form-status ok';
      status.textContent = 'sent — I\'ll get back to you soon.';
      form.reset();
      setTimeout(closeModal, 1800);
    } catch (err) {
      status.className = 'form-status err';
      status.textContent = 'something broke. email rithmohanty07@gmail.com directly.';
    } finally {
      btn.disabled = false;
    }
  });
})();
