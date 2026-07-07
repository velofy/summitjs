# Summit.js Design (mvp1)

Date: 2026-07-07
Status: mvp1 implemented

## Thesis

Summit keeps the ergonomics that make Alpine pleasant (HTML-first, drop in a
script, compose behavior in markup) and replaces the parts that age badly. It
swaps the borrowed proxy+effect engine for a fine-grained signal core, makes
expression evaluation CSP-safe by default, fixes the well-known papercuts, and
lays the foundation for a headless, token-themed component layer that Alpine
never had.

## Decisions

Settled during brainstorming:

- MVP1 focus: the core engine first. Components come in mvp2.
- Build model: zero-build drop-in. One script tag, no build step ever required.
- Reactivity: Summit owns a fine-grained signal engine.
- Component model: own-the-source primitives plus a CSS-variable token system.

Naming and API: prefix `s-`, with `@` for events and `:` for binding, and `$`
for magics. Migration from Alpine is close to mechanical.

## Architecture

Kernel modules, each independently testable:

1. `reactivity/` - signal, computed (memoized and cached), effect, reactive
   proxy, batch, untrack, a microtask scheduler, and nextTick. DOM bindings
   subscribe at the value level, so updates are surgical.
2. `evaluator/` - a lexer, a precedence-climbing parser, and a tree-walking
   interpreter over a bounded subset of JavaScript. No `eval`, no `new Function`.
   ASTs are cached by source string. Two entry modes: value expressions and
   statement actions, which cleanly resolves the `{ }` object-vs-block ambiguity.
3. `scope/` - turns a data object into a reactive scope, binding methods and
   caching getters as computeds. Builds the RootEnv the interpreter resolves
   against (locals, then the s-data stack innermost first, then `$`-magics).
4. `lifecycle/` - depth-first DOM walk, directive dispatch by priority, one
   MutationObserver for added and removed nodes, marker-based move detection,
   and a per-element cleanup registry. Children are snapshotted before walking
   so structural mutations during init are safe.
5. `registry/` - timing-safe registration of directives, magics, data
   providers, stores, and binds.
6. `directives/` and `magics/` - the built-ins.

## Papercuts fixed versus Alpine

- Fine-grained signals instead of effect-level re-runs.
- CSP-safe evaluator as the default, with a broad global allowlist.
- `s-for` reconciles by key, moving nodes instead of rebuilding them.
- Computed getters are cached, not recomputed on every read.
- `s-if` works on any element, not only `<template>`.
- `$refs` supports dynamic (loop-derived) names.
- `$watch` returns an unwatch function and guards no-op loops.
- Registration is timing-safe; there is no single `alpine:init` window to miss.
- Reactive proxies never wrap host objects (DOM nodes stay usable).

## Deliverables (mvp1)

- The framework, authored in TypeScript, shipped as ESM, CJS, IIFE, and types.
- Bundle under budget: ~13.5KB gzip for the full runtime including the
  interpreter, enforced in CI.
- Vitest suites for reactivity, the evaluator, and directives.
- A bundle smoke test and a full-page verification that drive the shipped
  artifact end to end.
- A fast, self-contained GitHub Pages site that dogfoods Summit.
- CI (typecheck, test, build, size, smoke, verify) and a Pages deploy workflow.

## Roadmap

- mvp2: design tokens and theming, headless accessible components (dialog,
  tabs, disclosure, menu, combobox) with focus management, and a component
  gallery on the site.
- mvp3: a plugin suite (mask, intersect, persist, morph, sort, anchor), an
  optional tree-shaking compiler, `s-for` virtualization, and devtools.

## Non-goals (mvp1)

- No SSR or hydration protocol.
- No `await` inside expressions (planned for a later milestone).
- No component layer yet; the token file in `docs/assets/tokens.css` is the seed.
