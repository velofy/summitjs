/**
 * Enforce a gzip size budget on the CDN bundle so the "small" claim stays true.
 * Run after `npm run build`.
 */
import { gzipSync } from "node:zlib";
import { readFileSync, existsSync } from "node:fs";

const BUDGET_KB = 16; // hard ceiling; Alpine core is ~15-16 KB gzip
const file = "dist/summit.min.js";

if (!existsSync(file)) {
  console.error(`Missing ${file}. Run "npm run build" first.`);
  process.exit(1);
}

const raw = readFileSync(file);
const gz = gzipSync(raw).length;
const kb = (gz / 1024).toFixed(2);

console.log(`summit.min.js: ${(raw.length / 1024).toFixed(2)} KB min, ${kb} KB gzip`);

if (gz / 1024 > BUDGET_KB) {
  console.error(`Over budget: ${kb} KB > ${BUDGET_KB} KB`);
  process.exit(1);
}
console.log(`Within ${BUDGET_KB} KB budget.`);
