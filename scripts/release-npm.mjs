/**
 * `npm run release:npm`: swap in the npm README, run `npm publish`, and always
 * restore the GitHub README. Exits with npm publish's status, so a failed
 * publish (no login, bad OTP, version already taken) fails the command.
 * Extra arguments pass through: `npm run release:npm -- --otp 123456`.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const readmeScript = fileURLToPath(new URL("./readme-npm.mjs", import.meta.url));
const win = process.platform === "win32";

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: win });
  if (r.error) console.error(r.error.message);
  return r.status ?? 1;
}

let status = run(process.execPath, [readmeScript, "swap"]);
if (status === 0) {
  status = run("npm", ["publish", ...process.argv.slice(2)]);
  if (status !== 0) console.error(`\nnpm publish failed (exit ${status}). Nothing was published.`);
}
const restored = run(process.execPath, [readmeScript, "restore"]);
if (status === 0 && restored !== 0) status = restored;
process.exit(status);
