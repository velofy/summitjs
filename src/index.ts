/**
 * Summit: a rugged, signal-powered framework for composing behavior directly
 * in your HTML. This is the package entry for bundler/npm users. Import the
 * default `Summit` global, register anything you like, then call `Summit.start()`.
 *
 * For a zero-build drop-in, use the CDN build (dist/summit.min.js), which
 * attaches `window.Summit` and starts automatically.
 */

import Summit from "./summit.js";

export default Summit;
export { Summit, version, type SummitGlobal } from "./summit.js";

// Reactivity primitives for advanced/standalone use.
export {
  signal,
  computed,
  effect,
  reactive,
  batch,
  untrack,
  stop,
  nextTick,
  toRaw,
  isReactive,
  isSignal,
  type Signal,
  type Computed,
} from "./reactivity/index.js";

// The evaluator, for tooling and tests.
export { evaluateExpression, evaluateAction, addGlobals } from "./evaluator/index.js";

// Types for directive/magic authors.
export type {
  DirectiveHandler,
  DirectiveMeta,
  DirectiveUtils,
  MagicFactory,
  MagicContext,
  DataProvider,
  BindProvider,
} from "./types.js";
