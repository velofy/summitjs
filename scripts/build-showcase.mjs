// Assemble a self-contained UI Library showcase for publishing as an Artifact.
// Inlines design tokens, components.css, gallery layout CSS, the showcase body,
// and the Summit bundle so the whole gallery is live with no external requests.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = process.argv[2] || join(root, "showcase.html");

const tokens = `:root {
  --bg: #ffffff; --surface: #ffffff; --surface-2: #f7f9fc; --border: #e6e9ef;
  --text: #0f172a; --muted: #475569; --faint: #64748b;
  --accent: #0d9488; --accent-2: #0f766e; --accent-soft: #e6f5f2;
  --ink: #0f172a; --ink-contrast: #ffffff;
  --shadow: 0 1px 2px rgba(15,23,42,.05), 0 10px 30px rgba(15,23,42,.06);
  --shadow-lg: 0 24px 60px rgba(15,23,42,.14);
  --font: ui-rounded, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --body: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --mono: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #0b1120; --surface: #0e1728; --surface-2: #0e1728; --border: #1e293b;
  --text: #e6ebf4; --muted: #9aa7bd; --faint: #7c8aa0;
  --accent: #2dd4bf; --accent-2: #5eead4; --accent-soft: #0f2b2a;
  --ink: #e6ebf4; --ink-contrast: #0b1120;
  --shadow: 0 1px 2px rgba(0,0,0,.4), 0 12px 34px rgba(0,0,0,.4);
  --shadow-lg: 0 30px 70px rgba(0,0,0,.6);
} }
:root[data-theme="dark"] {
  --bg: #0b1120; --surface: #0e1728; --surface-2: #0e1728; --border: #1e293b;
  --text: #e6ebf4; --muted: #9aa7bd; --faint: #7c8aa0;
  --accent: #2dd4bf; --accent-2: #5eead4; --accent-soft: #0f2b2a;
  --ink: #e6ebf4; --ink-contrast: #0b1120;
  --shadow: 0 1px 2px rgba(0,0,0,.4), 0 12px 34px rgba(0,0,0,.4);
  --shadow-lg: 0 30px 70px rgba(0,0,0,.6);
}`;

const gallery = `* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--body); line-height: 1.6; -webkit-font-smoothing: antialiased; }
a { color: var(--accent-2); text-decoration: none; }
a:hover { text-decoration: underline; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }
[s-cloak] { display: none !important; }
.gx-wrap { max-width: 1160px; margin: 0 auto; padding: 0 1.25rem 4rem; }
.gx-top { display: flex; align-items: center; gap: .9rem; padding: 1.15rem 0; flex-wrap: wrap; }
.gx-brand { display: flex; align-items: center; gap: .5rem; font-family: var(--font); font-weight: 800; font-size: 1.3rem; letter-spacing: -.03em; }
.gx-mark svg { width: 26px; height: 22px; display: block; color: var(--accent); }
.gx-dot { color: var(--accent); }
.gx-eyebrow { display: inline-flex; align-items: center; gap: .5rem; font-size: .8rem; color: var(--muted); border: 1px solid var(--border); border-radius: 999px; padding: .25rem .7rem; }
.gx-pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: gx-pulse 2.4s ease-out infinite; }
@keyframes gx-pulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 55%, transparent); } 70% { box-shadow: 0 0 0 9px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }
.gx-spacer { flex: 1; }
.gx-hero { padding: 1.5rem 0 2rem; border-bottom: 1px solid var(--border); margin-bottom: 2rem; }
.gx-hero h1 { font-family: var(--font); font-size: clamp(2rem, 5vw, 3rem); letter-spacing: -.03em; margin: 0 0 .5rem; text-wrap: balance; }
.gx-hero p { color: var(--muted); font-size: 1.05rem; max-width: 62ch; margin: 0; }
.gx-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.1rem; align-items: start; }
.gx-cell { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow); padding: 1.25rem; }
.gx-label { font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; color: var(--faint); font-weight: 700; margin-bottom: 1rem; }
.gx-foot { text-align: center; color: var(--muted); margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); font-size: .9rem; }
.gx-nat { color: var(--accent-2); font-style: italic; }
@media (prefers-reduced-motion: reduce) { .gx-pulse { animation: none; } }`;

const components = readFileSync(join(root, "docs/assets/components.css"), "utf8");
const bundle = readFileSync(join(root, "dist/summit.min.js"), "utf8");
const body = readFileSync(process.argv[3] || join(root, "showcase-body.html"), "utf8");

const html = `<title>Summit UI Library</title>
<style>
${tokens}

${gallery}

${components}
</style>

${body}

<script>${bundle}</script>
`;

writeFileSync(out, html);
console.log(`Wrote showcase -> ${out} (${(html.length / 1024).toFixed(1)} KB)`);
