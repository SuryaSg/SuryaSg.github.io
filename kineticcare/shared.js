/* ══════════════════════════════════════════════════════════════════
   KINETICCARE — SHARED JS
   Loaded at end of body on every page. Owns:
   - Theme toggle (already bootstrapped synchronously in <head>)
   - Nav scroll behaviour (#nav.stuck)
   - Mobile burger + drawer
   - Scroll reveal (IntersectionObserver on .rv)
   - WhatsApp floating button injection
   - Stat counter animation (data-n / data-s)
   - LIVE patient counter (increments on random interval)
   - Page transitions via View Transitions API
   - Testimonial grid/scroll visibility guard

   Per-page scripts (spine canvas, booking form, 3D viewer) run
   after this file and can rely on KC.* utilities.
══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const html = document.documentElement;
  const isMob = () => window.innerWidth <= 768;
  const isDark = () => html.getAttribute('data-theme') === 'dark';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Expose namespace for page scripts
  window.KC = {
    isDark, isMob, prefersReducedMotion,
    onTheme: new Set(),   // page scripts can register callbacks for theme changes
  };

  /* ─── 1. THEME TOGGLE ──────────────────────────────────── */
  function toggleTheme(){
    const next = isDark() ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    try{ localStorage.setItem('kc-theme', next); }catch(e){}
    const meta = document.getElementById('meta-theme-color');
    if(meta) meta.content = next === 'dark' ? '#0E0B08' : '#FAF8F3';
    // Notify any registered callbacks (canvases, WebGL scenes, etc.)
    window.KC.onTheme.forEach(cb => { try{ cb(next); }catch(e){} });
    // Refresh GSAP ScrollTrigger if present (landing page)
    if(window.ScrollTrigger) setTimeout(() => window.ScrollTrigger.refresh(), 450);
  }
  document.querySelectorAll('#theme-btn,#drawer-theme').forEach(btn=>{
    btn.addEventListener('click', toggleTheme);
  });

  /* ─── 2. NAV SCROLL ──────────────────────────────────── */
  const nav = document.getElementById('nav');
  if(nav){
    const onScroll = () => nav.classList.toggle('stuck', window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  /* ─── 3. MOBILE BURGER + DRAWER ───────────────────────── */
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('drawer');
  function syncDrawerA11y(){
    if(!burger || !drawer) return;
    const open = drawer.classList.contains('open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    drawer.setAttribute('aria-hidden', String(!open));
  }
  function closeDrawer(){
    if(!burger || !drawer) return;
    burger.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
    syncDrawerA11y();
  }
  if(burger && drawer){
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      drawer.classList.toggle('open');
      document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
      syncDrawerA11y();
    });
    drawer.querySelectorAll('.drawer-link,.dl').forEach(a => a.addEventListener('click', closeDrawer));
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
    window.KC.closeDrawer = closeDrawer;
  }

  /* ─── 4. SCROLL REVEAL ────────────────────────────────── */
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, {threshold: 0.08});
    document.querySelectorAll('.rv').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
  }

  /* ─── 5. WHATSAPP FLOATING BUTTON ─────────────────────── */
  // Hide on the booking page and thank-you page
  const hidePages = ['/book.html', '/thank-you.html'];
  const path = window.location.pathname;
  const hideWA = hidePages.some(p => path.endsWith(p));
  if(!hideWA && !document.getElementById('wa-btn')){
    const wa = document.createElement('a');
    wa.id = 'wa-btn';
    wa.href = "https://wa.me/919000000000?text=" + encodeURIComponent("Hi, I'd like to book a free assessment at KineticCare.");
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.setAttribute('aria-label','Chat on WhatsApp to book a free assessment');
    wa.innerHTML = `
      <span class="wa-pulse" aria-hidden="true"></span>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20.52 3.48A11.77 11.77 0 0 0 12.04 0C5.46 0 .11 5.35.11 11.93c0 2.1.55 4.16 1.6 5.97L0 24l6.27-1.64a11.9 11.9 0 0 0 5.77 1.47h.01c6.57 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.18-3.46-8.42ZM12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.72.97.99-3.62-.23-.37a9.85 9.85 0 0 1-1.51-5.26c0-5.46 4.44-9.9 9.9-9.9 2.64 0 5.13 1.03 6.99 2.9a9.83 9.83 0 0 1 2.9 7c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.49-1.78-1.66-2.08-.17-.3-.02-.47.13-.62.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.48 1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.09 4.49.71.3 1.27.48 1.7.62.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.34Z"/>
      </svg>`;
    document.body.appendChild(wa);
  }

  /* ─── 6. STAT COUNTERS ────────────────────────────────── */
  function animateCounter(el){
    const n = parseInt(el.dataset.n, 10);
    if(!isFinite(n)) return;
    const suffix = el.dataset.s || '';
    const isK = n >= 1000;
    const target = isK ? Math.round(n / 1000) : n;
    const dur = 1600;
    const t0 = performance.now();
    function step(now){
      const f = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - f, 3);
      const v = Math.round(target * eased);
      el.innerHTML = v + '<em>' + suffix + '</em>';
      if(f < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){
          setTimeout(() => {
            e.target.querySelectorAll('[data-n]').forEach(animateCounter);
          }, 300);
          io.unobserve(e.target);
        }
      });
    }, {threshold: 0.1});
    document.querySelectorAll('[data-counter-group],#stats').forEach(el => io.observe(el));
    // Solo counters (not in a group)
    document.querySelectorAll('[data-n]:not([data-counter-group] [data-n]):not(#stats [data-n])').forEach(el => {
      const parent = el.closest('[data-counter-group],#stats');
      if(!parent) io.observe(el);
    });
  }

  /* ─── 7. LIVE PATIENT COUNTER ─────────────────────────── */
  // Element with data-live-counter and a starting value in textContent
  const liveEl = document.querySelector('[data-live-counter]');
  if(liveEl && !prefersReducedMotion){
    let count = parseInt(liveEl.textContent, 10);
    if(!isFinite(count)) count = 42;
    function tick(){
      const delta = Math.random() < 0.5 ? -1 : 1;
      count = Math.max(35, Math.min(55, count + delta));
      // Flip animation
      liveEl.style.transition = 'transform .15s ease-out,opacity .15s ease-out';
      liveEl.style.transform = 'translateY(-4px)';
      liveEl.style.opacity = '0';
      setTimeout(() => {
        liveEl.textContent = String(count);
        liveEl.style.transform = 'translateY(4px)';
        setTimeout(() => {
          liveEl.style.transition = 'transform .3s cubic-bezier(.16,1,.3,1),opacity .3s ease';
          liveEl.style.transform = 'translateY(0)';
          liveEl.style.opacity = '1';
        }, 20);
      }, 160);
      const nextDelay = 60000 + Math.random() * 30000; // 60–90s
      setTimeout(tick, nextDelay);
    }
    setTimeout(tick, 45000 + Math.random() * 15000); // first flip 45–60s after load
  }

  /* ─── 8. TESTIMONIAL GRID/SCROLL VISIBILITY GUARD ─────── */
  function syncTestiVisibility(){
    const grid = document.querySelector('.testi-grid');
    const scroll = document.querySelector('.testi-scroll');
    const dots = document.querySelector('.testi-dots');
    if(!grid || !scroll) return;
    if(isMob()){
      grid.style.display = 'none';
      scroll.style.display = 'flex';
      if(dots) dots.style.display = 'flex';
    } else {
      grid.style.display = '';
      scroll.style.display = 'none';
      if(dots) dots.style.display = 'none';
    }
  }
  // Only run if both exist (landing page)
  if(document.querySelector('.testi-grid') && document.querySelector('.testi-scroll')){
    syncTestiVisibility();
    window.addEventListener('resize', syncTestiVisibility, {passive:true});
  }

  /* ─── 9. PAGE TRANSITIONS (View Transitions API) ─────── */
  if('startViewTransition' in document && !prefersReducedMotion){
    document.addEventListener('click', e => {
      // Only intercept same-origin internal navigation
      const link = e.target.closest('a[href]');
      if(!link) return;
      if(link.hasAttribute('download')) return;
      if(link.target && link.target !== '_self') return;
      if(e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      const href = link.getAttribute('href');
      if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) return;
      // Only intercept .html and bare internal paths
      if(!href.endsWith('.html') && !href.endsWith('/') && !href.match(/^[a-z0-9_-]+$/i)) return;
      e.preventDefault();
      document.startViewTransition(() => {
        window.location.href = link.href;
      });
    });
  }

  /* ─── 10. PROGRESS BARS (data-w attribute) ────────────── */
  if('IntersectionObserver' in window){
    const pbIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.querySelectorAll('[data-w]').forEach(bar => {
            bar.style.width = bar.dataset.w + '%';
          });
          pbIO.unobserve(e.target);
        }
      });
    }, {threshold: 0.3});
    const trigger = document.getElementById('dash-trig');
    if(trigger) pbIO.observe(trigger);
  }

})();
