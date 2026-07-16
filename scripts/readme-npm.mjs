import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";

// npmjs.com renders the readme captured in the publish manifest, which npm
// reads from README.md in the package dir (not from the tarball), so the swap
// must bracket the whole `npm publish` (see the release:npm script), not just
// prepack/postpack. The npm variant uses the npm tracking link, and keeps a
// plain <img> because npm's sanitizer can drop <picture>/<source>.
const README = new URL("../README.md", import.meta.url).pathname;
const BACKUP = new URL("../.readme.github.md", import.meta.url).pathname;

const mode = process.argv[2];

if (mode === "swap") {
  const src = readFileSync(README, "utf8");
  // never clobber an existing backup: a double swap must not lose the original
  if (!existsSync(BACKUP)) writeFileSync(BACKUP, src);
  let out = src.replaceAll(
    "https://go.nodemaven.com/summitjsGitHub",
    "https://go.nodemaven.com/summitjssoft",
  );
  out = out.replace(/<picture>\s*<source[^>]*>\s*(<img[^>]*>)\s*<\/picture>/g, "$1");
  writeFileSync(README, out);
} else if (mode === "restore") {
  if (existsSync(BACKUP)) renameSync(BACKUP, README);
} else {
  console.error("usage: node scripts/readme-npm.mjs swap|restore");
  process.exit(1);
}
