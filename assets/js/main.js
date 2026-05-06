/**
 * main.js — Typing Effect, Scroll Tracker, Smooth Scroll, Card Glow, Contact Form
 */

'use strict';


/* ── Hero Ready — trigger entrance animations after loader exits ── */
(function initHeroReady() {
  function markReady() {
    document.body.classList.add('hero-ready');
  }

  document.addEventListener('loaderComplete', markReady, { once: true });

  /* Fallback: no loader present */
  if (!document.getElementById('loader')) {
    setTimeout(markReady, 150);
  }
})();


/* ── Typing Effect ──────────────────────────────────────────────── */
(function initTyping() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const roles = [
    'Computer Engineering Student',
    'Data & AI Enthusiast',
    'Occasional Musician',
    'Problem Solver',
  ];

  const SPEED_TYPE  = 70;
  const SPEED_DEL   = 40;
  const PAUSE_END   = 1800;
  const PAUSE_START = 400;

  let roleIdx  = 0;
  let charIdx  = 0;
  let deleting = false;

  function tick() {
    const role = roles[roleIdx];

    if (!deleting) {
      el.textContent = role.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === role.length) {
        deleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
    } else {
      el.textContent = role.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        roleIdx  = (roleIdx + 1) % roles.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
    }

    setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }

  /* Start after hero entrance animations settle (~role animates at 0.28s, 0.65s duration) */
  function startTyping() { setTimeout(tick, 750); }
  document.addEventListener('loaderComplete', startTyping, { once: true });
  if (!document.getElementById('loader')) setTimeout(startTyping, 150);
})();


/* ── Active Section Scroll Tracker ─────────────────────────────── */
(function initScrollTracker() {
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.dispatchEvent(new CustomEvent('activeSection', {
          detail: { id: entry.target.id },
        }));
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
})();


/* ── Smooth Scroll ──────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ── Project Card Mouse Glow ────────────────────────────────────── */
(function initCardGlow() {
  document.querySelectorAll('.project-card').forEach(card => {
    let rafPending = false;
    let lastX = 0, lastY = 0;

    card.addEventListener('mousemove', e => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((lastX - rect.left) / rect.width  * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((lastY - rect.top)  / rect.height * 100).toFixed(1) + '%');
      });
    });

    /* Reset glow position on leave */
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });
})();


/* ── Contact Form ───────────────────────────────────────────────── */
(function initContactForm() {
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    /* Basic client-side validation */
    const inputs = form.querySelectorAll('[required]');
    let valid = true;
    inputs.forEach(el => {
      if (!el.value.trim()) {
        el.style.borderColor = 'var(--accent)';
        valid = false;
      } else {
        el.style.borderColor = '';
      }
    });
    if (!valid) return;

    const btn = form.querySelector('[type="submit"]');
    btn.disabled    = true;
    btn.textContent = 'Sto inviando…';
    status.className    = 'form-status';
    status.textContent  = '';

    /* Placeholder: replace with actual fetch() to a backend / form service */
    await new Promise(resolve => setTimeout(resolve, 900));

    status.textContent = 'Messaggio inviato — ti rispondo presto!';
    status.classList.add('visible', 'success');
    form.reset();
    inputs.forEach(el => { el.style.borderColor = ''; });
    btn.textContent = 'Invia';
    btn.disabled    = false;
    setTimeout(() => status.classList.remove('visible'), 5000);
  });

  /* Clear error highlight on input */
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => { el.style.borderColor = ''; });
  });
})();


/* ── Init log ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  console.log(
    '%c andry2327 %c AI Engineer · Computer Vision · Deep Learning ',
    'background:#856de5;color:#fff;font-weight:700;padding:4px 8px;border-radius:4px 0 0 4px;font-family:monospace;',
    'background:#13131e;color:#a78bfa;padding:4px 8px;border-radius:0 4px 4px 0;font-family:monospace;border:1px solid #2a2a42;'
  );
});
