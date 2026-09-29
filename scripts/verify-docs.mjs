/**
 * Docs checks for the retired Pages site.
 *
 * 1. Boot every live example (```summit fences in content/) under the shipped
 *    bundle in happy-dom and fail on any [summit] directive error. The examples
 *    are published as code on https://velofy.co/summitjs/, so they must still run.
 * 2. Check that every page has a redirect stub in docs/<slug>/index.html that
 *    points at its velofy.co page, and that the markdown copies exist.
 */
import { Window } from "happy-dom";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadPages, newSlug, redirectStub, SITE } from "./build-docs.mjs";

const bundle = readFileSync("dist/summit.min.js", "utf8");
const pages = loadPages();

let totalErrors = 0;
let totalDemos = 0;
const problems = [];
const realError = console.error;

for (const page of pages) {
  const demos = [...page.body.matchAll(/^```summit\n([\s\S]*?)^```/gm)].map((m) => m[1]);
  totalDemos += demos.length;

  if (demos.length) {
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

    win.document.body.innerHTML = demos.map((d) => `<section class="demo">${d}</section>`).join("\n");
    (0, eval)(bundle);
    win.Summit.start(win.document.body);
    win.Summit.initTree(win.document.body);

    console.error = realError;
    const mark = errors.length === 0 ? "ok  " : "FAIL";
    console.log(`${mark} ${page.slug} (${demos.length} example${demos.length === 1 ? "" : "s"}, ${errors.length} error${errors.length === 1 ? "" : "s"})`);
    if (errors.length) {
      errors.forEach((e) => realError("     ", ...e));
      totalErrors += errors.length;
    }
  }

  const stub = join("docs", page.slug, "index.html");
  const expected = redirectStub(`${SITE}/${newSlug(page.slug)}/`);
  if (!existsSync(stub) || readFileSync(stub, "utf8") !== expected) problems.push(`missing or stale redirect: ${stub}`);
  if (!existsSync(join("docs", page.slug, "index.md"))) problems.push(`missing markdown copy: docs/${page.slug}/index.md`);
}

for (const f of ["docs/llms.txt", "docs/llms-full.txt", "docs/ai/summit.json"]) {
  if (!existsSync(f)) problems.push(`missing ${f}`);
  else if (readFileSync(f, "utf8").includes("velofy.github.io")) problems.push(`${f} still links to velofy.github.io`);
}

problems.forEach((p) => realError("FAIL", p));
console.log(
  `\n${pages.length} pages, ${totalDemos} examples checked, ${totalErrors} directive error${totalErrors === 1 ? "" : "s"}, ` +
    `${problems.length} redirect problem${problems.length === 1 ? "" : "s"}.`,
);
process.exit(totalErrors === 0 && problems.length === 0 ? 0 : 1);
