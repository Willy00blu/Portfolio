/**
 * uni.js — University Hub renderer & interaction logic
 * Imports all data from uni-data.js and builds the DOM at runtime.
 * Handles: tab switching (main / degree / year), search/filter, reveal re-trigger.
 */

import { COURSES, AUTOMATIONS, TEMPLATES, computeStats, SVG_DOC, SVG_EXT } from './uni-data.js';

/* ── Escaping ───────────────────────────────────────────────────────
   Every card below is built as an HTML string. The data is authored by
   hand in uni-data.js, but a stray "<" or an apostrophe in a course name
   would silently break the markup, so text values go through esc() and
   only the SVG constants are injected raw.                            */
function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* Only allow links we control the shape of — never javascript: URLs */
function safeUrl(url) {
  const u = String(url ?? '').trim();
  if (!u || u === '#') return null;
  if (/^(https?:|mailto:|\/|\.{1,2}\/|#)/i.test(u)) return esc(u);
  return null;
}

/* ── SVG constants (uni.js-only) ────────────────────────────────── */
const SVG_IMG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_INFO = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01" stroke-linecap="round" stroke-linejoin="round"/></svg>`;


/* ══════════════════════════════════════════════════════════════════
   RENDER — STATS
   ══════════════════════════════════════════════════════════════════ */
function renderStats() {
  const { withNotes, automations, templates } = computeStats();
  const el = document.getElementById('stat-notes');
  if (el) el.textContent = withNotes;
  const elAuto = document.getElementById('stat-automations');
  if (elAuto) elAuto.textContent = automations;
  const elTpl = document.getElementById('stat-templates');
  if (elTpl) elTpl.textContent = templates;
}


/* ══════════════════════════════════════════════════════════════════
   RENDER — NOTES TAB
   ══════════════════════════════════════════════════════════════════ */
function buildCourseCard(course, idx) {
  const url      = safeUrl(course.notesUrl);
  const hasNotes = !!course.notes && !!url;
  const label    = course.notesLabel || 'Notes';

  const notesHtml = hasNotes
    ? `<span class="notes-badge">${SVG_DOC}${esc(label)}</span>`
    : '';

  const footerAction = hasNotes
    ? `<a href="${url}" class="course-link" target="_blank" rel="noopener noreferrer"
          aria-label="Open ${esc(label === 'PDF' ? 'PDF' : 'notes')} — ${esc(course.name)}">
         Open ${esc(label === 'PDF' ? 'PDF' : 'notes')} ${SVG_EXT}</a>`
    : `<span class="course-link-unavailable">${esc(course.notesStatus || 'notes coming soon')}</span>`;

  const summary = course.summary
    ? `<p class="course-summary">${esc(course.summary)}</p>`
    : '';

  return `
    <div class="course-card${hasNotes ? ' has-notes' : ''} reveal-scale"
         data-search="${esc((course.name + ' ' + (course.professor || '')).toLowerCase())}"
         style="transition-delay:${(idx % 9) * 0.06}s">
      <div class="course-card-top">
        <h4 class="course-card-name">${esc(course.name)}</h4>
        ${notesHtml}
      </div>
      <p class="course-professor">${esc(course.professor)}</p>
      ${summary}
      <div class="course-footer">
        <span class="course-credits">${esc(course.credits)}</span>
        ${footerAction}
      </div>
    </div>`;
}

function buildYearPanel(year, isFirst) {
  const isEmpty   = year.courses.length === 0;
  const cardsHtml = year.courses.map((c, i) => buildCourseCard(c, i)).join('');

  /* One status line per year, whose text switches between "nothing here yet"
     and "nothing matches your search" — two overlapping nodes used to fight
     over the same slot. */
  return `
    <div class="year-panel${isFirst ? ' active' : ''}" id="${esc(year.id)}" role="tabpanel">
      <div class="year-header">
        <h3>${esc(year.title)}</h3>
        ${!isEmpty ? `<span class="year-count">${year.courses.length} courses</span>` : ''}
      </div>
      <div class="course-grid">${cardsHtml}</div>
      <p class="no-results" data-empty-text="No courses yet — section coming soon."
         ${isEmpty ? 'style="display:block;"' : ''}>${
           isEmpty ? 'No courses yet — section coming soon.' : 'No courses found.'
         }</p>
    </div>`;
}

function buildDegreePanel(degKey, isFirst) {
  const deg = COURSES[degKey];
  const yearTabsHtml = deg.years.map((y, i) =>
    `<button class="year-tab${i === 0 ? ' active' : ''}" data-year="${esc(y.id)}"
             role="tab" aria-selected="${i === 0}">${esc(y.label)}</button>`
  ).join('');
  const yearPanelsHtml = deg.years.map((y, i) => buildYearPanel(y, i === 0)).join('');

  return `
    <div class="degree-panel${isFirst ? ' active' : ''}" id="deg-${degKey}" role="tabpanel">
      <div class="year-switcher" role="tablist" aria-label="Select year">
        ${yearTabsHtml}
      </div>
      ${yearPanelsHtml}
    </div>`;
}

function renderNotesTab() {
  const panel = document.getElementById('tab-notes');
  if (!panel) return;

  const degKeys = Object.keys(COURSES);
  const degTabsHtml = degKeys.map((key, i) =>
    `<button class="deg-tab${i === 0 ? ' active' : ''}" data-deg="${esc(key)}" role="tab" aria-selected="${i === 0}">${esc(COURSES[key].label)}</button>`
  ).join('');
  const degPanelsHtml = degKeys.map((key, i) => buildDegreePanel(key, i === 0)).join('');

  panel.innerHTML = `
    <div style="margin-bottom: var(--space-8);">
      <p class="section-label" style="margin-bottom: var(--space-3); justify-content: flex-start;">Notes</p>
      <h2 style="font-size: clamp(1.4rem, 3vw, 2rem); margin-bottom: var(--space-3);">
        My notes from every course
      </h2>
      <p style="max-width: 540px;">Personal summaries and study notes from my BSc in Computer Engineering at Politecnico di Milano.</p>
    </div>
    <div class="degree-switcher" role="tablist" aria-label="Select degree">
      ${degTabsHtml}
    </div>
    ${degPanelsHtml}`;
}


/* ══════════════════════════════════════════════════════════════════
   RENDER — AUTOMATIONS TAB
   ══════════════════════════════════════════════════════════════════ */
function renderAutomationsTab() {
  const panel = document.getElementById('tab-automations');
  if (!panel) return;

  const cardsHtml = AUTOMATIONS.map((a, i) => {
    const url  = safeUrl(a.url);
    const icon = a.iconImg
      ? `<img src="${esc(a.iconImg)}" ${a.iconFallback ? `data-fallback="${esc(a.iconFallback)}"` : ''}
              alt="${esc(a.iconAlt || '')}" width="36" height="36" loading="lazy"
              style="object-fit:contain;">`
      : (a.icon || '');

    return `
    <div class="auto-card reveal-scale"
         data-search="${esc((a.title + ' ' + a.desc + ' ' + (a.tags || []).join(' ')).toLowerCase())}"
         style="transition-delay:${(i % 9) * 0.06}s">
      <div class="auto-card-bar ${esc(a.barClass)}"></div>
      <div class="auto-card-body">
        <div class="auto-card-icon">${icon}</div>
        <h3 class="auto-card-title">${esc(a.title)}</h3>
        <p class="auto-card-desc">${esc(a.desc)}</p>
        <div class="auto-card-footer">
          ${(a.tags || []).map(t => `<span class="auto-tag">${esc(t)}</span>`).join('')}
          ${url ? `<a class="auto-card-link" href="${url}" target="_blank" rel="noopener noreferrer">${SVG_EXT}${esc(a.urlLabel || 'Link')}</a>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');

  panel.innerHTML = `
    <div style="margin-bottom: var(--space-8);">
      <p class="section-label" style="margin-bottom: var(--space-3); justify-content: flex-start;">Automations &amp; Workflow</p>
      <h2 style="font-size: clamp(1.4rem, 3vw, 2rem); margin-bottom: var(--space-3);">
        Tools I use to work smarter
      </h2>
      <p style="max-width: 540px;">Small projects and scripts that automate the repetitive parts of university life.</p>
    </div>
    <div class="auto-grid" id="auto-grid">${cardsHtml}</div>
    <p class="no-results" id="no-results-auto">No automations found.</p>`;
}


/* ══════════════════════════════════════════════════════════════════
   RENDER — TEMPLATE TAB
   ══════════════════════════════════════════════════════════════════ */
const SVG_NOTION = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4a2 2 0 012-2h8l6 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/><path d="M14 2v6h6" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
const SVG_GH     = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`;

function renderTemplateTab() {
  const panel = document.getElementById('tab-template');
  if (!panel) return;

  const cardsHtml = TEMPLATES.map((t, i) => {
    const icon = t.ctaType === 'github' ? SVG_GH : SVG_NOTION;
    const url  = safeUrl(t.ctaUrl);

    /* A card whose link is missing shows a disabled state instead of an
       anchor to "#" that opens a blank tab. */
    const cta = url
      ? `<a href="${url}" class="btn btn-outline btn-sm" target="_blank" rel="noopener noreferrer">
           ${icon} ${esc(t.cta)}
         </a>`
      : `<span class="course-link-unavailable">Coming soon</span>`;

    return `
    <div class="auto-card reveal-scale"
         data-search="${esc((t.title + ' ' + t.desc).toLowerCase())}"
         style="transition-delay:${(i % 9) * 0.06}s">
      <div class="auto-card-bar ${t.ctaType === 'github' ? 'bar-github' : 'bar-notion'}"></div>
      <div class="auto-card-body">
        <div class="auto-card-icon" aria-hidden="true">${esc(t.icon)}</div>
        <h3 class="auto-card-title">${esc(t.title)}</h3>
        <p class="auto-card-desc">${esc(t.desc)}</p>
        <div class="auto-card-footer">${cta}</div>
      </div>
    </div>`;
  }).join('');

  panel.innerHTML = `
    <div style="margin-bottom: var(--space-8);">
      <p class="section-label" style="margin-bottom: var(--space-3); justify-content: flex-start;">Templates</p>
      <h2 style="font-size: clamp(1.4rem, 3vw, 2rem); margin-bottom: var(--space-3);">
        Resources I share openly
      </h2>
      <p style="max-width: 540px;">Notion workspaces, CV templates, and other files I built for myself and made available for anyone to use.</p>
    </div>
    <div class="auto-grid">${cardsHtml}</div>`;
}


/* ══════════════════════════════════════════════════════════════════
   TAB SWITCHING — Main (3 tabs)
   ══════════════════════════════════════════════════════════════════ */
function initMainTabs() {
  const tabs   = Array.from(document.querySelectorAll('.uni-tab'));
  const panels = document.querySelectorAll('.uni-panel');
  if (!tabs.length) return;

  function activate(tab) {
    const target = tab.dataset.tab;

    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(p => p.classList.remove('active'));
    document.getElementById('tab-' + target)?.classList.add('active');

    /* Re-apply the current query to the panel that just became visible
       instead of silently clearing it. */
    const search = document.getElementById('uni-search-input');
    runSearch(search ? search.value : '');

    triggerReveal('#tab-' + target + ' .reveal-scale');
  }

  tabs.forEach((tab, i) => {
    tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
    tab.addEventListener('click', () => activate(tab));

    /* Arrow-key navigation, as expected from a role="tablist" */
    tab.addEventListener('keydown', e => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      activate(next);
    });
  });
}


/* ══════════════════════════════════════════════════════════════════
   TAB SWITCHING — Degree & Year (inside Notes tab)
   ══════════════════════════════════════════════════════════════════ */
let _notesTabsBound = false;
function initNotesTabs() {
  if (_notesTabsBound) return;
  _notesTabsBound = true;

  /* Degree tabs — delegate from parent since DOM is built dynamically */
  document.getElementById('tab-notes')?.addEventListener('click', e => {
    const degBtn = e.target.closest('.deg-tab');
    if (degBtn) {
      const target = degBtn.dataset.deg;
      document.querySelectorAll('.deg-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.degree-panel').forEach(p => p.classList.remove('active'));
      degBtn.classList.add('active');
      degBtn.setAttribute('aria-selected', 'true');
      document.getElementById('deg-' + target)?.classList.add('active');
      reapplySearch();
      triggerReveal('#deg-' + target + ' .reveal-scale');
      return;
    }

    const yearBtn = e.target.closest('.year-tab');
    if (yearBtn) {
      const targetYear = yearBtn.dataset.year;
      const switcher   = yearBtn.closest('.year-switcher');
      const degPanel   = yearBtn.closest('.degree-panel');
      switcher?.querySelectorAll('.year-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      degPanel?.querySelectorAll('.year-panel').forEach(p => p.classList.remove('active'));
      yearBtn.classList.add('active');
      yearBtn.setAttribute('aria-selected', 'true');
      document.getElementById(targetYear)?.classList.add('active');
      reapplySearch();
      triggerReveal('#' + targetYear + ' .reveal-scale');
    }
  });
}


/* ══════════════════════════════════════════════════════════════════
   SEARCH / FILTER
   ══════════════════════════════════════════════════════════════════ */
function reapplySearch() {
  const input = document.getElementById('uni-search-input');
  if (input && input.value.trim()) runSearch(input.value);
}

/**
 * Filter the cards of the visible panel.
 * Matching is done against the data-search attribute baked into each card at
 * render time, so no DOM text is read while typing (no forced reflow), and
 * reads are separated from writes.
 */
function runSearch(query) {
  const q = String(query || '').trim().toLowerCase();
  const activePanel = document.querySelector('.uni-panel.active');
  if (!activePanel) return;

  /* Scope: the visible year inside Notes, the whole panel elsewhere */
  const scope = activePanel.id === 'tab-notes'
    ? activePanel.querySelector('.degree-panel.active .year-panel.active')
    : activePanel;
  if (!scope) return;

  const cards = Array.from(scope.querySelectorAll('.course-card, .auto-card'));
  if (!cards.length) return;

  const matches = cards.map(card => !q || (card.dataset.search || '').includes(q));
  cards.forEach((card, i) => { card.style.display = matches[i] ? '' : 'none'; });

  const visible   = matches.filter(Boolean).length;
  const noResults = scope.querySelector('.no-results');
  if (!noResults) return;

  if (visible === 0) {
    noResults.textContent = q
      ? 'No results for “' + query.trim() + '”.'
      : (noResults.dataset.emptyText || 'Nothing here yet.');
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
  }
}

function initSearch() {
  const input = document.getElementById('uni-search-input');
  if (!input) return;

  const clearBtn = document.getElementById('uni-search-clear');

  /* Debounced: 120 ms of silence before filtering, so holding a key down
     does not re-filter on every repeat. */
  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    if (clearBtn) clearBtn.hidden = !input.value;
    debounceTimer = setTimeout(() => runSearch(input.value), 120);
  });

  /* Escape clears — the expected shortcut in any search field */
  input.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !input.value) return;
    input.value = '';
    if (clearBtn) clearBtn.hidden = true;
    runSearch('');
  });

  if (clearBtn) {
    clearBtn.hidden = true;
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.hidden = true;
      runSearch('');
      input.focus();
    });
  }
}


/* ══════════════════════════════════════════════════════════════════
   REVEAL HELPER
   Re-triggers the reveal animation on freshly shown tab cards.
   Uses double-rAF to guarantee the class removal is painted before
   re-adding it (more reliable than a magic setTimeout).
   ══════════════════════════════════════════════════════════════════ */
function triggerReveal(selector) {
  const els = document.querySelectorAll(selector);
  els.forEach(el => el.classList.remove('revealed'));
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.forEach(el => el.classList.add('revealed'));
    });
  });
}


/* ══════════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════════ */
function init() {
  try {
    renderStats();
    renderNotesTab();
    renderAutomationsTab();
    renderTemplateTab();

    initMainTabs();
    initNotesTabs();
    initSearch();

    /* Reveal cards for all tabs so they're visible when their panel is shown */
    triggerReveal('#tab-notes .reveal-scale');
    triggerReveal('#tab-automations .reveal-scale');
    triggerReveal('#tab-template .reveal-scale');
  } catch (err) {
    /* The whole page body is rendered from JS: if that fails the visitor
       must get an explanation and a way out, not three empty panels. */
    console.error('[UniHub] render failed:', err);
    const panel = document.getElementById('tab-notes');
    if (panel) {
      panel.innerHTML =
        '<p class="no-results" style="display:block;">' +
        'This section could not be loaded. Please reload the page — ' +
        'or <a class="course-link" href="../index.html">go back to the portfolio</a>.' +
        '</p>';
    }
  }
}

/* Module scripts are deferred but DOMContentLoaded may have already fired —
   check readyState to handle both cases reliably. */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
