# Portfolio

Dark, minimal portfolio for an AI Engineer. Vanilla HTML/CSS/JS, no frameworks.

## Structure

```
portfolio/
├── index.html                  # Entry point, all sections inline
├── assets/
│   ├── css/
│   │   ├── main.css            # Reset, CSS custom properties, typography, layout
│   │   ├── components.css      # Navbar, cards, badges, buttons, form, footer
│   │   └── animations.css      # Keyframes, reveal classes, stagger utilities
│   ├── js/
│   │   ├── main.js             # Custom cursor, card glow, scroll tracker, form
│   │   ├── navbar.js           # Sticky nav, active-link highlight, mobile toggle
│   │   └── animations.js       # IntersectionObserver reveal + stagger init
│   └── img/
│       └── .gitkeep
└── README.md
```

## Design Tokens

| Token        | Value      |
|--------------|------------|
| Background   | `#080808`  |
| Text         | `#e2ddd6`  |
| Accent       | `#c8f04a`  |
| Font display | Syne       |
| Font mono    | DM Mono    |
| Font body    | DM Sans    |

## Features

- Semantic HTML5 (`<section>`, `<nav>`, `<article>`, `<header>`, `<footer>`)
- CSS custom properties for full token-driven theming
- Mobile-first responsive layout (640 / 768 / 1024 breakpoints)
- Custom lime dot cursor with trailing circle
- Sticky navbar with active-section highlight via IntersectionObserver
- Scroll-triggered reveal animations (fade-up, fade-left, scale-in)
- Staggered animation for badges, timeline items, project cards
- Mouse-glow effect on project cards
- Contact form with simulated async submit
- Accessible: ARIA labels, focus-visible styles, `prefers-reduced-motion` support

## Usage

Open `index.html` directly in a browser — no build step required.

For development with live reload:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Customisation

1. **Personal info** — edit name, bio, experience, and project details in `index.html`
2. **Colors / fonts** — all tokens live in `:root` in `assets/css/main.css`
3. **Animations** — timing and easing vars in `assets/css/animations.css`
4. **Form endpoint** — replace the `setTimeout` stub in `assets/js/main.js` with a real fetch call
5. **Social links** — update `href` attributes on `.social-link` elements in `index.html`
