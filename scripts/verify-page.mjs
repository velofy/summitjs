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
const code = readFileSync("dist/summit.min.js", "utf8");
(0, eval)(code);
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

assert(errors.length === 0, `no directive errors during page init (saw ${errors.length})`);

console.log("\nPage verification passed: docs/index.html runs cleanly under Summit.");
process.exit(0);
