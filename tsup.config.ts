import { defineConfig } from "tsup";

export default defineConfig([
  // Library builds: ESM + CJS + types, tree-shakeable, for bundler/npm users.
  {
    entry: { summit: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    outExtension({ format }) {
      return { js: format === "cjs" ? ".cjs" : ".js" };
    },
  },
  // Optional data layer (summitjs/net). `summitjs` is external so this bundle
  // reuses the core's single reactivity runtime rather than shipping a second
  // copy — a duplicate runtime would break the resource -> DOM signal link.
  {
    entry: { net: "src/net/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    treeshake: true,
    external: ["summitjs"],
    outExtension({ format }) {
      return { js: format === "cjs" ? ".cjs" : ".js" };
    },
  },
  // CDN build: a single self-executing bundle that auto-starts. This is the
  // drop-in-a-script path. cdn.ts exposes `window.Summit` and boots on its own,
  // so no globalName wrapper is needed (which keeps the filename clean).
  {
    entry: { "summit.min": "src/cdn.ts" },
    format: ["iife"],
    minify: true,
    sourcemap: true,
    dts: false,
    treeshake: true,
  },
]);
