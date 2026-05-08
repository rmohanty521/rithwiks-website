// Animated starfield — twinkles, sparkles, slow drift
(function() {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    seed();
  }

  function seed() {
    const count = Math.floor((window.innerWidth * window.innerHeight) / 2200);
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.6 + 0.3) * dpr,
        baseA: Math.random() * 0.6 + 0.25,
        speed: Math.random() * 0.025 + 0.008,
        phase: Math.random() * Math.PI * 2,
        twinkle: Math.random() < 0.18,
        drift: (Math.random() - 0.5) * 0.04 * dpr,
      });
    }
  }

  function drawStar(s, t) {
    const a = s.baseA + Math.sin(s.phase + t * s.speed * 4) * 0.45;
    ctx.globalAlpha = Math.max(0.05, Math.min(1, a));
    if (s.twinkle && a > 0.65) {
      const len = s.r * 4;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = s.r * 0.45;
      ctx.beginPath();
      ctx.moveTo(s.x - len, s.y); ctx.lineTo(s.x + len, s.y);
      ctx.moveTo(s.x, s.y - len); ctx.lineTo(s.x, s.y + len);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  let last = 0;
  function tick(t) {
    const dt = (t - last) / 16.666; last = t;
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.phase += s.speed * dt;
      s.x += s.drift * dt;
      if (s.x < -10) s.x = w + 10;
      if (s.x > w + 10) s.x = -10;
      drawStar(s, t / 1000);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(tick);
})();
