// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: { server: { host: "127.0.0.1" } },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Lovable's own preview build always forces "cloudflare-module" for its
  // hosted sandbox (see vite-tanstack-config's isSandboxEnvironment() check),
  // regardless of what's set here — so this only takes effect for builds run
  // outside that sandbox, i.e. our own Docker/Azure build. "node-server" is
  // nitro's preset for a plain Node HTTP server (`node .output/server/index.mjs`),
  // which is what the container image runs.
  nitro: { preset: "node-server" },
});
