import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, readFileSync, existsSync, rmSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, delimiter } from "node:path";

const root = join(__dirname, "..");
const script = join(root, "scripts", "release-npm.mjs");

// Run scripts/release-npm.mjs in a scratch package directory that holds a copy
// of the real README, with a fake `npm` first on PATH that exits with the given
// code, so no real publish can happen. The fake npm copies the README it sees,
// which is the one npm would publish, to `published`.
//
// The real README.md is never touched: these tests also run from
// prepublishOnly in the middle of `npm run release:npm`, while the real README
// is swapped and its backup is waiting to be restored.
function release(exitCode: number) {
  const tmp = mkdtempSync(join(tmpdir(), "summit-release-"));
  const bin = join(tmp, "bin");
  const pkg = join(tmp, "pkg");
  mkdirSync(bin);
  mkdirSync(pkg);
  copyFileSync(join(root, "README.md"), join(pkg, "README.md"));
  const seen = join(tmp, "README.published.md");
  const fake = join(bin, "npm");
  writeFileSync(fake, `#!/bin/sh\necho "fake npm $*"\ncp README.md "${seen}"\nexit ${exitCode}\n`);
  chmodSync(fake, 0o755);
  const before = readFileSync(join(pkg, "README.md"), "utf8");
  const r = spawnSync(process.execPath, [script], {
    cwd: pkg,
    env: { ...process.env, PATH: bin + delimiter + (process.env.PATH ?? "") },
    encoding: "utf8",
  });
  const result = {
    ...r,
    before,
    after: readFileSync(join(pkg, "README.md"), "utf8"),
    backupLeft: existsSync(join(pkg, ".readme.github.md")),
    published: existsSync(seen) ? readFileSync(seen, "utf8") : "",
  };
  rmSync(tmp, { recursive: true, force: true });
  return result;
}

describe.skipIf(process.platform === "win32")("release:npm", () => {
  it("fails when npm publish fails and still restores the README", () => {
    const r = release(1);
    expect(r.status).toBe(1);
    expect(r.stdout).toContain("fake npm publish");
    expect(r.after).toBe(r.before);
    expect(r.backupLeft).toBe(false);
  });

  it("succeeds when npm publish succeeds and restores the README", () => {
    const r = release(0);
    expect(r.status).toBe(0);
    expect(r.after).toBe(r.before);
    expect(r.backupLeft).toBe(false);
  });

  it("publishes the npm README: whole npm tracking links and no <picture>", () => {
    const r = release(0);
    const links = r.published.match(/https:\/\/go\.nodemaven\.com\/[A-Za-z0-9_-]+/g) ?? [];
    expect(links.length).toBeGreaterThan(0);
    expect(new Set(links)).toEqual(new Set(["https://go.nodemaven.com/summitjsnpmjs"]));
    expect(r.published).not.toContain("<picture>");
  });
});
