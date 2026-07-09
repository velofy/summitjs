/**
 * summitjs/net — signal-factory injection.
 *
 * The net layer must create signals with Summit's ONE reactivity runtime, but
 * it reaches that runtime differently per target: the npm entry imports it from
 * "summitjs" (deduped by the consumer's bundler), while the CDN drop-in reads it
 * off the global the core script already installed. Both wire it via
 * setSignalFactory before any resource is created; resource.ts makes its signals
 * through here.
 */
import type { Signal } from "summitjs";

type SignalFactory = <T>(initial: T) => Signal<T>;

let factory: SignalFactory | undefined;

export function setSignalFactory(fn: SignalFactory): void {
  factory = fn;
}

export function signal<T>(initial: T): Signal<T> {
  if (!factory) {
    throw new Error(
      'summitjs/net: reactivity is not wired up. Import it from "summitjs/net", or load summit-net.min.js after summit.min.js.',
    );
  }
  return factory(initial);
}
