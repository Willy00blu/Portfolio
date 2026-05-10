/**
 * uni.js — University Hub renderer & interaction logic
 * Imports all data from uni-data.js and builds the DOM at runtime.
 * Handles: tab switching (main / degree / year), search/filter, reveal re-trigger.
 */

import { COURSES, AUTOMATIONS, TEMPLATES, computeStats, SVG_DOC, SVG_EXT } from './uni-data.js';

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
  const hasNotes = course.notes;
  const notesHtml = hasNotes
    ? `<span class="notes-badge">${SVG_DOC}${course.notesLabel}</span>`
    : '';
  const footerAction = hasNotes
    ? `<a href="${course.notesUrl}" class="course-link" target="_blank" rel="noopener">Open ${course.notesLabel === 'PDF' ? 'PDF' : 'notes'} ${SVG_EXT}</a>`
    : `<span class="course-link-unavailable">${course.notesStatus}</span>`;

  return `
    <div class="course-card${hasNotes ? ' has-notes' : ''} reveal-scale" style="transition-delay:${idx * 0.09}s">
      <div class="course-card-top">
        <h4 class="course-card-name">${course.name}</h4>
        ${notesHtml}
      </div>
      <p class="course-professor">${course.professor}</p>
      <p class="course-summary">${course.summary}</p>
      <div class="course-footer">
        <span class="course-credits">${course.credits}</span>
        ${footerAction}
      </div>
    </div>`;
}

function buildYearPanel(year, isFirst) {
  const isEmpty   = year.courses.length === 0;
  const cardsHtml = isEmpty
    ? ''
    : year.courses.map((c, i) => buildCourseCard(c, i)).join('');
  const emptyHtml = isEmpty
    ? `<p class="no-results" style="display:block;">No courses yet — section coming soon.</p>`
    : '';
  return `
    <div class="year-panel${isFirst ? ' active' : ''}" id="${year.id}" role="tabpanel">
      <div class="year-header">
        <h3>${year.title}</h3>
        ${!isEmpty ? `<span class="year-count">${year.courses.length} courses</span>` : ''}
      </div>
      <div class="course-grid" id="grid-${year.id}">${cardsHtml}</div>
      ${emptyHtml}
      <p class="no-results" id="no-results-${year.id}">No courses found.</p>
    </div>`;
}

function buildDegreePanel(degKey, isFirst) {
  const deg = COURSES[degKey];
  const yearTabsHtml = deg.years.map((y, i) =>
    `<button class="year-tab${i === 0 ? ' active' : ''}" data-year="${y.id}" role="tab">${y.label}</button>`
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
    `<button class="deg-tab${i === 0 ? ' active' : ''}" data-deg="${key}" role="tab" aria-selected="${i === 0}">${COURSES[key].label}</button>`
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

  const cardsHtml = AUTOMATIONS.map((a, i) => `
    <div class="auto-card reveal-scale" data-title="${a.title}" style="transition-delay:${i * 0.09}s">
      <div class="auto-card-bar ${a.barClass}"></div>
      <div class="auto-card-body">
        <div class="auto-card-icon">${a.iconImg ? `<img src="${a.iconImg}" alt="${a.iconAlt || ''}" width="36" height="36" style="object-fit:contain;">` : a.icon}</div>
        <h3 class="auto-card-title">${a.title}</h3>
        <p class="auto-card-desc">${a.desc}</p>
        <div class="auto-card-footer">
          ${a.tags.map(t => `<span class="auto-tag">${t}</span>`).join('')}
          ${a.url ? `<a class="auto-card-link" href="${a.url}" target="_blank" rel="noopener noreferrer">${SVG_EXT}${a.urlLabel || 'Link'}</a>` : ''}
        </div>
      </div>
    </div>`).join('');

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
    return `
    <div class="auto-card reveal-scale" style="transition-delay:${i * 0.09}s">
      <div class="auto-card-bar ${t.ctaType === 'github' ? 'bar-github' : 'bar-notion'}"></div>
      <div class="auto-card-body">
        <div class="auto-card-icon">${t.icon}</div>
        <h3 class="auto-card-title">${t.title}</h3>
        <p class="auto-card-desc">${t.desc}</p>
        <div class="auto-card-footer">
          <a href="${t.ctaUrl}" class="btn btn-outline" style="font-size:0.8rem;padding:0.35rem 0.85rem;" target="_blank" rel="noopener">
            ${icon} ${t.cta}
          </a>
        </div>
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
  const tabs   = document.querySelectorAll('.uni-tab');
  const panels = document.querySelectorAll('.uni-panel');
  const search = document.getElementById('uni-search-input');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById('tab-' + target)?.classList.add('active');

      if (search && search.value) { search.value = ''; runSearch(''); }

      triggerReveal('#tab-' + target + ' .reveal-scale');
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
      triggerReveal('#' + targetYear + ' .reveal-scale');
    }
  });
}


/* ══════════════════════════════════════════════════════════════════
   SEARCH / FILTER
   ══════════════════════════════════════════════════════════════════ */
function runSearch(query) {
  const q = query.trim().toLowerCase();
  const activePanel = document.querySelector('.uni-panel.active');
  if (!activePanel) return;

  /* Batch: collect visibility decisions first (reads), then apply (writes)
     to avoid forced layout reflow on each card.                           */
  if (activePanel.id === 'tab-notes') {
    const visibleYear = activePanel.querySelector('.degree-panel.active .year-panel.active');
    if (!visibleYear) return;

    const cards   = visibleYear.querySelectorAll('.course-card');
    const matches = Array.from(cards).map(card => {
      const name = card.querySelector('.course-card-name')?.textContent.toLowerCase() ?? '';
      return !q || name.includes(q);
    });
    cards.forEach((card, i) => { card.style.display = matches[i] ? '' : 'none'; });

    const visible   = matches.filter(Boolean).length;
    const noResults = visibleYear.querySelector('.no-results');
    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';

  } else if (activePanel.id === 'tab-automations') {
    const cards   = activePanel.querySelectorAll('.auto-card');
    const matches = Array.from(cards).map(card => {
      const title = card.querySelector('.auto-card-title')?.textContent.toLowerCase() ?? '';
      const desc  = card.querySelector('.auto-card-desc')?.textContent.toLowerCase()  ?? '';
      return !q || title.includes(q) || desc.includes(q);
    });
    cards.forEach((card, i) => { card.style.display = matches[i] ? '' : 'none'; });

    const visible   = matches.filter(Boolean).length;
    const noResults = document.getElementById('no-results-auto');
    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
  }
}

function initSearch() {
  const input = document.getElementById('uni-search-input');
  if (!input) return;

  /* Debounce: wait 120 ms of silence before filtering — avoids
     running querySelector loops on every single keystroke.      */
  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runSearch(input.value), 120);
  });
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
}

/* Module scripts are deferred but DOMContentLoaded may have already fired —
   check readyState to handle both cases reliably. */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
