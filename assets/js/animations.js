/**
 * animations.js — IntersectionObserver reveals, staggered children
 */

(function initRevealAnimations() {

  const REVEAL_SELECTOR = '.reveal, .reveal-left, .reveal-right, .reveal-scale';

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

})();


/* ── Section label line animation ────────────────────────────── */
(function initSectionLabels() {
  const labels = document.querySelectorAll('.section-label');

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
})();
