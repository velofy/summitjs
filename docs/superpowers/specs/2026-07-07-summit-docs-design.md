# Summit Docs Design

Date: 2026-07-07
Status: approved, building

## Goal

Deep, Alpine-parity documentation (~45 pages) with a self-contained,
Algolia-style command palette search on Cmd+K / Ctrl+K. Static, fast, matches
the homepage design, dogfoods Summit.

## Architecture

A small Node static-site generator, `scripts/build-docs.mjs`:

- Reads Markdown from `content/*.md` with frontmatter: `slug`, `title`,
  `category`, `order`, `description`.
- Renders Markdown to HTML with `marked`; highlights code at build time with
  `prismjs` (static classes, themed via a custom CSS variable palette).
- Wraps each page in one shared layout: top bar (logo, search trigger, theme
  toggle, GitHub), left sidebar auto-built from the category tree, right "on
  this page" TOC from the headings, prev/next footer.
- Emits `docs/<slug>/index.html` for clean URLs, plus `docs/assets/` shared
  CSS/JS and `docs/search-index.json`.
- A ` ```summit ` fenced block renders a live, Summit-initialized example
  followed by its source, so examples in the docs actually run.

## Search

Self-contained, Algolia DocSearch look and feel:

- Opens on Cmd+K (Mac) or Ctrl+K (Windows/Linux); also a click on the search
  trigger. Esc closes; arrow keys navigate; Enter opens.
- Full-text over `search-index.json`, which the generator builds from every
  heading and paragraph (title, section, snippet, url + anchor).
- Results grouped by page, matched terms highlighted, recent searches kept in
  localStorage.
- Implemented as a Summit component plus a small search module. No Algolia
  account, no external requests, works under strict CSP and offline.

## Page map

- Start Here
- Essentials: Installation, Reactivity & State, Templating, Events, Forms,
  Lifecycle
- Directives: one page each for s-data, s-bind, s-on, s-text, s-html, s-model,
  s-show, s-if, s-for, s-effect, s-init, s-ref, s-cloak, s-ignore, s-teleport,
  s-transition
- Magics: one page each for $el, $refs, $store, $watch, $dispatch, $nextTick,
  $root, $id, $data
- Globals & API: Summit.data, Summit.store, Summit.bind, Summit.directive,
  Summit.magic, Summit.plugin, Summit.start
- Reactivity primitives: signal, computed, effect, reactive, batch, nextTick
- Advanced: How reactivity works, The CSP-safe evaluator, Writing directives &
  plugins, Migrating from Alpine

## Build & deploy

The Pages workflow runs `npm run build` then `npm run docs` (the generator)
before uploading `docs/`. Content lives in `content/`, output in `docs/`.
