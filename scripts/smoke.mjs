/**
 * End-to-end smoke test of the SHIPPED bundle (dist/summit.min.js).
 * Loads the real IIFE the way a browser would, drives a demo, and checks the
 * DOM actually reacts. This verifies the build output, not just the source.
 */
import { Window } from "happy-dom";
import { readFileSync } from "node:fs";

const win = new Window({ url: "https://summit.test/" });
// Expose the globals the IIFE reaches for at load and runtime.
globalThis.window = win;
globalThis.document = win.document;
globalThis.CustomEvent = win.CustomEvent;
globalThis.MutationObserver = win.MutationObserver;
globalThis.getComputedStyle = win.getComputedStyle.bind(win);
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);

const code = readFileSync("dist/summit.min.js", "utf8");
// eslint-disable-next-line no-eval
(0, eval)(code);

const Summit = win.Summit;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("ok:", msg);
}

assert(Summit && typeof Summit.start === "function", "window.Summit is exposed with start()");
assert(Summit.version === "0.1.0", "reports version 0.1.0");
assert(typeof Summit.signal === "function", "exposes signal()");

const root = win.document.createElement("div");
root.innerHTML = `
  <div s-data="{ count: 0, get doubled() { return this.count * 2 } }">
    <output id="c" s-text="count"></output>
    <output id="d" s-text="doubled"></output>
    <button id="inc" @click="count++"></button>
  </div>`;
win.document.body.appendChild(root);
Summit.initTree(root);

const c = () => win.document.getElementById("c").textContent;
const d = () => win.document.getElementById("d").textContent;

assert(c() === "0", "initial count renders 0");
assert(d() === "0", "computed getter renders 0");

win.document.getElementById("inc").dispatchEvent(new win.Event("click"));
await Summit.nextTick();

assert(c() === "1", "count updates to 1 after click");
assert(d() === "2", "cached computed getter updates to 2");

console.log("\nBundle smoke test passed: dist/summit.min.js works end to end.");
process.exit(0);
