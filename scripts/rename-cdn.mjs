/**
 * tsup names IIFE output `*.global.js`. Rename the CDN bundle to a clean
 * `summit.min.js` and fix its sourcemap references.
 */
import { renameSync, existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";

const from = "dist/summit.min.global.js";
const to = "dist/summit.min.js";

if (!existsSync(from)) process.exit(0);

// Rewrite the sourceMappingURL comment, then move both files.
let js = readFileSync(from, "utf8").replace("summit.min.global.js.map", "summit.min.js.map");
writeFileSync(from, js);
renameSync(from, to);

if (existsSync(from + ".map")) {
  const map = JSON.parse(readFileSync(from + ".map", "utf8"));
  map.file = "summit.min.js";
  writeFileSync(from + ".map", JSON.stringify(map));
  renameSync(from + ".map", to + ".map");
}

// Keep the docs site's local copy in sync so `docs/` is servable on its own.
copyFileSync(to, "docs/summit.min.js");
if (existsSync(to + ".map")) copyFileSync(to + ".map", "docs/summit.min.js.map");

console.log("Renamed CDN bundle -> dist/summit.min.js (and synced docs/)");
