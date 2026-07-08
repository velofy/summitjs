import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
    globals: false,
  },
  // Resolve the public "summitjs" specifier to the source entry so tests and the
  // optional `src/net` layer share one reactivity runtime (the same module the
  // core imports via relative paths), mirroring how npm dedupes the package.
  resolve: {
    alias: {
      summitjs: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
    },
  },
});
