(function () {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close">CLOSE</button><img alt=""/>';
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector('img');
  const closeBtn = overlay.querySelector('.lightbox-close');

  function open(src, alt) {
    overlayImg.src = src;
    overlayImg.alt = alt || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    overlayImg.src = '';
  }

  document.addEventListener('click', function (e) {
    const img = e.target.closest('.system-media img, .zoomable');
    if (img && img.tagName === 'IMG') {
      e.preventDefault();
      open(img.currentSrc || img.src, img.alt);
    }
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target === closeBtn) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
})();
