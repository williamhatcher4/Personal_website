# williamhatcher.ca

My portfolio site. One HTML file, one stylesheet, one script, no build step - clone it and open
`index.html` and you're looking at the real thing.

Live at <https://williamhatcher.ca>

Built with AI assistance (Claude Code).

## Running it

Any static server works:

```bash
python -m http.server 8000
```

`file://` is fine too, it just doesn't quite match how it behaves deployed.

There's no build, no tests, no linter. When I change the JavaScript I run `node --check scripts.js`
and then look at the page in a phone-width window to make sure nothing spills sideways. That's
honestly the whole process.

## What's in here

`index.html` is the entire site - seven sections (hero, about, experience, projects, skills,
education, contact), plus the metadata and JSON-LD at the top.

`styles.css` holds all of the styling. The colours, fonts and spacing are CSS custom properties
declared at the top, so the whole palette can be changed from one place without hunting through
the file.

`scripts.js` is a single IIFE: the mobile menu, reveal-on-scroll, the scroll-spy that highlights
the current nav link, the counters, the two typewriters, and the particle background.

`pictures/` is the headshot, the project covers, university logos, the favicon and the Open Graph
card.

## A few decisions worth explaining

**No build system.** Nothing to install, nothing to audit, and no toolchain that quietly stops
working six months from now. The files that get deployed are the files in the repo. Tailwind was
in here early on and got pulled out in favour of plain CSS with custom properties.

**Reduced motion is handled in two places,** which trips people up. There's a
`prefers-reduced-motion` media query at the bottom of `styles.css` that kills the CSS animations,
and a separate `prefersReduced` flag in `scripts.js` that stops the particles, counters and
typewriters from starting at all. If you add something animated, it needs handling in both — one
without the other is a bug.

**Accessibility is in the markup, not bolted on.** Proper landmarks, `aria-labelledby` on the
sections, a real `<button>` for the menu, a skip link, visible focus rings. Please don't swap any
of it for clickable `<div>`s.

**Images are sized in the HTML.** Everything below the fold is `loading="lazy"` with explicit
width and height so the layout doesn't jump while it loads. The headshot is preloaded instead,
since it's the first thing you see.

## Dependencies

Three, all from CDNs, which is what keeps the no-build thing true:

- Google Fonts — Inter and JetBrains Mono
- Font Awesome 6 — icons
- tsParticles slim 3.5 — the hero background

If one of them is having a bad day the relevant piece degrades and the rest of the page is fine.

## Deploying

It's static, so it'll run anywhere. Currently on Cloudflare Pages. Two things I keep forgetting:

- **Re-export the share card.** `pictures/share-card.png` comes from `share-card.svg` at
  1200×630. LinkedIn and friends won't render an SVG preview, so if you skip this the link
  previews break.
- **Analytics only fires on the real domain.** The GA4 tag is locked to `williamhatcher.ca`, so
  localhost and preview builds report nothing on purpose. Change the domain and you have to change
  that guard too, or it just silently stops recording.

## Known rough edges

Since anyone can read this:

- The contact form goes to Formspree, so testing it end to end sends me a real email.
- Six of the project images are over 2 MB. They should be WebP. I know.
- If `scripts.js` fails to load you get a blank page — the page starts hidden and JavaScript
  reveals it, which is a reasonable trade for not flashing unstyled content, but it is a single
  point of failure.

## Contact

Everything, including a current résumé, is on [the site](https://williamhatcher.ca).
