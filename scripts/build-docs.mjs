/**
 * Summit docs generator for the retired GitHub Pages site.
 *
 * The documentation now lives at https://velofy.co/summitjs/. This script keeps
 * every old Pages URL working and keeps the machine-readable files current:
 *
 *   docs/index.html, docs/404.html      redirect to https://velofy.co/summitjs/
 *   docs/<slug>/index.html              redirect to the matching velofy.co page
 *   docs/<slug>/index.md                the page as clean markdown (for agents)
 *   docs/llms.txt, docs/llms-full.txt   indexes that link to velofy.co pages
 *   docs/ai/summit.json                 API manifest with velofy.co doc links
 *
 * The CDN files the old site served (summit.min.js, summit-net.min.js and
 * assets/*.css) are left in docs/ so existing <script> and <link> tags keep
 * working. Markdown sources stay in content/.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(root, "content");
const OUT = join(root, "docs");

export const SITE = "https://velofy.co/summitjs";

/** Old Pages slug -> new velofy.co slug, where the name changed. */
export const SLUG_MAP = {
  "magic-nextTick": "magic-nexttick",
};
export const newSlug = (slug) => SLUG_MAP[slug] ?? slug;

const CATEGORIES = [
  { key: "start", label: "Getting Started" },
  { key: "components", label: "Components" },
  { key: "techniques", label: "Techniques" },
  { key: "essentials", label: "Essentials" },
  { key: "directives", label: "Directives" },
  { key: "magics", label: "Magic Properties" },
  { key: "api", label: "Globals & API" },
  { key: "reactivity", label: "Reactivity" },
  { key: "advanced", label: "Advanced" },
];

// --- Frontmatter ---------------------------------------------------------

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    data[key] = /^\d+$/.test(val) ? Number(val) : val;
  }
  return { data, body: m[2] };
}

// --- Redirect stubs ------------------------------------------------------

/** The redirect page every old URL now serves. `target` has a trailing slash. */
export function redirectStub(target) {
  const label = target.replace(/^https:\/\//, "");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moved to ${label}</title>
<link rel="canonical" href="${target}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${target}">
<script>location.replace('${target}' + location.hash)</script>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#faf9f5;color:#141413;font:16px/1.6 system-ui,sans-serif;padding:24px}a{color:#a8492a}@media(prefers-color-scheme:dark){body{background:#262624;color:#faf9f5}a{color:#d97757}}</style>
</head>
<body><p>These docs moved to <a href="${target}">${label}</a>.</p></body>
</html>
`;
}

// --- AI-native artifacts -------------------------------------------------

const SUMMARY =
  "The open source, AI Agent Native JavaScript framework. Add behavior directly in your HTML with signal-powered s- directives and $ magics. No build step, CSP-safe, about 16KB with focus, positioning, persistence, and masking built in.";

/** Rewrite relative ../slug/ links to absolute velofy.co URLs. */
function absolutize(body) {
  return body.replace(/\]\(\.\.\/([^)/#]+)\/(#[^)]*)?\)/g, (_, s, h) => `](${SITE}/${newSlug(s)}/${h || ""})`);
}

/** A page rendered as a clean, self-contained markdown document. */
function pageMarkdown(page) {
  let out = `# ${page.title}\n\n`;
  if (page.description) out += `> ${page.description}\n\n`;
  out += `${absolutize(page.body.trim())}\n`;
  return out;
}

/** llms.txt: a discovery index linking every page, grouped by category. */
function buildLlmsIndex(ordered) {
  let out = `# Summit.js\n\n> ${SUMMARY}\n\n`;
  out +=
    "Summit is HTML-first: behavior lives on your markup as `s-` directives and `$` magics, " +
    `evaluated by a small CSP-safe interpreter. The documentation lives at ${SITE}/. ` +
    "The full corpus is also available as one markdown file (see Optional below).\n\n";
  for (const cat of CATEGORIES) {
    const inCat = ordered.filter((p) => p.category === cat.key);
    if (!inCat.length) continue;
    out += `## ${cat.label}\n\n`;
    for (const p of inCat) {
      out += `- [${p.title}](${SITE}/${newSlug(p.slug)}/)${p.description ? `: ${p.description}` : ""}\n`;
    }
    out += `\n`;
  }
  out += `## Optional\n\n`;
  out += `- [Error codes](${SITE}/errors/): every [summit] diagnostic code and its docs link\n`;
  out += `- [Changelog](${SITE}/changelog/): releases and notable changes\n`;
  out += `- [Full documentation corpus](https://cdn.jsdelivr.net/gh/velofy/summitjs@main/docs/llms-full.txt): every page concatenated as markdown\n`;
  out += `- [Machine-readable API manifest](https://cdn.jsdelivr.net/gh/velofy/summitjs@main/docs/ai/summit.json): directives, magics, modifiers, error codes, and components as JSON\n`;
  out += `- [AGENTS.md](https://github.com/velofy/summitjs/blob/main/AGENTS.md): a drop-in brief for coding agents\n`;
  out += `- [Source on GitHub](https://github.com/velofy/summitjs)\n`;
  out += `- [NodeMaven (sponsor)](https://go.nodemaven.com/summitjsvelofy): the most efficient proxy provider for web scraping and automation, with the highest quality IPs on the market; codes SUMMITJS35 (35% off Mobile & Residential) and SUMMITJS40 (40% off ISP Static)\n`;
  return out;
}

/** llms-full.txt: the entire docs corpus in one markdown file, in reading order. */
function buildLlmsFull(ordered) {
  let out = `# Summit.js: Full Documentation\n\n> ${SUMMARY}\n\n`;
  out += `Every documentation page, concatenated as markdown in reading order. Source: ${SITE}/\n\n---\n\n`;
  out += ordered.map((p) => pageMarkdown(p)).join("\n---\n\n");
  return out;
}

/**
 * summit.json: a machine-readable manifest of the whole surface area, for
 * tool-calling agents that want structured grounding instead of prose. Every
 * directive, magic, modifier, error code, and component with a docs link.
 */
const DIRECTIVES = [
  ["s-data", null, "Declare reactive state on an element; descendants read and write it.", `<div s-data="{ count: 0 }">`],
  ["s-text", null, "Set the element's textContent from an expression.", `<span s-text="count"></span>`],
  ["s-html", null, "Set innerHTML from an expression (trusted content only).", `<div s-html="markup"></div>`],
  ["s-bind", ":", "Bind an attribute; :class and :style accept objects.", `<a :href="url" :class="{ on: active }">`],
  ["s-on", "@", "Run an expression on a DOM event; supports modifiers.", `<button @click="count++">`],
  ["s-model", null, "Two-way bind a form control to state.", `<input s-model="name">`],
  ["s-show", null, "Toggle visibility with the display property.", `<p s-show="open">`],
  ["s-if", null, "Add or remove from the DOM; a <template s-if> may hold multiple roots.", `<template s-if="open">...</template>`],
  ["s-for", null, "Render a keyed list.", `<template s-for="item in items" :key="item.id">`],
  ["s-ref", null, "Name an element; read it via $refs.", `<input s-ref="field">`],
  ["s-init", null, "Run an expression once when the element initializes.", `<div s-init="load()">`],
  ["s-effect", null, "Re-run an expression whenever its reactive dependencies change.", `<div s-effect="document.title = title">`],
  ["s-transition", null, "Animate enter and leave.", `<div s-show="open" s-transition>`],
  ["s-teleport", null, "Render a template's content elsewhere in the DOM.", `<template s-teleport="body">...</template>`],
  ["s-intersect", ":leave", "Run an expression when the element enters or leaves the viewport.", `<div s-intersect="load()">`],
  ["s-trap", null, "Keep keyboard focus inside an element while an expression is truthy.", `<div s-trap="open">`],
  ["s-anchor", null, "Position an element next to a reference, flipping to stay in view.", `<div s-anchor="$refs.trigger">`],
  ["s-collapse", null, "Animate an element open and closed by height.", `<div s-collapse="open">`],
  ["s-mask", null, "Format an input as the user types against a pattern.", `<input s-mask="'(999) 999-9999'">`],
  ["s-cloak", null, "Hide until initialized; pair with [s-cloak]{display:none}.", `<div s-cloak>`],
  ["s-ignore", null, "Skip a subtree during initialization.", `<div s-ignore>`],
];
const MAGICS = [
  ["$el", "The current DOM element.", "magic-el"],
  ["$refs", "Elements named with s-ref, by name.", "magic-refs"],
  ["$root", "The nearest enclosing s-data root element.", "magic-root"],
  ["$id", "A stable unique id, scoped for pairing labels and controls.", "magic-id"],
  ["$store", "Global reactive stores shared across components.", "magic-store"],
  ["$watch", "Run a callback when a reactive expression changes.", "magic-watch"],
  ["$nextTick", "Run a callback after the next DOM update.", "magic-nexttick"],
  ["$dispatch", "Dispatch a custom DOM event that bubbles.", "magic-dispatch"],
  ["$data", "The reactive state object of the current scope.", "magic-data"],
  ["$persist", "Reactive state backed by localStorage that survives reloads.", "magic-persist"],
  ["$focus", "Move keyboard focus around from an expression.", "magic-focus"],
];
const MODIFIERS = {
  event: ["prevent", "stop", "self", "outside", "once", "capture", "passive", "window", "document", "debounce", "throttle", "camel", "dot", "enter", "escape", "tab", "space", "up", "down", "left", "right", "cmd", "ctrl", "meta", "alt", "shift"],
  // Matches src/directives/model.ts.
  model: ["lazy", "change", "blur", "number", "boolean", "debounce", "fill"],
};
const ERROR_CODES = [
  ["E101", "s-data init() threw."],
  ["E102", "s-data destroy() threw."],
  ["E103", "A store init() threw."],
  ["E104", "An s-data expression could not be evaluated; the component starts empty and the rest of the page still initializes."],
  ["E201", "Unknown directive; the message suggests the closest real one."],
  ["E301", "A directive or event handler failed while evaluating its expression."],
  ["E401", "s-for must be used on a <template> element."],
  ["E402", "s-for <template> needs exactly one root element."],
  ["E501", "s-teleport must be used on a <template> element."],
  ["E502", "s-teleport target selector was not found in the DOM."],
  ["E601", "A cleanup callback threw during teardown."],
  ["E602", "A destroy() callback threw during teardown."],
];
const COMPONENT_CLASS = {
  "comp-button": "s-btn", "comp-input": "s-input", "comp-select": "s-select", "comp-checkbox": "s-check",
  "comp-switch": "s-switch", "comp-card": "s-card", "comp-badge": "s-badge", "comp-alert": "s-alert",
  "comp-avatar": "s-avatar", "comp-progress": "s-progress", "comp-tooltip": "s-tooltip", "comp-dialog": "s-dialog",
  "comp-menu": "s-menu", "comp-popover": "s-popover", "comp-toast": "s-toast", "comp-tabs": "s-tabs-list",
  "comp-accordion": "s-accordion", "comp-breadcrumb": "s-breadcrumb", "comp-pagination": "s-pagination",
  "comp-table": "s-table",
};

function buildManifest(ordered, version) {
  const doc = (slug) => `${SITE}/${newSlug(slug)}/`;
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    name: "summitjs",
    version,
    description: SUMMARY,
    homepage: `${SITE}/`,
    docs: `${SITE}/`,
    llms: "https://cdn.jsdelivr.net/gh/velofy/summitjs@main/docs/llms.txt",
    llmsFull: "https://cdn.jsdelivr.net/gh/velofy/summitjs@main/docs/llms-full.txt",
    errorsDoc: `${SITE}/errors/`,
    agents: "https://github.com/velofy/summitjs/blob/main/AGENTS.md",
    sponsor: {
      name: "NodeMaven",
      url: "https://go.nodemaven.com/summitjsvelofy",
      summary: "The most efficient proxy provider for web scraping and automation, with the highest quality IPs on the market. 99.9% uptime, sticky sessions up to 7 days, no KYC.",
      codes: [
        { code: "SUMMITJS35", offer: "35% off Mobile & Residential" },
        { code: "SUMMITJS40", offer: "40% off ISP (Static)" },
      ],
    },
    allowedGlobals: ["Math", "JSON", "Date", "Object", "Array", "Number", "String", "Boolean", "console", "window", "document", "location", "localStorage", "sessionStorage", "setTimeout", "setInterval", "fetch", "URL", "structuredClone"],
    directives: DIRECTIVES.map(([name, shorthand, summary, example]) => ({
      name, shorthand, summary, example, doc: doc(name),
    })),
    magics: MAGICS.map(([name, summary, slug]) => ({ name, summary, doc: doc(slug) })),
    modifiers: MODIFIERS,
    errors: ERROR_CODES.map(([code, summary]) => ({ code, summary })),
    components: ordered
      .filter((p) => p.slug.startsWith("comp-"))
      .map((p) => ({ name: p.title, class: COMPONENT_CLASS[p.slug] || null, summary: p.description, doc: doc(p.slug) })),
    techniques: ordered
      .filter((p) => p.category === "techniques" && p.slug !== "techniques")
      .map((p) => ({ name: p.title, summary: p.description, doc: doc(p.slug) })),
  };
}

// --- Main ----------------------------------------------------------------

export function loadPages() {
  const files = readdirSync(CONTENT).filter((f) => f.endsWith(".md"));
  const catIndex = Object.fromEntries(CATEGORIES.map((c, i) => [c.key, i]));
  const pages = files.map((file) => {
    const raw = readFileSync(join(CONTENT, file), "utf8");
    const { data, body } = parseFrontmatter(raw);
    const slug = data.slug || file.replace(/\.md$/, "");
    return {
      file, body, slug,
      title: data.title || slug,
      description: data.description || "",
      category: data.category || "essentials",
      order: data.order ?? 99,
    };
  });
  // Global reading order: category order, then page order.
  return pages.sort((a, b) => (catIndex[a.category] - catIndex[b.category]) || (a.order - b.order));
}

function main() {
  if (!existsSync(CONTENT)) {
    console.error(`No content directory at ${CONTENT}`);
    process.exit(1);
  }
  const ordered = loadPages();
  const slugSet = new Set(ordered.map((p) => p.slug));
  const broken = [];

  // Entry point and not-found page both go to the docs overview.
  writeFileSync(join(OUT, "index.html"), redirectStub(`${SITE}/`));
  writeFileSync(join(OUT, "404.html"), redirectStub(`${SITE}/`));

  for (const page of ordered) {
    const dir = join(OUT, page.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), redirectStub(`${SITE}/${newSlug(page.slug)}/`));
    // Clean-markdown copy of every page, so agents that fetched <slug>/index.md
    // from the old site still get the content.
    writeFileSync(join(dir, "index.md"), pageMarkdown(page));

    // Validate internal cross-links (case-sensitive).
    for (const m of page.body.matchAll(/\]\(\.\.\/([^)/#]+)\//g)) {
      if (!slugSet.has(m[1])) broken.push(`${page.slug}  ->  ../${m[1]}/`);
    }
  }

  // The command-palette index only served the old HTML pages.
  rmSync(join(OUT, "search-index.json"), { force: true });

  writeFileSync(join(OUT, "llms.txt"), buildLlmsIndex(ordered));
  writeFileSync(join(OUT, "llms-full.txt"), buildLlmsFull(ordered));

  const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
  mkdirSync(join(OUT, "ai"), { recursive: true });
  writeFileSync(join(OUT, "ai", "summit.json"), JSON.stringify(buildManifest(ordered, version), null, 2));

  console.log(`Wrote ${ordered.length} redirect pages (+ index.html, 404.html) to ${SITE}/.`);
  console.log(`Wrote per-page index.md, llms.txt, llms-full.txt, and ai/summit.json.`);
  if (broken.length) {
    console.warn(`\n${broken.length} broken internal link(s):`);
    broken.forEach((b) => console.warn("  " + b));
    process.exit(1);
  }
  console.log("All internal cross-links resolve.");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
