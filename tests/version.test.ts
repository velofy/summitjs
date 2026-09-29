import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Summit, { version } from "../src/index.js";

// Summit.version is a hand-set constant in src/summit.ts. It was stuck at
// "0.1.0" through 0.4.3; this keeps it tied to package.json on every release.
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf8"));

describe("version", () => {
  it("matches package.json", () => {
    expect(version).toBe(pkg.version);
    expect(Summit.version).toBe(pkg.version);
  });
});
