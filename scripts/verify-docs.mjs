/**
 * Boot every generated docs page under Summit in happy-dom and fail on any
 * [summit] directive error. This catches broken live examples (```summit
 * fences) anywhere in the docs, not just the homepage.
 */
import { Window } from "happy-dom";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const bundle = readFileSync("dist/summit.min.js", "utf8");
const searchJs = readFileSync("docs/assets/search.js", "utf8");

const dirs = readdirSync("docs", { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join("docs", d.name, "index.html")))
  .map((d) => d.name)
  .sort();

let totalErrors = 0;
const realError = console.error;

for (const dir of dirs) {
  const html = readFileSync(join("docs", dir, "index.html"), "utf8");
  const body = html
    .replace(/[\s\S]*<body>/, "")
    .replace(/<\/body>[\s\S]*/, "")
    .replace(/<script[\s\S]*?<\/script>/g, "");

  const win = new Window({ url: "https://summit.test/" });
  globalThis.window = win;
  globalThis.document = win.document;
  globalThis.CustomEvent = win.CustomEvent;
  globalThis.MutationObserver = win.MutationObserver;
  globalThis.getComputedStyle = win.getComputedStyle.bind(win);
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);

  const errors = [];
  console.error = (...args) => {
    if (String(args[0]).includes("[summit]")) errors.push(args);
    else realError(...args);
  };

  win.document.body.innerHTML = body;
  (0, eval)(searchJs);
  (0, eval)(bundle);
  win.Summit.start(win.document.body);
  win.Summit.initTree(win.document.body);

  console.error = realError;
  const mark = errors.length === 0 ? "ok  " : "FAIL";
  console.log(`${mark} ${dir} (${errors.length} error${errors.length === 1 ? "" : "s"})`);
  if (errors.length) {
    errors.forEach((e) => realError("     ", ...e));
    totalErrors += errors.length;
  }
}

console.log(`\n${dirs.length} pages checked, ${totalErrors} directive error${totalErrors === 1 ? "" : "s"}.`);
process.exit(totalErrors === 0 ? 0 : 1);
