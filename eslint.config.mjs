import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local scratch files (git-ignored)
    "scratch/**",
  ]),
  {
    // Standalone Node scripts are CommonJS and run outside the Next.js bundle
    files: ["**/*.cjs", "*.js", "scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // Service worker runs in the ServiceWorkerGlobalScope
    files: ["public/sw.js"],
    languageOptions: {
      globals: { self: "readonly", clients: "readonly" },
    },
  },
]);

export default eslintConfig;
