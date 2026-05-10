/**
 * uni-data.js — University Hub: all static content
 * Edit this file to update courses, automations, and template modules.
 * No logic here — pure data only.
 */

/* ── SVG snippets ─────────────────────────────────────────────────── */
export const SVG_DOC = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const SVG_EXT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ══════════════════════════════════════════════════════════════════
   COURSES
   Each course: { name, professor, summary, credits, notes, notesLabel, notesUrl, notesStatus }
   notes:       true  → show Notes badge + link
                false → show notesStatus text
   notesLabel:  badge label (default 'Notes')
   notesUrl:    '#' until you have a real link
   notesStatus: text shown when notes === false (e.g. 'notes unavailable')
   ══════════════════════════════════════════════════════════════════ */

export const COURSES = {

  bsc: {
    label: 'BSc · Computer Engineering',
    banner: 'Computer Engineering at Politecnico di Milano. Notes marked with <strong>Notes</strong> link to my personal summaries.',
    years: [
      {
        id:    'bsc-y1',
        label: 'Year 1',
        title: 'First Year',
        courses: [
          {
            name:        'Fondamenti di Informatica',
            professor:   'Matera Maristella',
            summary:     '',
            credits:     '10 CFU',
            notes:       true,
            notesLabel:  'Notes',
            notesUrl:    'https://docs.google.com/document/d/1zgqwBdRDfULpWbFYjXGjICeUFc1HoUipl9s3zbCpckk/edit?tab=t.gsw22vpwqf3s',
          },
          {
            name:        'Geometria e Algebra Lineare',
            professor:   'Sammartano Alessio',
            summary:     '',
            credits:     '8 CFU',
            notes:       true,
            notesLabel:  'Notes',
            notesUrl:    'https://docs.google.com/document/d/1zgqwBdRDfULpWbFYjXGjICeUFc1HoUipl9s3zbCpckk/edit?tab=t.8i40ildcx6v0',
          },
          {
            name:        'Fisica',
            professor:   'Petti Daniela, Zucchetti Carlo',
            summary:     '',
            credits:     '12 CFU',
            notes:       true,
            notesLabel:  'Notes',
            notesUrl:    'https://docs.google.com/document/d/1zgqwBdRDfULpWbFYjXGjICeUFc1HoUipl9s3zbCpckk/edit?tab=t.7qxzviw3h1ko',
          },
        ],
      },
      {
        id:    'bsc-y2',
        label: 'Year 2',
        title: 'Second Year',
        courses: [
          {
            name:        'Architettura dei Calcolatori e Sistemi Operativi',
            professor:   'Pelosi Gerardo',
            summary:     '',
            credits:     '10 CFU',
            notes:       true,
            notesLabel:  'Notes',
            notesUrl:    'https://docs.google.com/document/d/1zgqwBdRDfULpWbFYjXGjICeUFc1HoUipl9s3zbCpckk/edit?tab=t.ifqg9i4thigf',
          },
          {
            name:        'Analisi Matematica 2',
            professor:   'Galli Antonio',
            summary:     '',
            credits:     '10 CFU',
            notes:       true,
            notesLabel:  'Notes',
            notesUrl:    'https://docs.google.com/document/d/1zgqwBdRDfULpWbFYjXGjICeUFc1HoUipl9s3zbCpckk/edit?tab=t.tpjkmawlvhfr',
          },
          {
            name:        'Logica e Algebra',
            professor:   'Nuccio Claudia',
            summary:     '',
            credits:     '5 CFU',
            notes:       true,
            notesLabel:  'Notes',
            notesUrl:    'https://docs.google.com/document/d/1zgqwBdRDfULpWbFYjXGjICeUFc1HoUipl9s3zbCpckk/edit?tab=t.gw6tfn76u1ga',
          },
          {
            name:        'Algoritmi e Principi dell\'Informatica',
            professor:   'Martinenghi Davide',
            summary:     '',
            credits:     '10 CFU',
            notes:       true,
            notesLabel:  'Notes',
            notesUrl:    'https://docs.google.com/document/d/1zgqwBdRDfULpWbFYjXGjICeUFc1HoUipl9s3zbCpckk/edit?tab=t.ey942l8yv08t',
          },
          {
            name:        'Fondamenti di Automatica',
            professor:   'Fagiano Lorenzo Mario',
            summary:     '',
            credits:     '10 CFU',
            notes:       true,
            notesLabel:  'Notes',
            notesUrl:    'https://docs.google.com/document/d/1zgqwBdRDfULpWbFYjXGjICeUFc1HoUipl9s3zbCpckk/edit?tab=t.4czvmubqml0',
          },
          {
            name:        'Probabilità e Statistica per l\'Informatica',
            professor:   'Scarpa Luca',
            summary:     '',
            credits:     '10 CFU',
            notes:       true,
            notesLabel:  'Notes',
            notesUrl:    'https://docs.google.com/document/d/1zgqwBdRDfULpWbFYjXGjICeUFc1HoUipl9s3zbCpckk/edit?tab=t.0',
          },
        ],
      },
      {
        id:      'bsc-y3',
        label:   'Year 3',
        title:   'Third Year',
        courses: [],
      },
    ],
  },

};


/* ══════════════════════════════════════════════════════════════════
   AUTOMATIONS
   barClass: one of bar-notion | bar-python | bar-zapier | bar-github | bar-obsidian | bar-sheets
   ══════════════════════════════════════════════════════════════════ */

export const AUTOMATIONS = [
  {
    title:    'noeqtion',
    icon:     null,
    iconImg:  '../imgs/notion-logo.png',
    iconAlt:  'Notion',
    barClass: 'bar-notion',
    desc:     'A browser extension for Firefox and Chrome that converts LaTeX equations into Notion native math blocks. Detects inline and block expressions, then automates the /math command via keyboard shortcut or popup button — solving the pain of pasting math-heavy notes into Notion.',
    tags:     ['JavaScript', 'Browser Extension', 'Notion', 'LaTeX'],
    url:      'https://github.com/voidCounter/noeqtion',
    urlLabel: 'GitHub',
  },
];


/* ══════════════════════════════════════════════════════════════════
   TEMPLATES — array of template items
   Each item: { icon, title, desc, cta, ctaUrl, ctaType }
   ctaType: 'notion' | 'github' | 'link'
   ══════════════════════════════════════════════════════════════════ */

export const TEMPLATES = [
  {
    icon:    '📓',
    title:   'Student OS',
    desc:    'An all-in-one Notion workspace for university students — lecture schedule, task manager, grade tracker, and project log all in one place. Built around how I actually organize my academic life at PoliMi.',
    cta:     'Duplicate on Notion',
    ctaUrl:  'https://furry-whitefish-ba9.notion.site/Notion-template-35b23cbba24d80b4aedfd6c52eb4465e',
    ctaType: 'notion',
  },
  {
    icon:    '📄',
    title:   'Curriculum Vitae Template',
    desc:    'A collection of CV templates I have personally used throughout my academic and professional journey — different styles for different contexts, all tested in the real world.',
    cta:     'Open folder',
    ctaUrl:  'https://drive.google.com/drive/folders/10SwdZb4qcnKc9FrtueZltJNqAPuJFZKS?usp=drive_link',
    ctaType: 'link',
  },
  {
    icon:    '🌐',
    title:   'Portfolio Website',
    desc:    'The source code of this portfolio — the one you\'re looking at right now. Feel free to fork it, adapt it, and make it yours.',
    cta:     'GitHub',
    ctaUrl:  '#',
    ctaType: 'github',
  },
];


/* ── Computed stats (used by the hero) ──────────────────────────── */
export function computeStats() {
  let withNotes = 0;
  for (const deg of Object.values(COURSES)) {
    for (const year of deg.years) {
      for (const course of year.courses) {
        if (course.notes) withNotes++;
      }
    }
  }
  return { withNotes, automations: AUTOMATIONS.length, templates: TEMPLATES.length };
}
