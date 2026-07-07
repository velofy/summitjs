/**
 * Shared type contracts used across Summit's modules.
 */

import type { Scope } from "./dom.js";

/** A parsed Summit attribute, e.g. `s-on:click.prevent="go()"`. */
export interface DirectiveMeta {
  /** The directive name without the `s-` prefix, e.g. "on", "bind", "text". */
  name: string;
  /** The part after the colon, e.g. "click" in s-on:click. Null if absent. */
  value: string | null;
  /** Dot-separated modifiers, e.g. ["prevent", "stop"]. */
  modifiers: string[];
  /** The attribute's expression string (its value). */
  expression: string;
  /** The original attribute name as written in the DOM. */
  raw: string;
}

/**
 * Utilities handed to every directive. This is the directive author's API and
 * intentionally mirrors what the built-ins use, so third-party directives are
 * first-class.
 */
export interface DirectiveUtils {
  /** Evaluate a value expression in this element's scope. */
  evaluate(expression: string): unknown;
  /** Evaluate an action (statements) in this element's scope, with extra locals. */
  evaluateAction(expression: string, locals?: Scope): unknown;
  /** Create a batched reactive effect that is torn down with the element. */
  effect(fn: () => void): void;
  /** Register a teardown callback. */
  cleanup(fn: () => void): void;
  /** Initialize a subtree (used by structural directives). */
  initTree(el: Element, scopes?: Scope[]): void;
  /** Tear down a subtree. */
  destroyTree(el: Element): void;
  /** The scope stack visible at this element. */
  scopes: Scope[];
  /** Build a fresh RootEnv for an element, optionally with extra locals. */
  makeEnv(el: Element, locals?: Scope): RootEnvLike;
  /** The Summit global. */
  Summit: SummitGlobalLike;
}

export interface RootEnvLike {
  has(name: string): boolean;
  get(name: string): unknown;
  set(name: string, value: unknown): void;
}

/** The context object passed to a magic factory. */
export interface MagicContext {
  el: Element;
  scopes: Scope[];
  evaluate(expression: string): unknown;
  effect(fn: () => void): void;
  cleanup(fn: () => void): void;
}

export type DirectiveHandler = (el: Element, meta: DirectiveMeta, utils: DirectiveUtils) => void;
export type MagicFactory = (ctx: MagicContext) => unknown;
export type DataProvider = (...args: unknown[]) => Record<PropertyKey, unknown>;
export type BindProvider = () => Record<string, unknown>;

/** A minimal shape of the Summit global for internal cross-references. */
export interface SummitGlobalLike {
  version: string;
  store(name: string, value?: unknown): unknown;
  [key: string]: unknown;
}
