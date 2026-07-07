/**
 * Generate a self-contained preview of the docs site with Summit inlined, for
 * publishing as an Artifact (external scripts are blocked there). Strips the
 * document wrapper so the content drops into the Artifact skeleton, and adds a
 * prefers-color-scheme fallback so both themes render before any toggle.
 */
import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("docs/index.html", "utf8");
const bundle = readFileSync("dist/summit.min.js", "utf8");

const styles = html.match(/<style>([\s\S]*?)<\/style>/)[1];
let bodyInner = html.match(/<body>([\s\S]*?)<\/body>/)[1];

// The Artifact frame provides its own theme control, so drop the in-page toggle
// and the external loader script; we inline the bundle instead. The page's own
// CSS already handles both light and dark themes.
bodyInner = bodyInner
  .replace(/<button\s+class="ghost-btn"[\s\S]*?<\/button>/, "")
  .replace(/<script src="\.\/summit\.min\.js"[\s\S]*?<\/script>/, "");

const out = `<style>\n${styles}\n</style>\n${bodyInner}\n<script>\n${bundle}\n</script>\n`;

const target = process.argv[2] || "docs/preview.html";
writeFileSync(target, out);
console.log(`Wrote preview -> ${target} (${(out.length / 1024).toFixed(1)} KB)`);
