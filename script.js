// ponytail: nav + reveal + parallax + countdown, smooth via native CSS, no deps
(() => {
  const nav = document.getElementById('navMenu');
  const btn = document.getElementById('hamburger');
  const bar = document.getElementById('navbar');

  // hamburger — class toggle, a11y, stagger
  btn?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    const icon = btn.querySelector('i');
    if (icon) { icon.classList.toggle('fa-bars', !open); icon.classList.toggle('fa-xmark', open); }
  });
  const closeNav = () => {
    nav?.classList.remove('is-open');
    btn?.classList.remove('is-open');
    btn?.setAttribute('aria-expanded', 'false');
    const icon = btn?.querySelector('i');
    if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-xmark'); }
  };
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('click', e => { if (!nav?.contains(e.target) && !btn?.contains(e.target)) closeNav(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  // sticky shadow
  const onScrollBar = () => bar?.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScrollBar, { passive: true });
  onScrollBar();

  // smooth scroll: native CSS only (scroll-behavior + scroll-padding-top) — no JS hijack, no jank
  // respect prefers-reduced-motion
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // reveal on scroll — single observer
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // parallax — data-parallax speed (0.05 - 0.2), hermes feel
  const parallaxEls = document.querySelectorAll('[data-parallax], .hero-image, .twibbon-img img, .reg-image img');
  function updateParallax(y = scrollY) {
    if (prefersReduced) return;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax || '0.06');
      const rect = el.getBoundingClientRect();
      // only when in viewport
      if (rect.top < innerHeight && rect.bottom > 0) {
        const offset = (y - el.offsetTop) * speed * 0.15;
        // hermes: translate3d for GPU
        el.style.transform = `translate3d(0,${(offset).toFixed(2)}px,0)`;
      }
    });
  }
  let tick = false;
  addEventListener('scroll', () => {
    if (!tick) { requestAnimationFrame(() => { updateParallax(); tick = false; }); tick = true; }
  }, { passive: true });
  updateParallax();

  // countdown — keep, but countdown-note removed per request
  const cd = document.getElementById('countdown');
  if (cd) {
    const target = new Date('2026-12-09T00:00:00+07:00').getTime();
    const dEl = document.getElementById('cd-d'), hEl = document.getElementById('cd-h'), mEl = document.getElementById('cd-m'), sEl = document.getElementById('cd-s');
    function tickCd() {
      let diff = target - Date.now();
      if (diff <= 0) { if(dEl)dEl.textContent='0';if(hEl)hEl.textContent='00';if(mEl)mEl.textContent='00';if(sEl)sEl.textContent='00'; return; }
      const d = Math.floor(diff / 86400000); diff %= 86400000;
      const h = Math.floor(diff / 3600000); diff %= 3600000;
      const m = Math.floor(diff / 60000); diff %= 60000;
      const s = Math.floor(diff / 1000);
      if (dEl) dEl.textContent = String(d);
      if (hEl) hEl.textContent = String(h).padStart(2,'0');
      if (mEl) mEl.textContent = String(m).padStart(2,'0');
      if (sEl) sEl.textContent = String(s).padStart(2,'0');
    }
    tickCd(); setInterval(tickCd, 1000);
  }

  // timeline filter removed per ultra v2 — all visible, no chip JS
})();
