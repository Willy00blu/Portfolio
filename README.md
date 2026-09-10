# Portfolio — Guglielmo Rotunno

Personal portfolio and University Hub. Vanilla HTML/CSS/JS — no frameworks, no build step.

Live at: [willy00blu.github.io/Portfolio](https://willy00blu.github.io/Portfolio)

---

## Structure

```
portfolio/
├── index.html               # Main portfolio (hero, about, education, experiences, projects, contacts)
├── 404.html                 # GitHub Pages error page
├── pages/
│   └── University.html      # University Hub (notes, automations, templates)
├── assets/
│   ├── favicon.svg
│   ├── css/
│   │   ├── main.css         # Reset, CSS custom properties, typography, layout
│   │   ├── components.css   # Navbar, cards, badges, buttons, timeline, education, footer
│   │   ├── animations.css   # Keyframes, reveal classes, stagger utilities
│   │   ├── loader.css       # Full-screen intro loader
│   │   ├── orb.css          # Orb assistant bubble + canvas wrapper
│   │   └── university.css   # University Hub exclusive styles
│   ├── js/
│   │   ├── utils.js         # window.PF — safe storage, module guard, tween fallback
│   │   ├── loader.js        # Loader sequence, loaderComplete event
│   │   ├── navbar.js        # Sticky nav, active-section highlight, mobile toggle
│   │   ├── animations.js    # IntersectionObserver reveal + stagger
│   │   ├── main.js          # Typing effect, card glow, smooth scroll
│   │   ├── orb-scene.js     # 2D Canvas sphere renderer (no deps)
│   │   ├── orb.js           # Orb assistant logic (GSAP + OrbScene)
│   │   ├── uni.js           # University Hub DOM renderer + tab logic
│   │   └── uni-data.js      # Course, automation, and template data
└── imgs/                    # Image assets (WebP served, PNG/JPEG kept as fallback)
```

### Script order

`utils.js` must load first on every page: it defines `window.PF`, which every
other script uses. GSAP is optional — if the CDN is unreachable, `PF.animator()`
falls back to an internal rAF tween and the orb behaves the same.

### Robustness rules

- Each module is wrapped in `PF.module()`, so one failure never stops the rest.
- `index.html` carries an inline failsafe that removes the loader after 8s even
  if `loader.js` never runs; `<noscript>` hides the loader and forces every
  `.reveal` element visible.
- Reveal animations self-heal: without `IntersectionObserver`, or after 6s,
  everything is shown regardless.
- `sessionStorage` is only touched through `PF.storageGet/Set` (Safari private
  mode throws on plain access).
- Images are `<img src="*.webp" data-fallback="*.png">`; `main.js` swaps in the
  fallback on error and only hides the slot if that fails too.

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
- Mobile-first responsive layout (480 / 640 / 767 / 959 / 1024 breakpoints)
- Mobile drawer up to 959px, `--nav-h` published from JS as the single source
  of truth for every navbar offset
- Touch-aware: no sticky `:hover` states, ≥44px tap targets, 16px form fields,
  iOS safe-area insets
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
   (its resting position and size come from `--orb-margin` / `--orb-size`
   in `assets/css/orb.css`; `orb-scene.js` reads them back)
5. **Per-page orb text** — set `data-orb-intro` and `data-orb-corner` on `<body>`


---

## Images

Source images live in `imgs/` as PNG/JPEG; the site loads the WebP versions
(≈41 MB → ≈0.4 MB in total). To regenerate one after replacing an original:

```bash
cwebp -q 78 -resize 900 0 imgs/proj-foo.png -o imgs/proj-foo.webp   # project card
cwebp -q 72 -resize 1600 0 imgs/uni-hero.png -o imgs/uni-hero.webp  # page hero
```

Then point the markup at the `.webp` and keep `data-fallback` on the original.
