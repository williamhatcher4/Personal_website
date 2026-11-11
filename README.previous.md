# Personal Portfolio — William Hatcher

Single-page portfolio for William Hatcher (Embedded & Systems Software Engineer).
Hand-built — no build system, no framework, no package manager. Open `index.html` and it works.

Live: <https://williamhatcher.ca/>

## Stack

- One `index.html` with anchored sections (`#hero`, `#about`, `#skills`, `#experience`, `#projects`, `#education`, `#contact`).
- `styles.css` — design tokens (CSS custom properties), keyframes, all component classes, `prefers-reduced-motion` and mobile performance overrides.
- `scripts.js` — single IIFE: mobile menu (with outside-click + scroll-close + focus tracking), reveal-on-scroll IntersectionObserver, scroll-spy, animated counters, hero & terminal typewriters (visibility-paused), copy-email + toast, marquee JS-clone, deferred tsParticles init.
- Inline SVG icon sprite at the top of `<body>` (Lucide-style). No Font Awesome.
- CDN deps: Google Fonts (Inter + JetBrains Mono), tsParticles slim v3.

## Previewing locally

```powershell
cd "c:\Users\willi\OneDrive\Documents\Projects\Websites\Personal_website"
python -m http.server 8000
```

Open <http://localhost:8000>. Opening `index.html` via `file://` also works.

## Assets

- `pictures/` — all images (headshot, project covers, logos).
- `pictures/favicon.svg` — site favicon.
- `pictures/share-card.svg` — source SVG for the Open Graph card. **Before deploying, export to `pictures/share-card.png` at 1200×630** so LinkedIn / X / Slack / iMessage previews render properly (those platforms require a raster image).
- `Resume_William_Hatcher.pdf` — linked from hero, contact, and footer.

## Conventions

- All new animations must respect `prefers-reduced-motion` — there's a media query at the bottom of `styles.css` plus a JS `prefersReduced` flag.
- `data-reveal` on any element makes it fade-up on scroll-in; no JS wiring needed.
- `<span data-counter data-target="N" data-decimals="0">0</span>` becomes an animated counter when its section enters view.
- Every below-the-fold `<img>` uses `loading="lazy" decoding="async"` with explicit `width`/`height`. Hero headshot is eager-loaded and `<link rel="preload">`'d.
- Semantic landmarks (`<header>`/`<nav>`/`<main id="main">`/`<section aria-labelledby>`/`<footer>`), real `<button>` for the menu, skip link, focus-visible ring.
- No build step — keep dependencies CDN-loaded.

## Content source

Bullet content sourced from `Resume_William_Hatcher.pdf`.
