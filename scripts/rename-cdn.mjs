/**
 * tsup names IIFE output `*.global.js`. Rename each CDN bundle to a clean
 * `*.min.js`, fix its sourcemap references, and sync it into `docs/` so the
 * site is servable on its own.
 */
import { renameSync, existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";

for (const base of ["summit.min", "summit-net.min"]) {
  const from = `dist/${base}.global.js`;
  const to = `dist/${base}.js`;
  if (!existsSync(from)) continue;

  // Rewrite the sourceMappingURL comment, then move both files.
  const js = readFileSync(from, "utf8").replace(`${base}.global.js.map`, `${base}.js.map`);
  writeFileSync(from, js);
  renameSync(from, to);

  if (existsSync(from + ".map")) {
    const map = JSON.parse(readFileSync(from + ".map", "utf8"));
    map.file = `${base}.js`;
    writeFileSync(from + ".map", JSON.stringify(map));
    renameSync(from + ".map", to + ".map");
  }

  // Keep the docs site's local copy in sync so `docs/` is servable on its own.
  copyFileSync(to, `docs/${base}.js`);
  if (existsSync(to + ".map")) copyFileSync(to + ".map", `docs/${base}.js.map`);
  console.log(`Renamed CDN bundle -> ${to} (and synced docs/)`);
}
