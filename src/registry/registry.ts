/**
 * The registries.
 *
 * Everything pluggable in Summit lives here: directives, magics, reusable data
 * providers, global stores, and reusable bind objects. Keeping these in a leaf
 * module (no imports from the rest of Summit) means registration can happen at
 * any time without import cycles, which is what makes Summit's registration
 * timing-safe instead of Alpine's load-order-sensitive model.
 */

import type { DataProvider, BindProvider, DirectiveHandler, MagicFactory } from "../types.js";
import { reactive } from "../reactivity/index.js";

interface DirectiveEntry {
  handler: DirectiveHandler;
  priority: number;
}

const directives = new Map<string, DirectiveEntry>();
const magics = new Map<string, MagicFactory>();
const dataProviders = new Map<string, DataProvider>();
// All stores live under one reactive root so single-value stores are reactive
// too ($store.darkMode = !$store.darkMode just works).
const storeRoot = reactive<Record<string, unknown>>({});
const binds = new Map<string, BindProvider>();

/** Default priority; lower numbers run earlier on a given element. */
export const DEFAULT_PRIORITY = 100;

export function registerDirective(name: string, handler: DirectiveHandler, priority = DEFAULT_PRIORITY): void {
  directives.set(name, { handler, priority });
}
export function getDirective(name: string): DirectiveEntry | undefined {
  return directives.get(name);
}
export function hasDirective(name: string): boolean {
  return directives.has(name);
}
export function directiveNames(): string[] {
  return [...directives.keys()];
}

export function registerMagic(name: string, factory: MagicFactory): void {
  magics.set(name, factory);
}
export function getMagic(name: string): MagicFactory | undefined {
  return magics.get(name);
}
export function hasMagic(name: string): boolean {
  return magics.has(name);
}
export function magicNames(): string[] {
  return [...magics.keys()];
}

export function registerData(name: string, provider: DataProvider): void {
  dataProviders.set(name, provider);
}
export function getData(name: string): DataProvider | undefined {
  return dataProviders.get(name);
}

export function setStore(name: string, value: unknown): void {
  storeRoot[name] = value;
}
export function getStore(name: string): unknown {
  return storeRoot[name];
}
export function hasStore(name: string): boolean {
  return name in storeRoot;
}
export function storeNames(): string[] {
  return Object.keys(storeRoot);
}
/** The reactive object holding every store, used by the $store magic. */
export function getStoreRoot(): Record<string, unknown> {
  return storeRoot;
}

export function registerBind(name: string, provider: BindProvider): void {
  binds.set(name, provider);
}
export function getBind(name: string): BindProvider | undefined {
  return binds.get(name);
}
