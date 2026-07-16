import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";

// npm renders the tarball's README.md, so prepack swaps in the npm variant of
// the sponsor block (npm tracking link, and npm's sanitizer can drop
// <picture>/<source>, so keep the plain <img>) and postpack restores it.
const README = new URL("../README.md", import.meta.url).pathname;
const BACKUP = new URL("../.readme.github.md", import.meta.url).pathname;

const mode = process.argv[2];

if (mode === "swap") {
  const src = readFileSync(README, "utf8");
  writeFileSync(BACKUP, src);
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
