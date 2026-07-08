/**
 * Verify the real docs/index.html markup runs under Summit with no errors.
 * Loads the page body, boots the shipped bundle, and drives a couple of demos.
 */
import { Window } from "happy-dom";
import { readFileSync } from "node:fs";

const html = readFileSync("docs/index.html", "utf8");
const body = html
  .replace(/[\s\S]*<body>/, "")
  .replace(/<\/body>[\s\S]*/, "")
  .replace(/<script[\s\S]*?<\/script>/g, ""); // strip the deferred loader; we eval it ourselves

const win = new Window({ url: "https://summit.test/" });
globalThis.window = win;
globalThis.document = win.document;
globalThis.CustomEvent = win.CustomEvent;
globalThis.MutationObserver = win.MutationObserver;
globalThis.getComputedStyle = win.getComputedStyle.bind(win);
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
win.document.documentElement.dataset.theme = "dark";

// Collect any [summit] directive errors.
const errors = [];
const realError = console.error;
console.error = (...args) => {
  if (String(args[0]).includes("[summit]")) errors.push(args);
  realError(...args);
};

win.document.body.innerHTML = body;
// Load the palette component first: it registers on `summit:init`, so it must
// be present before the bundle boots and dispatches that event.
const searchJs = readFileSync("docs/assets/search.js", "utf8");
(0, eval)(searchJs);
const code = readFileSync("dist/summit.min.js", "utf8");
(0, eval)(code);
win.Summit.start(win.document.body);
win.Summit.initTree(win.document.body);

function assert(cond, msg) {
  if (!cond) {
    realError("FAIL:", msg);
    process.exit(1);
  }
  console.log("ok:", msg);
}

const $ = (s) => win.document.querySelector(s);
const $$ = (s) => [...win.document.querySelectorAll(s)];

// Counter demo.
assert($('[data-demo="counter"] output').textContent === "0", "counter renders 0");

// To-do seeded with two items.
assert($$('[data-demo="todo"] ul.todo li').length === 2, "to-do renders 2 seeded items");

// Form pre reflects initial JSON via JSON.stringify in an expression.
const pre = $('[data-demo="form"] pre.out');
assert(pre && pre.textContent.includes('"name": "Ada"'), "form JSON.stringify expression renders");

// Drive the counter.
$('[data-demo="counter"] .ui-btn.round.primary').dispatchEvent(new win.Event("click"));
await win.Summit.nextTick();
assert($('[data-demo="counter"] output').textContent === "1", "counter increments to 1");

// The mobile nav menu is a Summit component (s-data + :class toggle).
const burger = $(".nav-burger");
assert(burger, "mobile nav burger present");
assert(!$(".nav-menu").classList.contains("is-open"), "nav menu starts closed");
burger.dispatchEvent(new win.Event("click"));
await win.Summit.nextTick();
assert($(".nav-menu").classList.contains("is-open"), "nav menu opens on burger click");
burger.dispatchEvent(new win.Event("click"));
await win.Summit.nextTick();
assert(!$(".nav-menu").classList.contains("is-open"), "nav menu closes on second click");

// The nav border is now driven by @scroll.window (was a vanilla script).
assert(!$("#nav").classList.contains("scrolled"), "nav has no border at the top");
Object.defineProperty(win, "scrollY", { value: 60, configurable: true });
win.dispatchEvent(new win.Event("scroll"));
await win.Summit.nextTick();
assert($("#nav").classList.contains("scrolled"), "nav gains its border after scrolling");

// The brand stays hidden while the hero is in view (atTop defaults true).
assert(!$("#nav .brand").classList.contains("is-visible"), "brand hidden while hero is visible");

assert(errors.length === 0, `no directive errors during page init (saw ${errors.length})`);

console.log("\nPage verification passed: docs/index.html runs cleanly under Summit.");
process.exit(0);
