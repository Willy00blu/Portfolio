/**
 * navbar.js — Sticky Nav, Active Section Highlight, Mobile Toggle
 */

(function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const navLinks   = document.querySelectorAll('.nav-link');
  const navToggle  = document.querySelector('.nav-toggle');
  const navMenu    = document.querySelector('.nav-links');

  if (!navbar) return;

  /* ── Sticky class on scroll ── */
  const scrollThreshold = 40;

  function updateNavbarStyle() {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbarStyle, { passive: true });
  updateNavbarStyle(); // run once on load


  /* ── Highlight active nav link ── */
  function setActiveLink(sectionId) {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' + sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Listen for section change events from main.js
  document.addEventListener('activeSection', (e) => {
    setActiveLink(e.detail.id);
  });

  // Set 'hero' active initially
  setActiveLink('hero');


  /* ── Mobile menu toggle ── */
  if (navToggle && navMenu) {

    function closeMenu() {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click — return focus to toggle for keyboard users
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
        navToggle.focus();
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navMenu.classList.contains('open')) {
        closeMenu();
      }
    }, { passive: true });

    // Close on Escape key — return focus to toggle for keyboard users
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeMenu();
        navToggle.focus();
      }
    }, { passive: true });

    // Close on resize to desktop — prevents stuck overflow:hidden
    window.addEventListener('resize', () => {
      if (window.innerWidth > 767 && navMenu.classList.contains('open')) {
        closeMenu();
      }
    }, { passive: true });
  }

})();
