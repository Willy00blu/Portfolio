/**
 * main.js — hero entrance, typing effect, scroll tracker, smooth scroll,
 *           card glow, image fallbacks
 *
 * Every block is registered through PF.module() so that one failing feature
 * cannot stop the ones declared after it.
 */
'use strict';


/* ── Hero ready — entrance animations start once the loader is gone ── */
PF.module('HeroReady', function () {
  function markReady() { document.body.classList.add('hero-ready'); }

  document.addEventListener('loaderComplete', markReady, { once: true });

  /* No loader on this page (or it was skipped): start straight away */
  if (!document.getElementById('loader')) setTimeout(markReady, 150);

  /* Last-resort safety net: the hero is invisible until this class lands, so
     it must land no matter what happens to the loader. */
  setTimeout(markReady, 6000);
});


/* ── Typing effect ─────────────────────────────────────────────────── */
PF.module('Typing', function () {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const roles = [
    'Computer Engineering Student',
    'Data & AI Enthusiast',
    'Occasional Musician',
    'Problem Solver',
  ];

  /* Reduced motion: show one role, no animation at all */
  if (PF.reducedMotion()) { el.textContent = roles[0]; return; }

  const SPEED_TYPE  = 70;
  const SPEED_DEL   = 40;
  const PAUSE_END   = 1800;
  const PAUSE_START = 400;

  let roleIdx = 0, charIdx = 0, deleting = false, timer = null;

  function tick() {
    const role = roles[roleIdx];

    if (!deleting) {
      el.textContent = role.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === role.length) {
        deleting = true;
        timer = setTimeout(tick, PAUSE_END);
        return;
      }
    } else {
      el.textContent = role.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        timer = setTimeout(tick, PAUSE_START);
        return;
      }
    }

    timer = setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }

  /* Stop the loop while the tab is in the background — it is pure battery
     drain on a phone, and setTimeout drift makes it stutter on return. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      clearTimeout(timer);
    } else if (started) {
      clearTimeout(timer);
      timer = setTimeout(tick, 300);
    }
  });

  let started = false;
  function startTyping() {
    if (started) return;
    started = true;
    timer = setTimeout(tick, 750);
  }

  document.addEventListener('loaderComplete', startTyping, { once: true });
  if (!document.getElementById('loader')) setTimeout(startTyping, 150);
  setTimeout(startTyping, 6000);   /* safety net, same as the hero */
});


/* ── Active section tracker ────────────────────────────────────────── */
PF.module('ScrollTracker', function () {
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(function (entries) {
    /* Pick the entry closest to the top of the band instead of firing for
       every intersecting section — short sections used to steal the
       highlight from the one actually being read. */
    const visible = entries
      .filter(function (e) { return e.isIntersecting; })
      .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });

    if (!visible.length) return;
    document.dispatchEvent(new CustomEvent('activeSection', {
      detail: { id: visible[0].target.id },
    }));
  }, { rootMargin: '-25% 0px -55% 0px', threshold: 0 });

  sections.forEach(function (s) { observer.observe(s); });
});


/* ── Smooth scroll for in-page anchors ─────────────────────────────── */
PF.module('SmoothScroll', function () {
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    /* "#" and "#!" are not selectors — querySelector would throw on them */
    if (!href || href === '#' || href.length < 2) return;

    let target = null;
    try { target = document.getElementById(decodeURIComponent(href.slice(1))); }
    catch { return; }
    if (!target) return;

    e.preventDefault();

    const navH = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
    ) || 68;

    const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: PF.reducedMotion() ? 'auto' : 'smooth',
    });

    /* Keep the URL and the keyboard focus in sync with where we landed */
    if (history.replaceState) history.replaceState(null, '', href);
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});


/* ── Project card mouse glow (pointer devices only) ────────────────── */
PF.module('CardGlow', function () {
  if (PF.isTouch()) return;   /* no cursor to follow — skip the listeners */

  document.querySelectorAll('.project-card').forEach(function (card) {
    let rafPending = false, lastX = 0, lastY = 0;

    card.addEventListener('mousemove', function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(function () {
        rafPending = false;
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        card.style.setProperty('--mx', ((lastX - rect.left) / rect.width  * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((lastY - rect.top)  / rect.height * 100).toFixed(1) + '%');
      });
    }, { passive: true });

    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });
});


/* ── Image fallbacks ───────────────────────────────────────────────────
   Images are served as WebP (≈100× smaller than the PNG originals). Any
   browser too old for WebP — or a corrupted/missing file — falls back to
   the original asset named in data-fallback, and only if that fails too is
   the slot hidden. No inline onerror handlers in the markup.          */
PF.module('ImageFallback', function () {
  function handle(img) {
    if (img.dataset.fallbackApplied === '1') {
      /* The fallback failed as well — hide the image (and its wrapper). */
      const wrap = img.closest('.project-img-wrap');
      if (wrap) wrap.style.display = 'none';
      else img.style.visibility = 'hidden';
      return;
    }
    const fallback = img.dataset.fallback;
    if (!fallback) {
      const wrap = img.closest('.project-img-wrap');
      if (wrap) wrap.style.display = 'none';
      else img.style.visibility = 'hidden';
      return;
    }
    img.dataset.fallbackApplied = '1';
    img.src = fallback;
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () { handle(img); });
    /* Images that already failed before this script ran */
    if (img.complete && img.naturalWidth === 0) handle(img);
  });
});


/* ── Console signature ─────────────────────────────────────────────── */
PF.onReady(function () {
  console.log(
    '%c Guglielmo Rotunno %c Computer Engineering @ Politecnico di Milano ',
    'background:#856de5;color:#fff;font-weight:700;padding:4px 8px;border-radius:4px 0 0 4px;font-family:monospace;',
    'background:#13131e;color:#a78bfa;padding:4px 8px;border-radius:0 4px 4px 0;font-family:monospace;border:1px solid #2a2a42;'
  );
});
