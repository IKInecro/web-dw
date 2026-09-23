// ponytail: hermes-like smooth + parallax + vercel composition, no deps
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
    document.body.style.overflow = open ? 'hidden' : '';
  });
  const closeNav = () => {
    nav?.classList.remove('is-open');
    btn?.classList.remove('is-open');
    btn?.setAttribute('aria-expanded', 'false');
    const icon = btn?.querySelector('i');
    if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-xmark'); }
    document.body.style.overflow = '';
  };
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('click', e => { if (!nav?.contains(e.target) && !btn?.contains(e.target)) closeNav(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  // sticky shadow
  const onScrollBar = () => bar?.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScrollBar, { passive: true });
  onScrollBar();

  // hermes-like smooth scroll — tiny lerp without lib (ponytail: no lenis dep, 20 lines)
  // respect prefers-reduced-motion
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let useSmooth = !prefersReduced && innerWidth > 768; // mobile native
  if (useSmooth) {
    document.documentElement.classList.add('lenis');
    let target = scrollY, cur = scrollY, rafId = null, ticking = false;
    const ease = 0.075; // hermes feel: lower = smoother
    const onWheel = e => {
      // let native scroll handle but lerp via target
      target = Math.min(Math.max(0, target + e.deltaY), document.documentElement.scrollHeight - innerHeight);
      if (!ticking) { ticking = true; rafId = requestAnimationFrame(loop); }
    };
    // hijack wheel only for desktop hermes feel, keep touch native
    // ponytail: optional — if user complains lag, comment next line to disable
    // Using passive wheel + lerp via scrollTo
    let loop = () => {
      cur += (target - cur) * ease;
      if (Math.abs(target - cur) < 0.5) { cur = target; ticking = false; cancelAnimationFrame(rafId); }
      else rafId = requestAnimationFrame(loop);
      scrollTo(0, cur);
      // update parallax & reveal in same tick for perf
      updateParallax(cur);
    };
    // Sync target with native scroll (mouse wheel, keyboard, scrollbar)
    addEventListener('scroll', () => { if (!ticking) target = cur = scrollY; }, { passive: true });
    // Note: we don't preventDefault wheel — we just lerp target; native scroll still fires but we smooth it via rAF
    // For true hermes, uncomment to use virtual scroll:
    // addEventListener('wheel', onWheel, { passive: false });
    // Instead lightweight: just smooth anchor clicks via animate
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
          const el = document.querySelector(id);
          if (el) {
            e.preventDefault();
            const top = el.getBoundingClientRect().top + scrollY - 72;
            smoothTo(top);
          }
        }
      });
    });
    function smoothTo(to) {
      target = to; ticking = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(function animate(){ cur += (target - cur)*0.09; scrollTo(0,cur); if(Math.abs(target-cur)>0.5) requestAnimationFrame(animate); else { cur=target; scrollTo(0,cur); ticking=false; } });
    }
  }
  // ultra v2: Jelajahi Festival smooth for all devices (even mobile) — hermes offset
  if (!prefersReduced) {
    const jelajahi = document.querySelector('a[href="#tema"]');
    if (jelajahi && !useSmooth) {
      jelajahi.addEventListener('click', e => {
        e.preventDefault();
        const el = document.getElementById('tema');
        if (!el) return;
        const top = el.getBoundingClientRect().top + scrollY - 76;
        // simple rAF lerp without lenis deps
        let cur2 = scrollY, tgt = top;
        (function anim(){ cur2 += (tgt - cur2)*0.09; scrollTo(0,cur2); if(Math.abs(tgt-cur2)>0.5) requestAnimationFrame(anim); else scrollTo(0,tgt); })();
      });
    }
    // fallback for any hash link when not lenis
    if (!useSmooth) {
      document.querySelectorAll('a[href^="#"]').forEach(a=>{
        if(a.getAttribute('href')==="#tema") return; // already handled
        a.addEventListener('click', e=>{
          const id=a.getAttribute('href'); if(id.length<=1) return;
          const el=document.querySelector(id); if(!el) return;
          e.preventDefault();
          const top=el.getBoundingClientRect().top+scrollY-76;
          let cur2=scrollY, tgt=top;
          (function anim(){ cur2+=(tgt-cur2)*0.09; scrollTo(0,cur2); if(Math.abs(tgt-cur2)>0.5) requestAnimationFrame(anim); else scrollTo(0,tgt); })();
        });
      });
    }
  }

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
