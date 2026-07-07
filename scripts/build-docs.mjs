/**
 * Summit docs generator.
 *
 * Reads Markdown from content/, renders it through one shared layout, and
 * writes static HTML into docs/<slug>/index.html plus a docs/search-index.json
 * for the command palette. Code is highlighted at build time with Prism; a
 * ```summit fence renders a live, Summit-initialized example next to its source.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { Marked } from "marked";

const require = createRequire(import.meta.url);
const Prism = require("prismjs");
require("prismjs/components/prism-markup.js");
require("prismjs/components/prism-clike.js");
require("prismjs/components/prism-javascript.js");
require("prismjs/components/prism-typescript.js");
require("prismjs/components/prism-bash.js");
require("prismjs/components/prism-css.js");
require("prismjs/components/prism-json.js");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(root, "content");
const OUT = join(root, "docs");

const CATEGORIES = [
  { key: "start", label: "Getting Started" },
  { key: "components", label: "Components" },
  { key: "essentials", label: "Essentials" },
  { key: "directives", label: "Directives" },
  { key: "magics", label: "Magic Properties" },
  { key: "api", label: "Globals & API" },
  { key: "reactivity", label: "Reactivity" },
  { key: "advanced", label: "Advanced" },
];

const LANG = { html: "markup", js: "javascript", javascript: "javascript", ts: "typescript", typescript: "typescript", bash: "bash", sh: "bash", css: "css", json: "json" };

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function stripMd(s) {
  return String(s)
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_#>]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

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

// --- Markdown rendering --------------------------------------------------

let currentHeadings = [];

function makeMarked() {
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading(token) {
        const inner = this.parser.parseInline(token.tokens);
        const id = slugify(token.text);
        if (token.depth === 2 || token.depth === 3) {
          currentHeadings.push({ id, text: stripMd(token.text), depth: token.depth });
        }
        return `<h${token.depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${inner}</h${token.depth}>`;
      },
      code(token) {
        const lang = token.lang || "";
        if (lang === "summit") return renderDemo(token.text);
        const grammar = Prism.languages[LANG[lang]] || Prism.languages.markup;
        const html = Prism.highlight(token.text, grammar, LANG[lang] || "markup");
        return `<div class="code-block"><button class="copy" data-copy aria-label="Copy code">Copy</button><pre class="language-${LANG[lang] || "markup"}"><code>${html}</code></pre></div>`;
      },
    },
  });
  return marked;
}

/** A live example: the raw markup runs (Summit initializes it), with source below. */
function renderDemo(source) {
  const grammar = Prism.languages.markup;
  const highlighted = Prism.highlight(source, grammar, "markup");
  return `<div class="demo">
  <div class="demo-result">${source}</div>
  <details class="demo-code"><summary>Source</summary><div class="code-block"><button class="copy" data-copy aria-label="Copy code">Copy</button><pre class="language-markup"><code>${highlighted}</code></pre></div></details>
</div>`;
}

// --- Search index --------------------------------------------------------

function buildSearchEntries(page, body) {
  const marked = makeMarked();
  const tokens = marked.lexer(body);
  const entries = [];
  let cur = { heading: page.title, anchor: "", text: "" };
  const flush = () => {
    const text = cur.text.trim();
    entries.push({
      page: page.title,
      category: page.categoryLabel,
      heading: cur.heading,
      slug: page.slug,
      anchor: cur.anchor,
      snippet: text.slice(0, 220),
      text: (cur.heading + " " + text).toLowerCase(),
    });
  };
  for (const t of tokens) {
    if (t.type === "heading") {
      if (cur.text.trim() || cur.anchor === "") flush();
      cur = { heading: stripMd(t.text), anchor: slugify(t.text), text: "" };
    } else if (t.type === "paragraph" || t.type === "text" || t.type === "list" || t.type === "blockquote") {
      cur.text += " " + stripMd(t.raw || t.text || "");
    }
  }
  flush();
  return entries;
}

// --- Layout --------------------------------------------------------------

function buildSidebar(pages, current) {
  let html = "";
  for (const cat of CATEGORIES) {
    const inCat = pages.filter((p) => p.category === cat.key).sort((a, b) => a.order - b.order);
    if (!inCat.length) continue;
    html += `<div class="side-group"><div class="side-label">${cat.label}</div><ul>`;
    for (const p of inCat) {
      const active = p.slug === current ? ' class="active" aria-current="page"' : "";
      html += `<li><a href="../${p.slug}/"${active}>${escapeHtml(p.navTitle || p.title)}</a></li>`;
    }
    html += `</ul></div>`;
  }
  return html;
}

function buildToc(headings) {
  if (!headings.length) return "";
  let html = `<div class="toc-label">On this page</div><ul>`;
  for (const h of headings) {
    html += `<li class="lvl-${h.depth}"><a href="#${h.id}">${escapeHtml(h.text)}</a></li>`;
  }
  return html + `</ul>`;
}

const LOGO = `<svg viewBox="0 0 40 32" aria-hidden="true"><rect x="21" y="3" width="9" height="9" rx="1.5" transform="rotate(45 25.5 7.5)" fill="var(--accent)"/><path d="M2 28 L13 10 L20 22 L26 14 L38 28 Z" fill="var(--logo)"/></svg>`;

function searchModal() {
  return `<div class="search-root" s-cloak s-data="search" data-base="../"
    @open-search.window="open()"
    @keydown.window.cmd.k.prevent="open()" @keydown.window.ctrl.k.prevent="open()">
    <div class="search-overlay" s-show="isOpen" @click="close()"></div>
    <div class="search-panel" s-show="isOpen" @keydown.escape.window="close()" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent="go()">
      <div class="search-input-row">
        <svg class="si" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
        <input s-ref="input" class="search-input" placeholder="Search the docs" s-model="query" @input="run()" />
        <kbd class="esc">Esc</kbd>
      </div>
      <div class="search-results" s-ref="list">
        <div class="search-loading" s-show="isLoading"><span class="spinner" aria-hidden="true"></span>Loading search...</div>
        <div s-show="!isLoading && !query">
          <div class="search-section" s-show="recent.length">Recent</div>
          <template s-for="(r, i) in recent" :key="'r' + i">
            <a class="search-hit" :class="{ active: active === i }" :href="r.url" @mouseenter="active = i" @click="remember(r)">
              <span class="hit-icon">↩</span>
              <span class="hit-main"><span class="hit-title" s-text="r.heading"></span><span class="hit-page" s-text="r.page"></span></span>
            </a>
          </template>
          <div class="search-section" s-show="suggested.length">Suggested</div>
          <template s-for="(r, j) in suggested" :key="'s' + j">
            <a class="search-hit" :class="{ active: active === recent.length + j }" :href="r.url" @mouseenter="active = recent.length + j" @click="remember(r)">
              <span class="hit-icon">→</span>
              <span class="hit-main"><span class="hit-title" s-text="r.heading"></span><span class="hit-page" s-text="r.page"></span></span>
            </a>
          </template>
        </div>
        <div class="search-empty" s-show="!isLoading && query && results.length === 0">No results for "<span s-text="query"></span>".</div>
        <template s-for="(r, i) in results" :key="r.url + i">
          <a class="search-hit" :class="{ active: active === i }" :href="r.url" @mouseenter="active = i" @click="remember(r)">
            <span class="hit-icon">#</span>
            <span class="hit-main">
              <span class="hit-title" s-html="r.titleHtml"></span>
              <span class="hit-snippet" s-html="r.snippetHtml"></span>
              <span class="hit-page" s-text="r.page"></span>
            </span>
          </a>
        </template>
      </div>
      <div class="search-foot">
        <span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
        <span><kbd>↵</kbd> to select</span>
        <span><kbd>esc</kbd> to close</span>
      </div>
    </div>
  </div>`;
}

function layout(page, contentHtml, toc, sidebar, prev, next) {
  const pager =
    `<nav class="pager">` +
    (prev ? `<a class="pg prev" href="../${prev.slug}/"><span>Previous</span><strong>${escapeHtml(prev.title)}</strong></a>` : `<span></span>`) +
    (next ? `<a class="pg next" href="../${next.slug}/"><span>Next</span><strong>${escapeHtml(next.title)}</strong></a>` : `<span></span>`) +
    `</nav>`;

  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(page.title)} · Summit.js</title>
<meta name="description" content="${escapeHtml(page.description || "Summit.js documentation")}"/>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 32'%3E%3Crect x='21' y='3' width='9' height='9' rx='1.5' transform='rotate(45 25.5 7.5)' fill='%230d9488'/%3E%3Cpath d='M2 28 L13 10 L20 22 L26 14 L38 28 Z' fill='%230f172a'/%3E%3C/svg%3E"/>
<script>(function(){var t=localStorage.getItem("summit-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;})();</script>
<link rel="stylesheet" href="../assets/docs.css"/>
<link rel="stylesheet" href="../assets/components.css"/>
</head>
<body>
<a class="skip" href="#content">Skip to content</a>
<header class="topbar">
  <a class="brand" href="../"><span class="brand-mark">${LOGO}</span><span class="brand-word">Summit<span class="dot">.js</span></span></a>
  <div class="top-spacer"></div>
  <a class="top-navlink" href="../components/">UI Library</a>
  <button class="search-trigger" s-data @click="$dispatch('open-search')" aria-label="Search">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
    <span>Search</span><kbd class="cmdk">⌘K</kbd>
  </button>
  <a class="top-link" href="https://github.com/velofy/summit" aria-label="GitHub"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.26 3.4.96.1-.75.4-1.27.73-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.3-.52-1.47.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.28 5.69.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"/></svg></a>
  <button class="top-icon theme-toggle" title="Toggle theme" aria-label="Toggle theme" s-data @click="document.documentElement.dataset.theme=(document.documentElement.dataset.theme==='dark'?'light':'dark');localStorage.setItem('summit-theme',document.documentElement.dataset.theme)"><svg class="moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg><svg class="sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>
  <button class="menu-toggle" s-data="{ o:false }" @click="o=!o; document.body.classList.toggle('nav-open', o)" aria-label="Menu">☰</button>
</header>
<div class="layout">
  <aside class="sidebar"><nav>${sidebar}</nav></aside>
  <main id="content" class="content">
    <article class="prose">
      <div class="crumbs">${page.categoryLabel}</div>
      <h1>${escapeHtml(page.title)}</h1>
      ${contentHtml}
    </article>
    ${pager}
  </main>
  <aside class="toc"><nav>${toc}</nav></aside>
</div>
<footer class="site-foot"><div class="foot-inner">
  <span class="foot-brand">${LOGO}<span>Summit<span class="dot">.js</span></span></span>
  <span class="foot-motto">Open Source. <span class="nat">by Nature.</span></span>
  <span>MIT · <a href="https://github.com/velofy/summit">github.com/velofy/summit</a></span>
</div></footer>
${searchModal()}
<script src="../assets/search.js" defer></script>
<script src="../summit.min.js" defer></script>
<script>document.addEventListener("click",function(e){var b=e.target.closest("[data-copy]");if(!b)return;var c=b.parentElement.querySelector("code");navigator.clipboard.writeText(c.innerText);b.textContent="Copied";setTimeout(function(){b.textContent="Copy";},1200);});</script>
</body>
</html>`;
}

// --- Main ----------------------------------------------------------------

function main() {
  if (!existsSync(CONTENT)) {
    console.error(`No content directory at ${CONTENT}`);
    process.exit(1);
  }
  const files = readdirSync(CONTENT).filter((f) => f.endsWith(".md"));
  const catLabel = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));

  const pages = files.map((file) => {
    const raw = readFileSync(join(CONTENT, file), "utf8");
    const { data, body } = parseFrontmatter(raw);
    const slug = data.slug || file.replace(/\.md$/, "");
    return {
      file, body, slug,
      title: data.title || slug,
      navTitle: data.nav || data.title || slug,
      description: data.description || "",
      category: data.category || "essentials",
      categoryLabel: catLabel[data.category] || "Docs",
      order: data.order ?? 99,
      url: `../${slug}/`,
    };
  });

  // Global reading order: category order, then page order.
  const catIndex = Object.fromEntries(CATEGORIES.map((c, i) => [c.key, i]));
  const ordered = [...pages].sort((a, b) => (catIndex[a.category] - catIndex[b.category]) || (a.order - b.order));

  const searchIndex = [];
  for (const page of pages) {
    // URLs stay as "../<slug>/#anchor". Every docs page sits at the same depth
    // (docs/<slug>/index.html), so this resolves correctly from any of them.
    for (const e of buildSearchEntries(page, page.body)) searchIndex.push(e);
  }

  const slugSet = new Set(pages.map((p) => p.slug));
  const broken = [];

  for (const page of pages) {
    currentHeadings = [];
    const marked = makeMarked();
    const contentHtml = marked.parse(page.body);
    const toc = buildToc(currentHeadings);
    const sidebar = buildSidebar(pages, page.slug);
    const idx = ordered.findIndex((p) => p.slug === page.slug);
    const prev = ordered[idx - 1];
    const next = ordered[idx + 1];
    const dir = join(OUT, page.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), layout(page, contentHtml, toc, sidebar, prev, next));

    // Validate internal cross-links (case-sensitive on Pages).
    for (const m of contentHtml.matchAll(/href="\.\.\/([^"#/]+)\//g)) {
      if (!slugSet.has(m[1])) broken.push(`${page.slug}  ->  ../${m[1]}/`);
    }
  }

  writeFileSync(join(OUT, "search-index.json"), JSON.stringify(searchIndex));
  console.log(`Built ${pages.length} docs pages + search index (${searchIndex.length} entries).`);
  if (broken.length) {
    console.warn(`\n${broken.length} broken internal link(s):`);
    broken.forEach((b) => console.warn("  " + b));
  } else {
    console.log("All internal cross-links resolve.");
  }
}

main();
