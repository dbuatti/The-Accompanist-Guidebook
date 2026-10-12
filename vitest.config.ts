import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  // Transform JSX/TSX with the automatic runtime (no babel plugin needed).
  esbuild: {
    jsx: "automatic",
  },
  test: {
    // Default to a plain Node environment: the current suites are pure logic.
    // Component tests can opt into DOM by adding `// @vitest-environment jsdom`
    // at the top of the file.
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    clearMocks: true,
    restoreMocks: true,
  },
});
