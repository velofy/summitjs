# Changelog

All notable changes to Summit.js. Dates are the npm publish dates (UTC). No changelog was kept before 0.4.4; the older entries were written from the npm registry, the git tags and the source diffs between them.

## 0.4.4 - 2026-09-30

Documentation moved to https://velofy.co/summitjs/. No API or behavior change.

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
