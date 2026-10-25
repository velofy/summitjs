import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, chmodSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, delimiter } from "node:path";

const root = join(__dirname, "..");

// Run scripts/release-npm.mjs with a fake `npm` first on PATH that exits with
// the given code, so no real publish can happen. The fake npm copies the
// README it sees, which is the one npm would publish, to `published`.
function release(exitCode: number) {
  const bin = mkdtempSync(join(tmpdir(), "summit-fake-npm-"));
  const fake = join(bin, "npm");
  const seen = join(bin, "README.published.md");
  writeFileSync(fake, `#!/bin/sh\necho "fake npm $*"\ncp README.md "${seen}"\nexit ${exitCode}\n`);
  chmodSync(fake, 0o755);
  const r = spawnSync(process.execPath, ["scripts/release-npm.mjs"], {
    cwd: root,
    env: { ...process.env, PATH: bin + delimiter + (process.env.PATH ?? "") },
    encoding: "utf8",
  });
  const published = existsSync(seen) ? readFileSync(seen, "utf8") : "";
  rmSync(bin, { recursive: true, force: true });
  return { ...r, published };
}

describe.skipIf(process.platform === "win32")("release:npm", () => {
  const readme = join(root, "README.md");

  it("fails when npm publish fails and still restores the README", () => {
    const before = readFileSync(readme, "utf8");
    const r = release(1);
    expect(r.status).toBe(1);
    expect(r.stdout).toContain("fake npm publish");
    expect(readFileSync(readme, "utf8")).toBe(before);
    expect(existsSync(join(root, ".readme.github.md"))).toBe(false);
  });

  it("succeeds when npm publish succeeds and restores the README", () => {
    const before = readFileSync(readme, "utf8");
    const r = release(0);
    expect(r.status).toBe(0);
    expect(readFileSync(readme, "utf8")).toBe(before);
  });

  it("publishes the npm README: whole npm tracking links and no <picture>", () => {
    const r = release(0);
    const links = r.published.match(/https:\/\/go\.nodemaven\.com\/[A-Za-z0-9_-]+/g) ?? [];
    expect(links.length).toBeGreaterThan(0);
    expect(new Set(links)).toEqual(new Set(["https://go.nodemaven.com/summitjsnpmjs"]));
    expect(r.published).not.toContain("<picture>");
  });
});
