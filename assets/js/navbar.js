/**
 * navbar.js — sticky navbar, active-section highlight, mobile drawer
 *
 * The navbar is the one element that overlaps everything else, so its real
 * rendered height is published back to CSS as --nav-h. Scroll offsets,
 * scroll-margin and the mobile drawer's top edge all derive from that single
 * value instead of a hard-coded 60/80px that drifts as soon as the logo or
 * the font size changes.
 */
'use strict';

PF.module('Navbar', function initNavbar() {

  const navbar    = document.getElementById('navbar');
  if (!navbar) return;

  const navLinks  = document.querySelectorAll('.nav-link');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu   = document.querySelector('.nav-links');
  const root      = document.documentElement;

  /* ── Publish the real navbar height to CSS ── */
  function syncNavHeight() {
    const h = Math.round(navbar.getBoundingClientRect().height);
    if (h > 0) root.style.setProperty('--nav-h', h + 'px');
  }
  syncNavHeight();
  window.addEventListener('resize', PF.debounce(syncNavHeight, 150), { passive: true });
  window.addEventListener('load', syncNavHeight);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncNavHeight).catch(function () {});
  }

  /* ── Sticky style on scroll (rAF-throttled) ── */
  const SCROLL_THRESHOLD = 40;
  let scrollPending = false;

  function updateNavbarStyle() {
    navbar.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  }

  window.addEventListener('scroll', function () {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(function () {
      scrollPending = false;
      updateNavbarStyle();
    });
  }, { passive: true });
  updateNavbarStyle();

  /* ── Active link highlight ── */
  function setActiveLink(sectionId) {
    navLinks.forEach(function (link) {
      const href = link.getAttribute('href') || '';
      link.classList.toggle('active', href === '#' + sectionId);
    });
  }

  document.addEventListener('activeSection', function (e) {
    setActiveLink(e.detail.id);
  });
  setActiveLink('hero');

  /* ── Mobile drawer ── */
  if (!navToggle || !navMenu) return;

  let isOpen = false;

  function setMenu(open) {
    isOpen = open;
    navMenu.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    /* A class, not an inline style: the loader also owns body.overflow and
       inline styles would fight each other. */
    document.body.classList.toggle('menu-open', open);
  }

  function closeMenu(refocus) {
    if (!isOpen) return;
    setMenu(false);
    if (refocus) navToggle.focus();
  }

  navToggle.addEventListener('click', function () { setMenu(!isOpen); });

  /* Close after picking a destination — including cross-page links, where the
     drawer would otherwise flash open again during the back-navigation. */
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () { closeMenu(false); });
  });

  document.addEventListener('click', function (e) {
    if (isOpen && !navbar.contains(e.target)) closeMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu(true);
  });

  /* Rotating a phone or resizing to desktop must not leave the page locked.
     960 = the breakpoint where components.css swaps the drawer for the
     horizontal navbar. */
  const DRAWER_MAX = 959;
  window.addEventListener('resize', PF.debounce(function () {
    if (window.innerWidth > DRAWER_MAX) closeMenu(false);
  }, 120), { passive: true });

  /* Back/forward navigation restores the page from cache with the drawer open */
  window.addEventListener('pageshow', function () { closeMenu(false); });

});
