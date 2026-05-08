// SPA-style page swaps + dissolve transitions.
// Fetches the next page's HTML, swaps in only <main> (and <footer>), and
// keeps the starfield + nav continuous so navigation feels instant.
(function() {
  const FADE_OUT_MS = 160;
  const cache = new Map();

  function isInternalLink(a, e) {
    if (!a) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    if (a.id === 'discord-copy') return false;
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return false;
    if (e && e.button !== undefined && e.button !== 0) return false;
    const href = a.getAttribute('href');
    if (!href) return false;
    if (href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.startsWith('javascript:')) return false;
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return false;
    } catch (_) { return false; }
    return true;
  }

  async function fetchPage(href) {
    if (cache.has(href)) return cache.get(href);
    const promise = fetch(href, { credentials: 'same-origin' })
      .then(res => {
        if (!res.ok) throw new Error('fetch failed: ' + res.status);
        return res.text();
      })
      .then(text => {
        const doc = new DOMParser().parseFromString(text, 'text/html');
        return {
          title: doc.title,
          bodyClass: doc.body.className,
          main: doc.querySelector('main'),
          footer: doc.querySelector('footer'),
          navStates: Array.from(doc.querySelectorAll('.nav-tab'))
            .map(a => a.classList.contains('on')),
        };
      });
    cache.set(href, promise);
    return promise;
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  let inFlight = null;

  async function navigate(href, push = true) {
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname && !url.hash) return;

    if (inFlight) inFlight.cancelled = true;
    const token = inFlight = { cancelled: false };

    const fetchPromise = fetchPage(url.pathname).catch(err => err);

    const oldMain = document.querySelector('main');
    const oldFooter = document.querySelector('footer');
    if (oldMain) oldMain.classList.add('is-out');
    if (oldFooter) oldFooter.classList.add('is-out');

    await sleep(FADE_OUT_MS);
    if (token.cancelled) return;

    const data = await fetchPromise;
    if (token.cancelled) return;
    if (data instanceof Error) {
      window.location.href = href;
      return;
    }

    if (data.main) {
      const newMain = data.main.cloneNode(true);
      if (oldMain) oldMain.replaceWith(newMain);
    }
    if (data.footer) {
      const newFooter = data.footer.cloneNode(true);
      if (oldFooter) oldFooter.replaceWith(newFooter);
      else document.querySelector('main').after(newFooter);
    } else if (oldFooter) {
      oldFooter.remove();
    }

    document.title = data.title;
    document.body.className = data.bodyClass;

    const tabs = document.querySelectorAll('.nav-tab');
    data.navStates.forEach((isOn, i) => {
      if (tabs[i]) tabs[i].classList.toggle('on', isOn);
    });

    if (push) history.pushState({ spa: true }, '', href);
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!isInternalLink(a, e)) return;
    e.preventDefault();
    navigate(a.href);
  });

  // Pre-warm fetch on hover so clicks feel instant.
  document.addEventListener('mouseover', (e) => {
    const a = e.target.closest('a');
    if (!isInternalLink(a, null)) return;
    try {
      const url = new URL(a.href, location.href);
      if (!cache.has(url.pathname)) fetchPage(url.pathname).catch(() => {});
    } catch (_) {}
  }, { passive: true });

  window.addEventListener('popstate', () => {
    navigate(location.href, false);
  });

  // Discord copy — delegated so it survives SPA swaps.
  document.addEventListener('click', async (e) => {
    const copyEl = e.target.closest('#discord-copy');
    if (!copyEl) return;
    e.preventDefault();
    const handle = copyEl.dataset.handle || '';
    try {
      await navigator.clipboard.writeText(handle);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = handle;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (__) {}
      document.body.removeChild(ta);
    }
    const textEl = copyEl.querySelector('#discord-text');
    const iconEl = copyEl.querySelector('#discord-icon');
    if (!textEl || !iconEl) return;
    const prevText = textEl.textContent;
    const prevIcon = iconEl.textContent;
    textEl.textContent = 'copied!';
    iconEl.textContent = '✓';
    clearTimeout(copyEl._copyTimer);
    copyEl._copyTimer = setTimeout(() => {
      textEl.textContent = prevText;
      iconEl.textContent = prevIcon;
    }, 1400);
  });
})();
