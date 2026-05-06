/**
 * loader.js — Full-screen intro / loading screen
 *
 * Sequence (normal motion):
 *  0.0s  orb fades in (scales up)
 *  0.4s  name + role fade in
 *  0.7s  progress bar appears, starts filling
 *  0.7s → 3.0s  bar fills (2.3s)
 *  3.2s  brief pause, status → "Ready"
 *  3.5s  loader slides up, site is revealed
 *  3.5s  dispatches 'loaderComplete' → orb guide starts
 *
 * Sequence (prefers-reduced-motion):
 *  0.4s  loader slides up immediately (no bar fill, no settle pause)
 *  1.15s dispatches 'loaderComplete'
 */

'use strict';

(function initLoader() {

  const loader = document.getElementById('loader');
  if (!loader) return;

  /* Skip animation on subsequent navigations this session (University ↔ index),
     but always show on reload. */
  const navEntry = performance.getEntriesByType('navigation')[0];
  const isReload = navEntry
    ? navEntry.type === 'reload'
    : (performance.navigation?.type === 1);

  if (!isReload && sessionStorage.getItem('loaderShown')) {
    loader.style.display = 'none';
    document.body.style.overflow = '';
    /* Fire loaderComplete after all scripts have registered their listeners */
    setTimeout(function () {
      document.dispatchEvent(new CustomEvent('loaderComplete'));
    }, 50);
    return;
  }
  sessionStorage.setItem('loaderShown', '1');

  const orb       = loader.querySelector('.loader-orb');
  const textEl    = loader.querySelector('.loader-text');
  const barWrap   = loader.querySelector('.loader-bar-wrap');
  const bar       = loader.querySelector('.loader-bar');
  const statusEl  = loader.querySelector('.loader-status');

  /* ── Config ─────────────────────────────────────── */
  const reducedMotion   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BAR_DURATION_MS = reducedMotion ? 300 : 2300;

  const STATUS_STEPS = reducedMotion ? [] : [
    { at: 700,  text: 'Initializing...' },
    { at: 1500, text: 'Loading projects...' },
    { at: 2400, text: 'Almost there...' },
    { at: 3100, text: 'Ready.' },
  ];

  /* ── Force scroll to top + lock body ──────────── */
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.body.style.overflow = 'hidden';

  /* ── Timeline ───────────────────────────────────── */
  const timers = [];

  // Step 1 — orb appears
  timers.push(setTimeout(() => orb?.classList.add('visible'), 80));

  // Step 2 — text appears
  timers.push(setTimeout(() => textEl?.classList.add('visible'), 400));

  // Step 3 — bar appears + starts filling
  timers.push(setTimeout(() => {
    barWrap?.classList.add('visible');
    statusEl?.classList.add('visible');

    // Set transition duration then kick off fill
    requestAnimationFrame(() => {
      if (bar) bar.style.transition = `width ${BAR_DURATION_MS}ms linear`;
      requestAnimationFrame(() => {
        if (bar) bar.style.width = '100%';
      });
    });
  }, 700));

  // Status text steps
  STATUS_STEPS.forEach(({ at, text }) => {
    timers.push(setTimeout(() => {
      if (statusEl) statusEl.textContent = text;
    }, at));
  });

  // Step 4 — exit
  const EXIT_AT = reducedMotion
    ? 400  // minimal delay for reduced-motion users (skip bar fill + settle pause)
    : 700 + BAR_DURATION_MS + 400; // bar start + fill + small pause
  const TRANSITION_MS = 750; // matches CSS transition duration

  timers.push(setTimeout(() => {
    /* Scroll to top while loader still covers the screen → no visible teleport */
    window.scrollTo({ top: 0, behavior: 'instant' });
    loader.classList.add('exit');
  }, EXIT_AT));

  timers.push(setTimeout(() => {
    loader.style.display = 'none';
    loader.style.willChange = 'auto';
    document.body.style.overflow = '';
    document.dispatchEvent(new CustomEvent('loaderComplete'));
  }, EXIT_AT + TRANSITION_MS));

})();
