import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, chmodSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, delimiter } from "node:path";

const root = join(__dirname, "..");

// Run scripts/release-npm.mjs with a fake `npm` first on PATH that exits with
// the given code, so no real publish can happen.
function release(exitCode: number) {
  const bin = mkdtempSync(join(tmpdir(), "summit-fake-npm-"));
  const fake = join(bin, "npm");
  writeFileSync(fake, `#!/bin/sh\necho "fake npm $*"\nexit ${exitCode}\n`);
  chmodSync(fake, 0o755);
  const r = spawnSync(process.execPath, ["scripts/release-npm.mjs"], {
    cwd: root,
    env: { ...process.env, PATH: bin + delimiter + (process.env.PATH ?? "") },
    encoding: "utf8",
  });
  rmSync(bin, { recursive: true, force: true });
  return r;
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
});
