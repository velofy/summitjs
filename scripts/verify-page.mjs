/**
 * Verify the old Pages site's entry points.
 *
 * docs/index.html must redirect to the project page and docs/404.html to the
 * docs index on GitHub, and the CDN files that existing sites load from the
 * old Pages URL must still be published from docs/.
 */
import { readFileSync, existsSync } from "node:fs";
import { redirectStub, HOME, DOCS_INDEX } from "./build-docs.mjs";

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("ok:", msg);
}

for (const [f, target] of [["docs/index.html", HOME], ["docs/404.html", DOCS_INDEX]]) {
  assert(existsSync(f) && readFileSync(f, "utf8") === redirectStub(target), `${f} redirects to ${target}`);
}

// Existing pages load these straight from the old Pages URL; keep serving them.
for (const f of [
  "docs/summit.min.js",
  "docs/summit-net.min.js",
  "docs/assets/components.css",
  "docs/assets/techniques.css",
  "docs/assets/tokens.css",
]) {
  assert(existsSync(f), `${f} is still published`);
}

// The published bundle must match the build that produced it.
if (existsSync("dist/summit.min.js")) {
  assert(
    readFileSync("docs/summit.min.js", "utf8") === readFileSync("dist/summit.min.js", "utf8"),
    "docs/summit.min.js matches dist/summit.min.js",
  );
}

console.log(`\nPage verification passed: the old site redirects to ${HOME} and ${DOCS_INDEX}, and still serves the CDN files.`);
process.exit(0);
