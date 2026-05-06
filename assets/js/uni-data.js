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
    banner: 'Bachelor\'s Degree in Computer Engineering — [YOUR_UNIVERSITY], [YEAR_START]–[YEAR_END]. Final grade <strong>[YOUR_GRADE]/110</strong>. Notes marked with <strong>Notes</strong> link to my personal summaries.',
    years: [
      {
        id:    'bsc-y1',
        label: 'Year 1',
        title: 'First Year',
        courses: [
          {
            name:      'Mathematical Analysis I',
            professor: '[PROFESSOR_NAME]',
            summary:   'Limits, derivatives, integrals, series, and differential equations. The foundation of everything that comes after.',
            credits:   '10 CFU',
            notes:     true,
            notesLabel:'Notes',
            notesUrl:  '#',
          },
          {
            name:      'Linear Algebra and Geometry',
            professor: '[PROFESSOR_NAME]',
            summary:   'Vector spaces, matrices, eigenvalues, SVD, and geometric transformations. Critical for understanding CNNs and attention mechanisms.',
            credits:   '10 CFU',
            notes:     true,
            notesLabel:'Notes',
            notesUrl:  '#',
          },
          {
            name:      'Physics I',
            professor: '[PROFESSOR_NAME]',
            summary:   'Classical mechanics, thermodynamics, and waves. Useful for understanding sensor physics and camera optics.',
            credits:   '10 CFU',
            notes:     true,
            notesLabel:'Notes',
            notesUrl:  '#',
          },
          {
            name:        'Programming I (C)',
            professor:   '[PROFESSOR_NAME]',
            summary:     'Introduction to programming with C: variables, control flow, functions, pointers, and basic data structures.',
            credits:     '10 CFU',
            notes:       false,
            notesStatus: 'notes unavailable',
          },
          {
            name:      'Chemistry and Materials',
            professor: '[PROFESSOR_NAME]',
            summary:   'Atomic structure, chemical bonding, materials science.',
            credits:   '6 CFU',
            notes:     true,
            notesLabel:'Notes',
            notesUrl:  '#',
          },
          {
            name:        'Logic and Discrete Mathematics',
            professor:   '[PROFESSOR_NAME]',
            summary:     'Propositional logic, set theory, combinatorics, graph theory, and formal proofs.',
            credits:     '8 CFU',
            notes:       false,
            notesStatus: 'notes unavailable',
          },
        ],
      },
      {
        id:    'bsc-y2',
        label: 'Year 2',
        title: 'Second Year',
        courses: [
          {
            name:      'Mathematical Analysis II',
            professor: '[PROFESSOR_NAME]',
            summary:   'Multivariable calculus, partial derivatives, multiple integrals, and vector fields.',
            credits:   '10 CFU',
            notes:     true,
            notesLabel:'Notes',
            notesUrl:  '#',
          },
          {
            name:      'Algorithms and Data Structures',
            professor: '[PROFESSOR_NAME]',
            summary:   'Sorting, trees, graphs, hash tables, dynamic programming, and complexity analysis.',
            credits:   '10 CFU',
            notes:     true,
            notesLabel:'Notes',
            notesUrl:  '#',
          },
          {
            name:      'Computer Architecture',
            professor: '[PROFESSOR_NAME]',
            summary:   'CPU pipeline, cache hierarchy, memory systems, and ISA design.',
            credits:   '10 CFU',
            notes:     true,
            notesLabel:'Notes',
            notesUrl:  '#',
          },
          {
            name:        'Electronics',
            professor:   '[PROFESSOR_NAME]',
            summary:     'Circuits, transistors, amplifiers, and signal conditioning.',
            credits:     '10 CFU',
            notes:       false,
            notesStatus: 'notes unavailable',
          },
          {
            name:      'Signal and Image Processing',
            professor: '[PROFESSOR_NAME]',
            summary:   'Fourier transforms, convolution, filtering, and image compression.',
            credits:   '10 CFU',
            notes:     true,
            notesLabel:'Notes',
            notesUrl:  '#',
          },
          {
            name:        'Probability and Statistics',
            professor:   '[PROFESSOR_NAME]',
            summary:     'Random variables, distributions, hypothesis testing, and Bayesian inference.',
            credits:     '8 CFU',
            notes:       false,
            notesStatus: 'notes unavailable',
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
    title:    '[Automation 1 Name]',
    icon:     '📝',
    barClass: 'bar-notion',
    desc:     '[Describe what this automation does — e.g.: Automatically syncs my lecture schedule from the university portal to Notion, creating structured weekly pages with course details and deadlines.]',
    tags:     ['Notion', '[Tool_2]', '[Tool_3]'],
  },
  {
    title:    '[Automation 2 Name]',
    icon:     '🐍',
    barClass: 'bar-python',
    desc:     '[Describe this automation — e.g.: Python script that monitors my GitHub repositories, aggregates commit stats, and generates a weekly digest sent to Telegram.]',
    tags:     ['Python', 'GitHub API', 'Telegram Bot'],
  },
  {
    title:    '[Automation 3 Name]',
    icon:     '⚡',
    barClass: 'bar-zapier',
    desc:     '[Describe this automation — e.g.: Zapier workflow that captures exam results from email, parses grades, and updates a Google Sheet grade tracker automatically.]',
    tags:     ['Zapier', 'Gmail', 'Google Sheets'],
  },
  {
    title:    '[Automation 4 Name]',
    icon:     '🔄',
    barClass: 'bar-github',
    desc:     '[Describe this automation — e.g.: GitHub Actions pipeline that auto-generates a PDF from Markdown notes, commits it to the repo, and sends a Telegram notification when new notes are published.]',
    tags:     ['GitHub Actions', 'Pandoc', 'Python'],
  },
  {
    title:    '[Automation 5 Name]',
    icon:     '🗒️',
    barClass: 'bar-obsidian',
    desc:     '[Describe this automation — e.g.: Obsidian plugin + Python script that extracts highlights from PDFs and organizes them into tagged Obsidian notes with backlinks.]',
    tags:     ['Obsidian', 'Python', 'PDF'],
  },
  {
    title:    '[Automation 6 Name]',
    icon:     '📊',
    barClass: 'bar-sheets',
    desc:     '[Describe this automation — e.g.: Google Sheets macro that calculates weighted GPA from raw exam grades, projects final degree grade, and generates a visual progress chart.]',
    tags:     ['Google Sheets', 'Apps Script', 'Charts'],
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
    cta:     'Duplica su Notion',
    ctaUrl:  '#',
    ctaType: 'notion',
  },
  {
    icon:    '📄',
    title:   'CV Template',
    desc:    'The LaTeX template I use for my CV — clean, minimal, and easy to customize. One-page layout with clear sections for education, experience, projects, and skills.',
    cta:     'GitHub',
    ctaUrl:  '#',
    ctaType: 'github',
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
