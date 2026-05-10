# Portfolio — Guglielmo Rotunno

Personal portfolio and University Hub. Vanilla HTML/CSS/JS — no frameworks, no build step.

Live at: [willy00blu.github.io/Portfolio](https://willy00blu.github.io/Portfolio)

---

## Structure

```
portfolio/
├── index.html               # Main portfolio (hero, about, education, experiences, projects, contacts)
├── pages/
│   └── University.html      # University Hub (notes, automations, templates)
├── assets/
│   ├── css/
│   │   ├── main.css         # Reset, CSS custom properties, typography, layout
│   │   ├── components.css   # Navbar, cards, badges, buttons, timeline, education, footer
│   │   ├── animations.css   # Keyframes, reveal classes, stagger utilities
│   │   ├── loader.css       # Full-screen intro loader
│   │   ├── orb.css          # Orb assistant bubble + canvas wrapper
│   │   └── university.css   # University Hub exclusive styles
│   ├── js/
│   │   ├── loader.js        # Loader sequence, loaderComplete event
│   │   ├── navbar.js        # Sticky nav, active-section highlight, mobile toggle
│   │   ├── animations.js    # IntersectionObserver reveal + stagger
│   │   ├── main.js          # Typing effect, card glow, smooth scroll
│   │   ├── orb-scene.js     # 2D Canvas sphere renderer (no deps)
│   │   ├── orb.js           # Orb assistant logic (GSAP + OrbScene)
│   │   ├── uni.js           # University Hub DOM renderer + tab logic
│   │   └── uni-data.js      # Course, automation, and template data
└── imgs/                    # Image assets
```

---

## Design Tokens

| Token        | Value                        |
|--------------|------------------------------|
| Background   | `#0d0d0f`                    |
| Text         | `#e8e8f0`                    |
| Accent       | `#856de5` (purple)           |
| Font display | Outfit                       |
| Font body    | Inter                        |
| Font mono    | DM Mono                      |

---

## Features

- Semantic HTML5 with full ARIA support
- CSS custom properties for token-driven theming
- Mobile-first responsive layout (640 / 768 / 1024 breakpoints)
- Full-screen intro loader with smooth exit
- Floating orb assistant (2D Canvas + GSAP) with per-section messages
- Scroll-triggered reveal animations with `prefers-reduced-motion` support
- Sticky navbar with active-section highlight via IntersectionObserver
- Mouse-glow effect on project cards
- University Hub with tabbed interface: Notes, Automations, Templates
- ES module architecture for the University Hub (`uni.js` + `uni-data.js`)

---

## Development

No build step required. Open with a local server (ES modules need HTTP):

```bash
# VS Code Live Server (recommended)
# or
npx serve .
# or
python3 -m http.server 8080
```

> `file://` protocol will not work due to ES module restrictions in `uni.js`.

---

## Customisation

1. **Personal info** — edit content directly in `index.html` and `pages/University.html`
2. **Colors / fonts** — all tokens in `:root` inside `assets/css/main.css`
3. **University data** — add courses, automations, and templates in `assets/js/uni-data.js`
4. **Orb messages** — edit the `MESSAGES` object in `assets/js/orb.js`
5. **Per-page orb text** — set `data-orb-intro` and `data-orb-corner` on `<body>`
