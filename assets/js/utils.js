/**
 * utils.js — shared runtime helpers (must be the first script on the page)
 *
 * Everything here exists for one reason: a portfolio is a static site that
 * runs in browsers we do not control (private mode, blocked CDNs, storage
 * disabled by policy, old WebViews). A single uncaught error used to take
 * the whole page down with it — the loader would stay up forever and the
 * site would look broken. These helpers make every failure local.
 *
 * Exposes a single global: window.PF
 */
'use strict';

window.PF = (function () {

  /* ── Storage that can never throw ──────────────────────────────────
     Safari in private mode and "block all cookies" make sessionStorage
     access throw a SecurityError on read, not just on write.          */
  function storageGet(key, fallback) {
    try {
      const v = window.sessionStorage.getItem(key);
      return v === null ? (fallback ?? null) : v;
    } catch { return fallback ?? null; }
  }

  function storageSet(key, value) {
    try { window.sessionStorage.setItem(key, value); return true; }
    catch { return false; }
  }

  function storageRemove(key) {
    try { window.sessionStorage.removeItem(key); } catch {}
  }

  /* ── Environment ──────────────────────────────────────────────────── */
  function isReload() {
    try {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) return nav.type === 'reload';
      return performance.navigation && performance.navigation.type === 1;
    } catch { return false; }
  }

  function reducedMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch { return false; }
  }

  function isTouch() {
    try { return window.matchMedia('(hover: none)').matches; }
    catch { return false; }
  }

  /* ── DOM ready ────────────────────────────────────────────────────── */
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  /**
   * Run a module's init inside a guard.
   * One broken feature must never stop the ones declared after it — several
   * of these live in the same file, where a throw would skip the rest.
   */
  function module(name, fn) {
    try { fn(); }
    catch (err) { console.error('[' + name + '] init failed:', err); }
  }

  /* ── loaderComplete, but sticky ────────────────────────────────────
     The intro loader can finish before a script that cares about it has
     even executed — GSAP comes from a CDN, and on a phone it can easily
     take longer than the (shortened) loader. A plain addEventListener
     would then miss the event forever and the orb would only appear from
     its fallback timer. utils.js runs first on every page, so it is the
     one place that can reliably record that the event already fired.   */
  let _loaderDone = false;
  document.addEventListener('loaderComplete', function () { _loaderDone = true; }, { once: true });

  function onLoaderComplete(fn) {
    if (_loaderDone) { fn(); return; }
    document.addEventListener('loaderComplete', fn, { once: true });
  }

  function loaderDone() { return _loaderDone; }

  /* ── Debounce / throttle for scroll & resize handlers ─────────────── */
  function debounce(fn, wait) {
    let t;
    return function () {
      const args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  /* ── Minimal tween — the fallback when the GSAP CDN is unreachable ──
     Same call shape as gsap.to(target, {prop, duration, ease, onComplete})
     for the handful of properties the orb animates.                    */
  const _running = new Map();

  const EASES = {
    'expo.out':   t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    'power2.out': t => 1 - Math.pow(1 - t, 2),
    'power2.in':  t => t * t,
    'back.out':   t => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2),
    linear:       t => t,
  };

  function tween(target, opts) {
    const duration = (opts.duration || 0.3) * 1000;
    const ease     = EASES[String(opts.ease || '').replace(/\(.*\)$/, '')] || EASES['power2.out'];
    const keys     = Object.keys(opts).filter(k =>
      !['duration', 'ease', 'onComplete', 'overwrite'].includes(k));
    const from     = {};
    keys.forEach(k => { from[k] = target[k]; });

    killTweensOf(target);

    const start = performance.now();
    const id = requestAnimationFrame(function step(now) {
      const p = duration <= 0 ? 1 : Math.min((now - start) / duration, 1);
      const e = ease(p);
      keys.forEach(k => { target[k] = from[k] + (opts[k] - from[k]) * e; });
      if (p < 1) {
        _running.set(target, requestAnimationFrame(step));
      } else {
        _running.delete(target);
        if (opts.onComplete) opts.onComplete();
      }
    });
    _running.set(target, id);
  }

  function killTweensOf(target) {
    const id = _running.get(target);
    if (id) { cancelAnimationFrame(id); _running.delete(target); }
  }

  /* Prefer the real GSAP when it loaded; fall back transparently. */
  function animator() {
    if (typeof window.gsap !== 'undefined') {
      return { to: window.gsap.to.bind(window.gsap), kill: window.gsap.killTweensOf.bind(window.gsap) };
    }
    return { to: tween, kill: killTweensOf };
  }

  return {
    storageGet, storageSet, storageRemove,
    isReload, reducedMotion, isTouch,
    onReady, onLoaderComplete, loaderDone, module, debounce, animator,
  };

})();
