/**
 * Generate a self-contained preview of the homepage with Summit, the command
 * palette, and the search index all inlined, for publishing as an Artifact
 * (external requests are blocked there). Strips the document wrapper so the
 * content drops into the Artifact skeleton.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const html = readFileSync("docs/index.html", "utf8");
const bundle = readFileSync("dist/summit.min.js", "utf8");
const searchJs = readFileSync("docs/assets/search.js", "utf8");
const index = existsSync("docs/search-index.json") ? readFileSync("docs/search-index.json", "utf8") : "[]";

const styles = html.match(/<style>([\s\S]*?)<\/style>/)[1];
let bodyInner = html.match(/<body>([\s\S]*?)<\/body>/)[1];

// Drop every script tag; we inline the runtime, the palette, and the index
// ourselves below so the preview needs no network at all.
bodyInner = bodyInner.replace(/<script[\s\S]*?<\/script>/g, "");

const out = `<style>\n${styles}\n</style>\n${bodyInner}\n<script>\nwindow.__SUMMIT_SEARCH_INDEX__ = ${index};\n</script>\n<script>\n${searchJs}\n</script>\n<script>\n${bundle}\n</script>\n`;

const target = process.argv[2] || "docs/preview.html";
writeFileSync(target, out);
console.log(`Wrote preview -> ${target} (${(out.length / 1024).toFixed(1)} KB)`);
