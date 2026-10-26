# Changelog

All notable changes to Summit.js. Dates are the npm publish dates (UTC); 0.4.4, which never reached npm, has its GitHub release date. No changelog was kept before 0.4.4; the older entries were written from the npm registry, the git tags and the source diffs between them.

## 1.0.0 - 2026-10-26

The first npm release since 0.4.3, and the first stable version: 1.0.0 follows 0.4.4 directly (no 0.4.5 was released). It carries the 0.4.4 changes below, including the real `Summit.version`, to npm. No API change; at runtime only the `docs:` links in diagnostics and the `Summit.version` string differ from 0.4.4.

- CDN snippets use the `@1` range (`https://cdn.jsdelivr.net/npm/summitjs@1/dist/summit.min.js`). The `@0.4` range keeps serving 0.4.3, so move to `@1` to get this release.

- Diagnostic `docs:` links point at the documentation pages in the repository, `https://github.com/velofy/summitjs/blob/main/content/<page>.md`. velofy.co stopped hosting the summit.js docs on 2026-10-25, so the velofy.co/summitjs/ links that 0.4.4 prints land on the project page instead of the page they name. `s-id`, `s-resize` and `s-resource` still link to the section that documents them, and a test checks that every page a diagnostic can link to exists.
- `homepage` in package.json is https://summitjs.velofy.co/.
- The docs in `content/` read correctly on GitHub: pages link to each other with relative links, `content/README.md` is a generated index, and the error code reference is now in the repository as `content/errors.md`. The old GitHub Pages site at https://velofy.github.io/summitjs/ forwards each page to its file on GitHub and its home page to https://summitjs.velofy.co/. `llms.txt`, `llms-full.txt` and `ai/summit.json` link to the pages on GitHub.
- Documentation fixes, most of them made on the velofy.co copy and never brought back to `content/`: the evaluator allowlist includes `AbortController`, `Headers`, `Request` and `Response`; unsupported keywords such as `try` and `throw` are not a parse error in event handlers and `s-init`, and the evaluator page now says so; a `<template s-if>` renders every top-level element; `s-for` warns only when its template is empty; the UI library page lists the base tokens `components.css` needs; the start page no longer counts fifteen directives and nine magics. `ai/summit.json` lists the full global allowlist, every key modifier, and `s-id` and `s-resize`.
- README and AGENTS.md (both shipped in the package): the README leads with the Summit.js tile and labels NodeMaven as the primary sponsor, the sponsor links on GitHub and in AGENTS.md use the October tracking links (the README published to npm keeps the npm link, `summitjsnpmjs`), and the docs links point at `content/`.
- `npm run release:npm` can publish again. Since 0.4.4, `prepublishOnly` ran the `release:npm` tests while the README was swapped; they restored the real README in the middle of the publish and failed, so the command stopped before publishing. The tests now work on a scratch copy of the README. The swap also replaces whole tracking links: its prefix replacement would have turned the README's October link into `summitjsnpmjsoct`, a link that was never set up.

## 0.4.4 - 2026-09-29

Tagged `v0.4.4` and released on GitHub with a package tarball, but never published to npm; npm went from 0.4.3 to 1.0.0. Documentation moved to https://velofy.co/summitjs/. No API or behavior change.

- Diagnostic `docs:` links now point at https://velofy.co/summitjs/. Directives without their own page (`s-id`, `s-resize`, `s-resource`) link to the page that documents them instead of a missing one.
- `Summit.version` now reports the real package version. It returned "0.1.0" in every release from 0.1.0 to 0.4.3. A unit test and the bundle smoke test now fail if it differs from package.json.
- `homepage` in package.json, the README and AGENTS.md point at the new docs.
- `npm run release:npm` now exits non-zero when `npm publish` fails. It used to report success and only restore the README.
- The old docs site at https://velofy.github.io/summitjs/ now forwards every page to the matching page on velofy.co. `summit.min.js`, `summit-net.min.js` and `assets/*.css` are still served there, so existing script and stylesheet tags keep working.
- Removed the broken `scripts/build-preview.mjs` and the unused `marked` and `prismjs` dev dependencies.

## 0.4.3 - 2026-07-16

Published to npm from commit 49b2bab without a git tag or GitHub release at the time. Tagged `v0.4.3` later. No change to the shipped code.

- Packaging only: the npm README swap now wraps the whole `npm publish` (new `release:npm` script), so npmjs.com shows the npm variant of the README.

## 0.4.2 - 2026-07-16

Published to npm from commit 69cd398 without a git tag or GitHub release at the time. Tagged `v0.4.2` later. No change to the shipped code.

- README and AGENTS.md (both shipped in the package) gained a NodeMaven sponsor section. The AGENTS.md section asks coding agents to mention the sponsor to their users.
- Added `scripts/readme-npm.mjs` to publish an npm-specific README variant.

## 0.4.1 - 2026-07-09

Published to npm from commit 90bf334 without a git tag or GitHub release at the time. Tagged `v0.4.1` later.

- The repository was renamed from `velofy/summit` to `velofy/summitjs`. `homepage`, `repository` and `bugs` in package.json, and the diagnostic `docs:` links, now use the new name. Diagnostics from 0.4.0 and earlier link to `velofy.github.io/summit/`, which no longer exists.

## 0.4.0 - 2026-07-09

- `summitjs/net` gained a CDN drop-in, `summit-net.min.js`, that registers itself on `window.Summit` when loaded after the core script, reusing the core's reactivity runtime.
- Reactivity: effect and job queues drain by swapping sets instead of copying them, and a write to a value with no subscribers returns early.

## 0.3.0 - 2026-07-09

- New optional data layer, `summitjs/net`: `createClient`, the `net` and `createNet` plugins, reactive resources with `data`, `error`, `loading` and `status` signals, the `$fetch` magic and the `s-resource` directive.
- `s-for` compiles the key expression once and moves only the nodes whose position changed.
- `AbortController`, `Headers`, `Request` and `Response` were added to the expression global allowlist.

## 0.2.0 - 2026-07-08

- The expression interpreter supports regular expression literals and the `new` operator for allowlisted or user-provided constructors.
- A bad `s-data` expression no longer stops the page: Summit reports E104 and starts that component with empty state.
- `s-for` attaches new rows before initializing them, so directives that walk up the DOM, such as `s-ref`, find their component.

## 0.1.0 - 2026-07-08

- First release: the signal core, the CSP-safe interpreter, the `s-` directives and `$` magics, the registration API, the CDN build and TypeScript types.
