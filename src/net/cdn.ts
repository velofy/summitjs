/**
 * summitjs/net — CDN drop-in (self-contained IIFE).
 *
 * For no-build users: load this after the core Summit script and it wires the
 * data layer to the core's reactivity (read off the global) and registers the
 * `$fetch` magic and `s-resource` directive. No module resolution, no second
 * reactivity runtime.
 *
 *   <script src="https://velofy.github.io/summit/summit.min.js" defer></script>
 *   <script src="https://velofy.github.io/summit/summit-net.min.js" defer></script>
 */
import type { SummitGlobal } from "summitjs";
import { setSignalFactory } from "./runtime.js";
import { net } from "./registry.js";

const S = typeof window !== "undefined" ? (window as unknown as { Summit?: SummitGlobal }).Summit : undefined;
if (S && typeof S.plugin === "function") {
  setSignalFactory(S.signal);
  S.plugin(net);
} else if (typeof console !== "undefined") {
  console.warn("[summit] summit-net.min.js must load after summit.min.js.");
}
