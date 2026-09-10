/**
 * loader.js — Full-screen intro / loading screen
 *
 * Sequence (desktop, normal motion):
 *  0.08s orb fades in (scales up)
 *  0.40s name + role fade in
 *  0.70s progress bar appears, starts filling
 *  0.70s → 3.0s  bar fills
 *  3.4s  loader slides up, site is revealed
 *        → dispatches 'loaderComplete' when the slide finishes
 *
 * Mobile phones get a shortened version (~1.6s) — the intro is a first
 * impression, not something to sit through on a phone on mobile data.
 * prefers-reduced-motion skips it almost entirely.
 *
 * Safety: whatever happens below, index.html carries an inline failsafe that
 * tears the loader down after 8s and unlocks scrolling, so a JS error can
 * never leave a visitor staring at a frozen splash screen.
 */

'use strict';

PF.module('Loader', function initLoader() {

  const loader = document.getElementById('loader');
  if (!loader) return;

  /* Reveal the page and tell the rest of the app it can start. */
  function finish() {
    loader.style.display = 'none';
    loader.style.willChange = 'auto';
    document.body.style.overflow = '';
    document.body.classList.remove('is-loading');
    document.dispatchEvent(new CustomEvent('loaderComplete'));
  }

  /* Skip the animation on subsequent navigations in the same session
     (University ↔ index), but always replay it on a real reload. */
  if (!PF.isReload() && PF.storageGet('loaderShown')) {
    loader.style.display = 'none';
    document.body.style.overflow = '';
    document.body.classList.remove('is-loading');
    /* Fire after the other scripts have registered their listeners */
    setTimeout(function () {
      document.dispatchEvent(new CustomEvent('loaderComplete'));
    }, 50);
    return;
  }
  PF.storageSet('loaderShown', '1');

  const orb      = loader.querySelector('.loader-orb');
  const textEl   = loader.querySelector('.loader-text');
  const barWrap  = loader.querySelector('.loader-bar-wrap');
  const bar      = loader.querySelector('.loader-bar');
  const statusEl = loader.querySelector('.loader-status');

  /* ── Config ─────────────────────────────────────── */
  const reducedMotion = PF.reducedMotion();
  const isPhone       = window.matchMedia('(max-width: 767px)').matches;

  const BAR_DURATION_MS = reducedMotion ? 300 : (isPhone ? 900 : 2300);

  const STATUS_STEPS = reducedMotion ? [] : (isPhone
    ? [{ at: 700, text: 'Loading…' }, { at: 1450, text: 'Ready.' }]
    : [
        { at: 700,  text: 'Initializing...' },
        { at: 1500, text: 'Loading projects...' },
        { at: 2400, text: 'Almost there...' },
        { at: 3100, text: 'Ready.' },
      ]);

  /* ── Force scroll to top + lock body ──────────── */
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.body.style.overflow = 'hidden';
  document.body.classList.add('is-loading');

  /* ── Timeline ───────────────────────────────────── */
  const timers = [];
  const at = (fn, ms) => timers.push(setTimeout(fn, ms));

  at(() => orb && orb.classList.add('visible'), 80);
  at(() => textEl && textEl.classList.add('visible'), isPhone ? 260 : 400);

  at(function () {
    if (barWrap)  barWrap.classList.add('visible');
    if (statusEl) statusEl.classList.add('visible');

    /* Set the transition duration, then kick off the fill on the next frame */
    requestAnimationFrame(function () {
      if (bar) bar.style.transition = `width ${BAR_DURATION_MS}ms linear`;
      requestAnimationFrame(function () {
        if (bar) bar.style.width = '100%';
      });
    });
  }, isPhone ? 450 : 700);

  STATUS_STEPS.forEach(function (step) {
    at(function () { if (statusEl) statusEl.textContent = step.text; }, step.at);
  });

  /* ── Exit ───────────────────────────────────────── */
  const EXIT_AT = reducedMotion
    ? 400
    : (isPhone ? 450 : 700) + BAR_DURATION_MS + (isPhone ? 250 : 400);
  const TRANSITION_MS = 750; /* matches the CSS transition duration */

  at(function () {
    /* Scroll to top while the loader still covers the screen → no visible jump */
    window.scrollTo({ top: 0, behavior: 'instant' });
    loader.classList.add('exit');
  }, EXIT_AT);

  at(finish, EXIT_AT + TRANSITION_MS);

  /* If the tab is hidden during the intro the timers are throttled and the
     splash can still be up on return — collapse it immediately instead. */
  document.addEventListener('visibilitychange', function onHide() {
    if (!document.hidden) return;
    document.removeEventListener('visibilitychange', onHide);
    timers.forEach(clearTimeout);
    finish();
  });

});
