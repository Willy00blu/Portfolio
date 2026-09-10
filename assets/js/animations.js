/**
 * animations.js — IntersectionObserver reveals, staggered children
 */

PF.module('Reveal', function initRevealAnimations() {

  const REVEAL_SELECTOR = '.reveal, .reveal-left, .reveal-right, .reveal-scale';

  /* Reveal classes start at opacity:0. If IntersectionObserver is missing
     (very old WebViews) nothing would ever add .revealed and the whole page
     would be blank — so show everything immediately instead. */
  function revealAll() {
    document.querySelectorAll(REVEAL_SELECTOR).forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  if (!('IntersectionObserver' in window)) {
    revealAll();
    /* Elements that only get their reveal class later, in this same file */
    document.querySelectorAll('.badge, .timeline-item, .project-card, .section-label')
      .forEach(function (el) { el.classList.add('reveal', 'revealed'); });
    return;
  }

  /* Anything still hidden after 6s (a missed observer callback, a display
     change, a tab restored from bfcache) is forced visible: content that
     cannot be read is worse than content that appears without animating. */
  setTimeout(revealAll, 6000);

  const STAGGER_BADGE    = 0.045; // seconds
  const STAGGER_TIMELINE = 0.07;
  const STAGGER_CARD     = 0.10;

  /* ── Base reveal observer ── */
  const revealTargets = document.querySelectorAll(REVEAL_SELECTOR);

  if (!revealTargets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  revealTargets.forEach(el => observer.observe(el));

  /* Elements already in view on load (above the fold) are revealed by the
     observer's first callback, which fires right after this. */


  /* ── Staggered children ─────────────────────────────────────
     Containers with [data-stagger] auto-delay their direct
     reveal children in sequence.                               */
  document.querySelectorAll('[data-stagger]').forEach(container => {
    container.querySelectorAll(
      ':scope > .reveal, :scope > .reveal-scale, :scope > .reveal-left, :scope > .reveal-right'
    ).forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.1}s`;
    });
  });


  /* ── Badge stagger ── */
  document.querySelectorAll('.badges-grid').forEach(grid => {
    const badges = Array.from(grid.querySelectorAll('.badge'));
    badges.forEach(badge => badge.classList.add('reveal'));
    badges.forEach((badge, i) => {
      badge.style.transitionDelay = `${i * STAGGER_BADGE}s`;
      observer.observe(badge);
    });
  });


  /* ── Timeline items stagger ── */
  document.querySelectorAll('.timeline').forEach(timeline => {
    const items = Array.from(timeline.querySelectorAll('.timeline-item'));
    items.forEach(item => item.classList.add('reveal'));
    items.forEach((item, i) => {
      item.style.transitionDelay = `${i * STAGGER_TIMELINE}s`;
      observer.observe(item);
    });
  });


  /* ── Project cards stagger ── */
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        cardObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px',
    }
  );

  document.querySelectorAll('.projects-grid').forEach(grid => {
    const cards = Array.from(grid.querySelectorAll('.project-card'));
    cards.forEach(card => card.classList.add('reveal-scale'));
    cards.forEach((card, i) => {
      card.style.transitionDelay = `${i * STAGGER_CARD}s`;
      cardObserver.observe(card);
    });
  });

});


/* ── Section label line animation ────────────────────────────── */
PF.module('SectionLabels', function initSectionLabels() {
  const labels = document.querySelectorAll('.section-label');
  if (!labels.length) return;

  if (!('IntersectionObserver' in window)) {
    labels.forEach(l => l.classList.add('reveal', 'revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  labels.forEach((label, i) => {
    label.classList.add('reveal');
    label.setAttribute('data-delay', String(i % 6));
    observer.observe(label);
  });
});
