'use strict';

/**
 * orb.js — Floating portfolio guide assistant
 *
 * Depends on: orb-scene.js (required) and utils.js.
 * GSAP is optional — PF.animator() falls back to an internal rAF tween if the
 * CDN is blocked or offline, so the orb never disappears because of a network
 * failure.
 *
 * Sequence after 'loaderComplete':
 *  1. 2D canvas sphere appears at viewport centre (scale 2.1)
 *  2. Corner bubble types intro message
 *  3. Sphere flies to bottom-right corner via GSAP expo.out
 *  4. Bubble shows hero message; updates per section on scroll
 */
PF.module('Orb', function initOrb() {

  const bubble   = document.getElementById('orb-bubble');
  const textEl   = document.getElementById('orb-text');
  const closeBtn = document.getElementById('orb-close');
  const hitBtn   = document.getElementById('orb-hit');
  const labelEl  = bubble && bubble.querySelector('.orb-section');

  if (!bubble || !textEl || !hitBtn) return;

  if (typeof OrbScene === 'undefined') {
    /* Without the renderer there is nothing to point at — remove the empty
       hit target so it cannot swallow taps in the corner. */
    const wrap = document.getElementById('orb-wrap');
    if (wrap) wrap.remove();
    return;
  }

  /* GSAP comes from a CDN that can be blocked, offline or simply slow.
     PF.animator() hands back GSAP when it is there and an equivalent
     rAF tween when it is not, so the orb behaves identically either way. */
  const anim = PF.animator();

  /* Touch users get the guide once per section and then it steps aside:
     a bubble parked over the bottom-right corner of a phone screen covers
     content and sits exactly where the thumb scrolls. */
  const isTouch       = PF.isTouch();
  const AUTO_HIDE_MS  = 6500;
  let   autoHideTimer = null;

  /* ── Page-level config via data attributes on <body> ─────── */
  const introText  = document.body.dataset.orbIntro  || 'System ready. Scroll to initialize the tour';
  const cornerMsg  = document.body.dataset.orbCorner || null;
  const _defaultSection = cornerMsg ? '_corner' : 'hero';

  /* Per-page intro tracking — one sessionStorage key, array of pathnames */
  const _SHOWN_KEY   = 'orbIntroShownPages';
  const _currentPath = window.location.pathname;

  function _shownList() {
    try { return JSON.parse(PF.storageGet(_SHOWN_KEY, '[]')) || []; }
    catch { return []; }
  }
  function _hasShownIntro() { return _shownList().includes(_currentPath); }
  function _markIntroShown() {
    const shown = _shownList();
    if (!shown.includes(_currentPath)) shown.push(_currentPath);
    PF.storageSet(_SHOWN_KEY, JSON.stringify(shown));
  }
  function _clearShownIntros() { PF.storageRemove(_SHOWN_KEY); }

  /* ── Messages ─────────────────────────────────────────────── */
  const MESSAGES = {
    _intro:    { text: introText },
    _corner:   { label: null,         text: cornerMsg || '' },
    hero:      { label: null,         text: 'Welcome! I will guide you through my portfolio. Feel free to click me to toggle this view' },
    about:     { label: 'about me',   text: 'A quick look into my background, skills, and what drives me' },
    education: { label: 'education',  text: 'Left home, moved to Milan, and started Computer Engineering at Politecnico di Milano' },
    experiences: { label: 'experiences', text: 'Here my extracurricular activities and collaborative initiatives' },
    projects:  { label: 'projects',   text: 'A collection of personal projects, late-night ideas, and everything in between' },
    contacts:  { label: 'contacts',   text: 'And finally, here is how you can reach me if you want to get in touch' },
  };

  const TYPING_CPS     = 55;
  const INTRO_PAUSE_MS = 1100;
  /* Resting size is derived from the button in orb.css — one source of truth
     for both the drawn sphere and the tap target (see orb-scene.js). */
  const CORNER_SCALE   = OrbScene.getCornerScale ? OrbScene.getCornerScale() : 1.44;

  let typingTimer    = null;
  let currentSection = null;
  let userClosed     = false;
  let orbReady       = false;

  /* ── Spotlight overlay ───────────────────────────────────── */
  const spotlight = document.createElement('div');
  spotlight.id = 'orb-spotlight';
  document.body.appendChild(spotlight);

  /* ── Init 2D canvas scene ────────────────────────────────── */
  const orbData = OrbScene.init();
  if (!orbData) {
    const wrap = document.getElementById('orb-wrap');
    if (wrap) wrap.remove();
    return;
  }
  const { state, getCorner, getCenter } = orbData;

  /* ── Typing (rAF-based, synced to display refresh) ────────── */
  function typeText(text, onDone) {
    cancelAnimationFrame(typingTimer);

    /* Reduced motion: show the whole sentence at once */
    if (PF.reducedMotion()) {
      textEl.classList.remove('typing');
      textEl.textContent = text;
      if (onDone) onDone();
      return;
    }

    textEl.textContent = '';
    textEl.classList.add('typing');
    let i = 0, lastTs = null;

    function step(ts) {
      if (!lastTs) lastTs = ts;
      const chars = Math.floor((ts - lastTs) / (1000 / TYPING_CPS));
      if (chars > 0) {
        lastTs = ts;
        i = Math.min(i + chars, text.length);
        textEl.textContent = text.slice(0, i);
      }
      if (i < text.length) {
        typingTimer = requestAnimationFrame(step);
      } else {
        textEl.classList.remove('typing');
        if (onDone) onDone();
      }
    }

    typingTimer = requestAnimationFrame(step);
  }

  /* ── Bubble ───────────────────────────────────────────────── */
  function showBubble(sectionId) {
    const msg = MESSAGES[sectionId];
    if (!msg) return;
    currentSection = sectionId;
    if (labelEl) {
      labelEl.textContent   = msg.label || '';
      labelEl.style.display = msg.label ? 'block' : 'none';
    }
    bubble.classList.add('visible');
    typeText(msg.text);

    clearTimeout(autoHideTimer);
    if (isTouch) autoHideTimer = setTimeout(hideBubble, AUTO_HIDE_MS);
  }

  function hideBubble() {
    clearTimeout(autoHideTimer);
    cancelAnimationFrame(typingTimer);
    textEl.classList.remove('typing');
    bubble.classList.remove('visible');
  }

  /* ── Intro sequence ───────────────────────────────────────── */
  function startIntro() {
    hitBtn.style.pointerEvents = 'none';

    /* Synchronous teleport — happens before the first post-loader paint,
       so the sphere appears at centre large on the very first visible frame. */
    const center = getCenter();
    state.x     = center.x;
    state.y     = center.y;
    state.scale = 2.52;

    /* Intro layout: bubble centred above sphere */
    document.body.classList.add('orb-intro');

    /* Spotlight appears immediately with the sphere */
    spotlight.classList.add('visible');

    /* Brief settle, then bubble + type intro message */
    setTimeout(function () {
      if (labelEl) labelEl.style.display = 'none';
      bubble.classList.add('visible');
      typeText(MESSAGES._intro.text, function () {
        setTimeout(flyToCorner, INTRO_PAUSE_MS);
      });
    }, 350);
  }

  function flyToCorner() {
    hideBubble();
    /* Fast fade-out (150ms) so spotlight is gone before sphere starts flying at 280ms */
    spotlight.style.transition = 'opacity 0.15s ease';
    spotlight.classList.remove('visible');
    spotlight.addEventListener('transitionend', function restoreTransition() {
      spotlight.style.transition = '';
      spotlight.removeEventListener('transitionend', restoreTransition);
    });

    /* Brief pause so bubble fade-out completes before flight */
    setTimeout(function () {
      document.body.classList.remove('orb-intro'); /* restore corner layout */
      const corner = getCorner();
      anim.to(state, {
        x:         corner.x,
        y:         corner.y,
        scale:     CORNER_SCALE,
        duration:  1,
        ease:      'expo.out',
        overwrite: 'auto',
        onComplete: function () {
          orbReady = true;
          hitBtn.style.pointerEvents = '';
          if (!userClosed) showBubble(_defaultSection);
          initSectionObserver();
        },
      });
    }, 280);
  }

  /* ── Section observer ─────────────────────────────────────── */
  function initSectionObserver() {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        if (!MESSAGES[id]) return;
        if (id === currentSection && bubble.classList.contains('visible')) return;
        if (userClosed) return;
        showBubble(id);
      });
    }, { rootMargin: '-30% 0px -50% 0px', threshold: 0 });

    document.querySelectorAll('section[id]').forEach(function (s) {
      observer.observe(s);
    });
  }

  /* ── Hover — scale sphere via hit button ──────────────────── */
  hitBtn.addEventListener('mouseenter', function () {
    if (!orbReady || isTouch) return;
    anim.to(state, { scale: CORNER_SCALE * 1.08, duration: 0.2, ease: 'power2.out' });
  });
  hitBtn.addEventListener('mouseleave', function () {
    if (!orbReady || isTouch) return;
    anim.to(state, { scale: CORNER_SCALE, duration: 0.2, ease: 'power2.out' });
  });

  /* ── Click ────────────────────────────────────────────────── */
  hitBtn.addEventListener('click', function () {
    if (!orbReady) return;
    /* Tactile bounce */
    anim.to(state, { scale: CORNER_SCALE * 0.88, duration: 0.08, ease: 'power2.in',
      onComplete: function () {
        anim.to(state, { scale: CORNER_SCALE, duration: 0.25, ease: 'back.out(2)' });
      },
    });
    if (bubble.classList.contains('visible')) {
      userClosed = true;
      hideBubble();
    } else {
      userClosed = false;
      showBubble(currentSection || _defaultSection);
    }
  });

  /* ── Reposition on resize / rotation ──────────────────────
     Debounced: on mobile the URL bar collapsing fires resize continuously,
     and re-snapping the orb on every event made it jitter.               */
  const reposition = PF.debounce(function () {
    if (!orbReady) return;
    anim.kill(state);
    const corner = getCorner();
    state.x = corner.x;
    state.y = corner.y;
    state.scale = OrbScene.getCornerScale ? OrbScene.getCornerScale() : CORNER_SCALE;
  }, 120);

  window.addEventListener('resize', reposition, { passive: true });
  window.addEventListener('orientationchange', reposition, { passive: true });

  /* ── Close button ─────────────────────────────────────────── */
  if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      userClosed = true;
      hideBubble();
      /* If closed during intro, complete the fly-to-corner sequence */
      if (!orbReady) flyToCorner();
    });
  }

  /* ── Start ────────────────────────────────────────────────── */
  function _snapToCorner() {
    const corner = getCorner();
    state.x     = corner.x;
    state.y     = corner.y;
    state.scale = CORNER_SCALE;
    orbReady = true;
    hitBtn.style.pointerEvents = '';
    if (!userClosed) showBubble(_defaultSection);
    initSectionObserver();
  }

  let _started = false;
  function _maybeStart() {
    if (_started) return;
    _started = true;

    /* Reduced motion: no fly-in, no spotlight — the orb is simply there */
    if (PF.reducedMotion()) { _snapToCorner(); return; }

    const isReload = PF.isReload();

    /* isSubPage = true on pages with a custom orb-intro message (e.g. University) */
    const isSubPage = !!document.body.dataset.orbIntro;

    if (isReload && !isSubPage) {
      /* Home reload — reset session and play intro from scratch */
      _clearShownIntros();
      _markIntroShown();
      startIntro();
    } else if (!isReload && !_hasShownIntro()) {
      /* First navigation to this page this session — play intro */
      _markIntroShown();
      startIntro();
    } else {
      /* Sub-page reload OR already seen intro — go straight to corner */
      _snapToCorner();
    }
  }

  document.addEventListener('loaderComplete', _maybeStart, { once: true });

  /* Fallback: if loaderComplete never fires, start after 5 s */
  setTimeout(_maybeStart, 5000);

  /* If no loader element at all, start after 600 ms */
  if (!document.getElementById('loader')) setTimeout(_maybeStart, 600);

});
