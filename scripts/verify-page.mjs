/**
 * Verify the retired Pages site's entry points.
 *
 * The docs moved to https://velofy.co/summitjs/. docs/index.html and
 * docs/404.html must be the redirect stub, and the CDN files that existing
 * sites load from the old Pages URL must still be published from docs/.
 */
import { readFileSync, existsSync } from "node:fs";
import { redirectStub, SITE } from "./build-docs.mjs";

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("ok:", msg);
}

const stub = redirectStub(`${SITE}/`);
for (const f of ["docs/index.html", "docs/404.html"]) {
  assert(existsSync(f) && readFileSync(f, "utf8") === stub, `${f} redirects to ${SITE}/`);
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

console.log(`\nPage verification passed: the old site redirects to ${SITE}/ and still serves the CDN files.`);
process.exit(0);
