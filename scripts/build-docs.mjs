/**
 * Summit docs generator.
 *
 * The documentation is the markdown in content/, read on GitHub at
 * https://github.com/velofy/summitjs/tree/main/content. Pages link to each
 * other with relative `slug.md` links, so they work in the repository as is.
 * The project page is https://summitjs.velofy.co/. This script writes:
 *
 *   content/README.md                   the docs index GitHub shows for content/
 *   docs/index.html                     redirect to the project page
 *   docs/404.html                       redirect to the docs index
 *   docs/<slug>/index.html              redirect to the page on GitHub
 *   docs/<slug>/index.md                the page as clean markdown (for agents)
 *   docs/llms.txt, docs/llms-full.txt   indexes that link to the pages on GitHub
 *   docs/ai/summit.json                 API manifest with doc links
 *
 * docs/ is the old GitHub Pages site (velofy.github.io/summitjs). Its CDN files
 * (summit.min.js, summit-net.min.js and assets/*.css) stay in docs/ so existing
 * <script> and <link> tags keep working.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(root, "content");
const OUT = join(root, "docs");

export const REPO = "https://github.com/velofy/summitjs";
/** Where each page is read: content/<slug>.md on GitHub. */
export const SITE = `${REPO}/blob/main/content`;
/** The content/ folder on GitHub, which renders the generated content/README.md. */
export const DOCS_INDEX = `${REPO}/tree/main/content`;
/** The project page. */
export const HOME = "https://summitjs.velofy.co/";
/** The GitHub URL of a page, with an optional `#anchor`. */
export const pageUrl = (slug, hash = "") => `${SITE}/${slug}.md${hash}`;

/** Directives without a page of their own, and the page section that documents them. Matches src/errors.ts. */
export const DOC_ALIASES = {
  "s-id": ["magic-id", "#scoping-ids-with-s-id"],
  "s-resize": ["s-intersect", "#s-resize"],
  "s-resource": ["advanced-data", ""],
};

/** Relative `slug.md` and `slug.md#anchor` links between pages. */
const PAGE_LINK = /\]\(([A-Za-z0-9-]+)\.md(#[A-Za-z0-9-]+)?\)/g;

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

/** GitHub's heading anchors for a page body (lower case, punctuation dropped, spaces to hyphens). */
export function anchors(body) {
  const out = new Set();
  const seen = new Map();
  let fence = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("```")) fence = !fence;
    const m = !fence && line.match(/^#{1,6}\s+(.*)$/);
    if (!m) continue;
    const base = m[1].trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.add(n ? `${base}-${n}` : base);
  }
  return out;
}

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

/** Rewrite relative slug.md links to absolute GitHub URLs. */
function absolutize(body) {
  return body.replace(PAGE_LINK, (_, s, h) => `](${pageUrl(s, h || "")})`);
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
    `evaluated by a small CSP-safe interpreter. The documentation is the markdown in the repository's content/ folder (${DOCS_INDEX}), and the project page is ${HOME}. ` +
    "The full corpus is also available as one markdown file (see Optional below).\n\n";
  for (const cat of CATEGORIES) {
    const inCat = ordered.filter((p) => p.category === cat.key);
    if (!inCat.length) continue;
    out += `## ${cat.label}\n\n`;
    for (const p of inCat) {
      out += `- [${p.title}](${pageUrl(p.slug)})${p.description ? `: ${p.description}` : ""}\n`;
    }
    out += `\n`;
  }
  out += `## Optional\n\n`;
  out += `- [Changelog](${REPO}/blob/main/CHANGELOG.md): releases and notable changes\n`;
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
  out += `Every documentation page, concatenated as markdown in reading order. Source: ${DOCS_INDEX}\n\n---\n\n`;
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
  ["s-id", null, "Open an id group so $id() calls inside it share one generated id.", `<div s-id="['field']">`],
  ["s-effect", null, "Re-run an expression whenever its reactive dependencies change.", `<div s-effect="document.title = title">`],
  ["s-transition", null, "Animate enter and leave.", `<div s-show="open" s-transition>`],
  ["s-teleport", null, "Render a template's content elsewhere in the DOM.", `<template s-teleport="body">...</template>`],
  ["s-intersect", ":leave", "Run an expression when the element enters or leaves the viewport.", `<div s-intersect="load()">`],
  ["s-resize", null, "Run an expression when the element changes size, with $width and $height.", `<div s-resize="w = $width">`],
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
  ["$nextTick", "Run a callback after the next DOM update.", "magic-nextTick"],
  ["$dispatch", "Dispatch a custom DOM event that bubbles.", "magic-dispatch"],
  ["$data", "The reactive state object of the current scope.", "magic-data"],
  ["$persist", "Reactive state backed by localStorage that survives reloads.", "magic-persist"],
  ["$focus", "Move keyboard focus around from an expression.", "magic-focus"],
];
const MODIFIERS = {
  // Matches src/directives/on.ts: behavior modifiers, key aliases, then system keys.
  // Any other modifier is matched against the key name in kebab case (`.k`, `.f1`).
  event: ["prevent", "stop", "self", "outside", "once", "capture", "passive", "window", "document", "debounce", "throttle", "camel", "dot", "enter", "tab", "space", "esc", "escape", "up", "down", "left", "right", "arrow-up", "arrow-down", "arrow-left", "arrow-right", "page-up", "page-down", "home", "end", "delete", "backspace", "shift", "ctrl", "alt", "cmd", "meta"],
  // Matches src/directives/model.ts.
  model: ["lazy", "change", "blur", "number", "boolean", "debounce", "fill"],
};
// Matches GLOBAL_ALLOW in src/evaluator/interpreter.ts (verify-docs checks it).
export const ALLOWED_GLOBALS = [
  "Math", "JSON", "Date", "Object", "Array", "Number", "String", "Boolean",
  "parseInt", "parseFloat", "isNaN", "isFinite", "RegExp",
  "Map", "Set", "WeakMap", "WeakSet", "Promise", "Intl", "console",
  "window", "document", "location", "navigator", "history",
  "localStorage", "sessionStorage",
  "setTimeout", "clearTimeout", "setInterval", "clearInterval",
  "requestAnimationFrame", "cancelAnimationFrame",
  "fetch", "AbortController", "Headers", "Request", "Response",
  "alert", "confirm", "prompt", "structuredClone",
  "URL", "URLSearchParams", "encodeURIComponent", "decodeURIComponent",
  "NaN", "Infinity",
];
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
  const doc = (slug) => (DOC_ALIASES[slug] ? pageUrl(...DOC_ALIASES[slug]) : pageUrl(slug));
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    name: "summitjs",
    version,
    description: SUMMARY,
    homepage: HOME,
    docs: DOCS_INDEX,
    llms: "https://cdn.jsdelivr.net/gh/velofy/summitjs@main/docs/llms.txt",
    llmsFull: "https://cdn.jsdelivr.net/gh/velofy/summitjs@main/docs/llms-full.txt",
    errorsDoc: pageUrl("errors"),
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
    allowedGlobals: ALLOWED_GLOBALS,
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

/** content/README.md: the docs index GitHub renders under the content/ listing. */
export function buildContentIndex(ordered) {
  let out = "<!-- npm run docs writes this file from each page's front matter. Edit the pages, not this file. -->\n\n";
  out += `# Summit.js documentation\n\n${SUMMARY}\n\n`;
  out += `Project page: ${HOME}. Changelog: [CHANGELOG.md](../CHANGELOG.md). `;
  out += "For coding agents: [AGENTS.md](../AGENTS.md), [llms.txt](../docs/llms.txt), ";
  out += "[llms-full.txt](../docs/llms-full.txt) and [summit.json](../docs/ai/summit.json).\n\n";
  out += "Code blocks tagged `summit` hold HTML that runs as is with the Summit script on the page.\n\n";
  for (const cat of CATEGORIES) {
    const inCat = ordered.filter((p) => p.category === cat.key);
    if (!inCat.length) continue;
    out += `## ${cat.label}\n\n`;
    for (const p of inCat) out += `- [${p.title}](${p.slug}.md)${p.description ? `: ${p.description}` : ""}\n`;
    out += "\n";
  }
  return out;
}

export function loadPages() {
  const files = readdirSync(CONTENT).filter((f) => f.endsWith(".md") && f !== "README.md");
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

  // The old site's home was the project page; any unknown old URL goes to the docs index.
  writeFileSync(join(OUT, "index.html"), redirectStub(HOME));
  writeFileSync(join(OUT, "404.html"), redirectStub(DOCS_INDEX));

  for (const page of ordered) {
    const dir = join(OUT, page.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), redirectStub(pageUrl(page.slug)));
    // Clean-markdown copy of every page, so agents that fetched <slug>/index.md
    // from the old site still get the content.
    writeFileSync(join(dir, "index.md"), pageMarkdown(page));

    // Validate internal cross-links (case-sensitive), including #anchors.
    for (const m of page.body.matchAll(PAGE_LINK)) {
      const target = ordered.find((p) => p.slug === m[1]);
      if (!target) broken.push(`${page.slug}  ->  ${m[1]}.md`);
      else if (m[2] && !anchors(target.body).has(m[2].slice(1))) broken.push(`${page.slug}  ->  ${m[1]}.md${m[2]}`);
    }
    // Links that only work on a docs website.
    for (const m of page.body.matchAll(/\]\(\.\.\/[^)]*\)/g)) broken.push(`${page.slug}  ->  ${m[0].slice(2, -1)} (use slug.md)`);
  }
  for (const [name, [slug, hash]] of Object.entries(DOC_ALIASES)) {
    const target = ordered.find((p) => p.slug === slug);
    if (!target || (hash && !anchors(target.body).has(hash.slice(1)))) broken.push(`DOC_ALIASES ${name}  ->  ${slug}.md${hash}`);
  }
  for (const slug of [...MAGICS.map((m) => m[2]), ...Object.keys(COMPONENT_CLASS), "errors"]) {
    if (!slugSet.has(slug)) broken.push(`summit.json  ->  ${slug}.md`);
  }

  writeFileSync(join(CONTENT, "README.md"), buildContentIndex(ordered));

  // The command-palette index only served the old HTML pages.
  rmSync(join(OUT, "search-index.json"), { force: true });

  writeFileSync(join(OUT, "llms.txt"), buildLlmsIndex(ordered));
  writeFileSync(join(OUT, "llms-full.txt"), buildLlmsFull(ordered));

  const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
  mkdirSync(join(OUT, "ai"), { recursive: true });
  writeFileSync(join(OUT, "ai", "summit.json"), JSON.stringify(buildManifest(ordered, version), null, 2));

  console.log(`Wrote ${ordered.length} redirect pages to ${SITE}/<slug>.md (+ index.html, 404.html).`);
  console.log(`Wrote content/README.md, per-page index.md, llms.txt, llms-full.txt, and ai/summit.json.`);
  if (broken.length) {
    console.warn(`\n${broken.length} broken internal link(s):`);
    broken.forEach((b) => console.warn("  " + b));
    process.exit(1);
  }
  console.log("All internal cross-links resolve.");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
