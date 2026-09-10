'use strict';

/**
 * orb-scene.js — 2D Canvas sphere for the portfolio orb
 *
 * No external dependencies. Draws a gradient sphere each rAF.
 * GSAP in orb.js animates state.x / state.y / state.scale directly.
 *
 * Coordinate system (matches CSS):
 *   origin = viewport centre
 *   x increases rightward, y increases upward
 *   1 unit = 1 CSS pixel
 */
(function () {

  const SPHERE_R = 26;   // sphere radius in CSS pixels at scale 1
  /* The sphere is drawn slightly larger than its (invisible) hit button so it
     reads as a ball sitting under the cursor, not as a button. */
  const SPHERE_OVERSIZE = 1.17;

  window.OrbScene = { init };

  /* ── Where the orb rests ────────────────────────────────────────────
     Read straight from orb.css (--orb-margin / --orb-size on #orb-wrap)
     so the canvas sphere and the button underneath it stay locked
     together at every breakpoint, including inside the iOS safe area.  */
  function _cornerMetrics() {
    const wrap = document.getElementById('orb-wrap');
    const fallback = { margin: 32, size: 64 };
    if (!wrap) return fallback;

    const cs   = getComputedStyle(wrap);
    const size = parseFloat(cs.getPropertyValue('--orb-size'));
    let margin = parseFloat(cs.getPropertyValue('--orb-margin'));

    /* --orb-margin is authored in rem; resolve it against the root font size */
    if (cs.getPropertyValue('--orb-margin').includes('rem')) {
      margin *= parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    }

    /* Safe-area insets (iPhone landscape) are part of the real offset */
    const safeB = parseFloat(cs.getPropertyValue('--safe-b')) || 0;
    const safeR = parseFloat(cs.getPropertyValue('--safe-r')) || 0;

    return {
      margin: (isFinite(margin) ? margin : fallback.margin),
      size:   (isFinite(size)   ? size   : fallback.size),
      safeB:  safeB,
      safeR:  safeR,
    };
  }

  function init() {
    let W     = window.innerWidth;
    let H     = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    /* ── Canvas ── */
    const canvas = document.createElement('canvas');
    canvas.id = 'orb-canvas';
    Object.assign(canvas.style, {
      position:      'fixed',
      top:           '0',
      left:          '0',
      width:         W + 'px',
      height:        H + 'px',
      pointerEvents: 'none',
      zIndex:        '900',
    });
    _resize(canvas, W, H, dpr);
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) { console.error('[OrbScene] 2D canvas not supported'); canvas.remove(); return null; }

    /* ── Animatable state (GSAP targets these) ── */
    /* Start off-screen below viewport — hidden during loader without opacity tricks */
    const state = { x: 0, y: -(H / 2 + 200), scale: 1 };

    /* ── Render loop ── */
    let prevCx = -9999, prevCy = -9999, prevR = 0;
    let rafId  = null;

    /* Fully stop rAF when tab is hidden — saves CPU/battery */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        /* When returning to tab, clear stale frame to avoid ghost artifact */
        prevCx = -9999; prevCy = -9999;
        rafId = requestAnimationFrame(loop);
      }
    });

    /* ── Mouse tracking for eye look-at ── */
    let mouseX = W / 2;
    let mouseY = H / 2;
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;   /* fingers don't hover */
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    /* ── Blink state ── */
    let blinkValue      = 0;          /* 0 = open, 1 = fully closed */
    let blinkPhase      = 'idle';     /* idle | closing | holding | opening */
    let blinkPhaseStart = 0;
    let nextBlinkAt     = 2000 + Math.random() * 3000;
    const BLINK_CLOSE   = 70;         /* ms to shut */
    const BLINK_HOLD    = 40;         /* ms held shut */
    const BLINK_OPEN    = 110;        /* ms to reopen */

    function _updateBlink(ms) {
      if (blinkPhase === 'idle') {
        if (ms >= nextBlinkAt) { blinkPhase = 'closing'; blinkPhaseStart = ms; }
      } else if (blinkPhase === 'closing') {
        blinkValue = Math.min((ms - blinkPhaseStart) / BLINK_CLOSE, 1);
        if (blinkValue >= 1) { blinkPhase = 'holding'; blinkPhaseStart = ms; }
      } else if (blinkPhase === 'holding') {
        if (ms - blinkPhaseStart >= BLINK_HOLD) { blinkPhase = 'opening'; blinkPhaseStart = ms; }
      } else if (blinkPhase === 'opening') {
        blinkValue = 1 - Math.min((ms - blinkPhaseStart) / BLINK_OPEN, 1);
        if (blinkValue <= 0) {
          blinkValue = 0;
          blinkPhase = 'idle';
          nextBlinkAt = ms + 2500 + Math.random() * 4000;
        }
      }
    }

    function loop(ms) {
      rafId = requestAnimationFrame(loop);
      const t      = ms / 1000;
      /* Two slightly detuned frequencies for organic, non-repeating motion */
      const floatY = Math.sin(t * 1.45) * 6 + Math.sin(t * 0.87) * 2.5; /* ±8.5 px */
      const pulse  = 1 + Math.sin(t * 1.95) * 0.10;                      /* ±10 %   */
      _updateBlink(ms);

      /* Convert world coords → canvas pixels */
      const cx = Math.round((W / 2 + state.x) * dpr);
      const cy = Math.round((H / 2 - state.y - floatY) * dpr);
      const r  = Math.round(SPHERE_R * state.scale * dpr);

      /* Dirty-region clear: erase only the union bounding box of the previous
         and current sphere positions — avoids clearing the full viewport.   */
      const pad   = Math.ceil(Math.max(r, prevR) * 2.0 + 4);
      const minCx = Math.min(cx, prevCx);
      const minCy = Math.min(cy, prevCy);
      ctx.clearRect(
        Math.floor(minCx - pad),
        Math.floor(minCy - pad),
        Math.ceil(Math.abs(cx - prevCx) + pad * 2),
        Math.ceil(Math.abs(cy - prevCy) + pad * 2)
      );

      /* Always update prev — even when skipping draw — so next clear is correct */
      prevCx = cx; prevCy = cy; prevR = r;

      /* Skip draw if orb is off-canvas or invisible (e.g. initial hidden state) */
      const margin = r * 1.8;
      if (r < 0.5 || state.scale < 0.01 ||
          cx < -margin || cx > canvas.width  + margin ||
          cy < -margin || cy > canvas.height + margin) return;

      _drawGlow(ctx, cx, cy, r, pulse, state.scale);
      _drawSphere(ctx, cx, cy, r);
      _drawShine(ctx, cx, cy, r);
      /* Gaze: direction relative to sphere centre, magnitude normalised by
         screen size so eyes only reach max when cursor is at the screen edge */
      const MAX_ANGLE = 0.48;
      let eyeYaw = 0, eyePitch = 0;
      if (!document.body.classList.contains('orb-intro')) {
        const dxRel  = mouseX - cx / dpr;        /* cursor offset from sphere (CSS px) */
        const dyRel  = mouseY - cy / dpr;
        const dxNorm = dxRel / (W / 2);          /* normalise by half-viewport */
        const dyNorm = dyRel / (H / 2);
        eyeYaw   = Math.tanh(dxNorm * 1.5) * MAX_ANGLE;
        eyePitch = Math.tanh(dyNorm * 1.5) * MAX_ANGLE;
      }
      _drawEyes(ctx, cx, cy, r, blinkValue, eyeYaw, eyePitch);
    }

    rafId = requestAnimationFrame(loop); // initial start

    /* ── Resize ──────────────────────────────────────────────────────
       Debounced: on mobile every URL-bar show/hide fires a resize, and
       reallocating the canvas backing store on each one drops frames.   */
    const onResize = PF.debounce(function () {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      _resize(canvas, W, H, dpr);
      /* Reset dirty-region state — old coords are invalid after a resize */
      prevCx = -9999; prevCy = -9999; prevR = 0;
    }, 120);

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });

    return {
      state: state,
      getCorner: getCorner,
      getCornerScale: getCornerScale,
      getCenter: getCenter,
      destroy: function () {
        cancelAnimationFrame(rafId);
        canvas.remove();
      },
    };
  }

  /* ── Draw helpers ──────────────────────────────────────────── */

  function _drawGlow(ctx, cx, cy, r, pulse, scale) {
    /* Subtle dark outer halo — tighter when sphere is large (scale > 1) */
    const gr = r * (1.6 / Math.max(scale, 1)) * pulse;
    const g  = ctx.createRadialGradient(cx, cy, r * 0.92, cx, cy, gr);
    g.addColorStop(0,   'rgba(80,80,100,0.18)');
    g.addColorStop(0.5, 'rgba(40,40,60,0.06)');
    g.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, gr, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  function _drawSphere(ctx, cx, cy, r) {
    /* ── Base: near-black dark glass ── */
    const base = ctx.createRadialGradient(
      cx - r * 0.15, cy - r * 0.1, 0,
      cx + r * 0.1,  cy + r * 0.15, r
    );
    base.addColorStop(0,   '#18181e');
    base.addColorStop(0.5, '#0d0d12');
    base.addColorStop(1,   '#050507');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = base;
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    /* ── Broad soft glow from upper-left (secondary specular) ── */
    const spec2 = ctx.createRadialGradient(
      cx - r * 0.38, cy - r * 0.45, 0,
      cx - r * 0.1,  cy - r * 0.1,  r * 1.1
    );
    spec2.addColorStop(0,    'rgba(200,200,215,0.55)');
    spec2.addColorStop(0.35, 'rgba(160,160,175,0.22)');
    spec2.addColorStop(0.65, 'rgba(100,100,120,0.06)');
    spec2.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = spec2;
    ctx.fill();

    /* ── Bright white crescent near upper-left edge (primary specular) ── */
    const spec1 = ctx.createRadialGradient(
      cx - r * 0.52, cy - r * 0.58, r * 0.08,
      cx - r * 0.35, cy - r * 0.38, r * 0.72
    );
    spec1.addColorStop(0,    'rgba(255,255,255,0.55)');
    spec1.addColorStop(0.12, 'rgba(255,255,255,0.55)');
    spec1.addColorStop(0.32, 'rgba(235,235,240,0.22)');
    spec1.addColorStop(0.6,  'rgba(180,180,195,0.05)');
    spec1.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = spec1;
    ctx.fill();

    ctx.restore();

    /* ── Rim: thin bright ring at sphere edge (Fresnel) ── */
    const rim = ctx.createRadialGradient(cx, cy, r * 0.82, cx, cy, r);
    rim.addColorStop(0,   'rgba(0,0,0,0)');
    rim.addColorStop(0.7, 'rgba(70,70,85,0.08)');
    rim.addColorStop(1,   'rgba(140,140,160,0.38)');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = rim;
    ctx.fill();
  }

  function _drawShine(ctx, cx, cy, r) {
    /* Tight specular hotspot inside the main highlight */
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    const sx = cx - r * 0.48;
    const sy = cy - r * 0.52;
    const g  = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 0.18);
    g.addColorStop(0,   'rgba(255,255,255,0.35)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.10)');
    g.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  function _drawEyes(ctx, cx, cy, r, blinkValue, yaw, pitch) {
    const openFactor = 1 - blinkValue;           /* 1 = fully open, 0 = fully closed */
    if (openFactor <= 0.01) return;

    const ew       = r * 0.11;                   /* half-width */
    const eh0      = r * 0.26;                   /* half-height at full open */
    const gap      = r * 0.30;                   /* half-distance between eyes */

    /* 3D eye positions: eyes sit on the sphere surface (canvas Y-down, Z toward viewer) */
    const eyeLocalY = r * 0.08;                  /* below sphere centre in canvas px */
    const eyeDepth  = Math.sqrt(Math.max(0, r * r - gap * gap - eyeLocalY * eyeLocalY));

    const cosYaw = Math.cos(yaw),   sinYaw = Math.sin(yaw);
    const cosPit = Math.cos(pitch), sinPit = Math.sin(pitch);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.98, 0, Math.PI * 2);
    ctx.clip();

    [-gap, gap].forEach(function (localX) {
      /* Rotate around Y (yaw) — cursor right moves both eyes right */
      const rx = localX * cosYaw + eyeDepth * sinYaw;
      const rz = -localX * sinYaw + eyeDepth * cosYaw;

      /* Rotate around X (pitch) — cursor down moves both eyes down */
      const ry  =  eyeLocalY * cosPit + rz * sinPit;
      const rz2 = -eyeLocalY * sinPit + rz * cosPit;

      /* Screen position */
      const px = cx + rx;
      const py = cy + ry;

      const eh = eh0 * openFactor;
      if (eh < 0.5) return;

      const rad = Math.min(ew * 0.35, eh);

      /* Soft glow halo */
      const glowA = 0.45 * openFactor;
      const glow  = ctx.createRadialGradient(px, py, 0, px, py, ew * 4.5);
      glow.addColorStop(0,   'rgba(0,220,255,' + glowA.toFixed(2) + ')');
      glow.addColorStop(0.5, 'rgba(0,180,220,' + (glowA * 0.27).toFixed(2) + ')');
      glow.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(px, py, ew * 4.5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      /* Vertical rectangle */
      ctx.fillStyle = '#00e5ff';
      _roundRect(ctx, px - ew, py - eh, ew * 2, eh * 2, rad);
      ctx.fill();

      /* Inner highlight */
      if (openFactor > 0.35) {
        ctx.globalAlpha = (openFactor - 0.35) / 0.65;
        ctx.fillStyle = 'rgba(255,255,255,0.60)';
        _roundRect(ctx, px - ew * 0.52, py - eh * 0.60, ew * 1.04, eh * 0.45, rad * 0.4);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });

    ctx.restore();
  }

  function _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x,     y + h, x,     y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x,     y,     x + r, y);
    ctx.closePath();
  }

  /* ── Utilities ─────────────────────────────────────────────── */

  function _resize(canvas, w, h, dpr) {
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }

  /* Scale at which the sphere matches the current button size */
  function getCornerScale() {
    const m = _cornerMetrics();
    return (m.size * SPHERE_OVERSIZE) / (SPHERE_R * 2);
  }

  /* Centre of the resting position, in the canvas' centre-origin coordinates.
     Note it is derived from the button box, not from the sphere radius, so
     the drawn sphere is always concentric with the clickable area. */
  function getCorner() {
    const m       = _cornerMetrics();
    const offsetX = m.margin + (m.safeR || 0) + m.size / 2;
    const offsetY = m.margin + (m.safeB || 0) + m.size / 2;
    return {
      x:   window.innerWidth  / 2 - offsetX,
      y: -(window.innerHeight / 2 - offsetY),
    };
  }

  function getCenter() { return { x: 0, y: 0 }; }

})();
