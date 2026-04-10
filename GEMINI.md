@AGENTS.md

# ESLint & Code Quality Guidelines
- **Strict Compliance:** Adhere to all ESLint rules in the project's config (e.g., .eslintrc, eslint.config.js, or package.json).
- **No Linter Disables:** DO NOT use `// eslint-disable-next-line` or `/* eslint-disable */` comments. Fix the code if linting fails, do not suppress the error.
- **Zero "Any" Types:** If using TypeScript, do not use the `any` type. Use `unknown` or proper interfaces.
- **Formatting:** Ensure generated code is compatible with `eslint --fix` or Prettier.
- **No Code Smells:** Avoid high-complexity functions (max 2 params, 50 lines/function, 250 lines/file).

# Pre-computation
- Before delivering code, run local linting (`npm run lint` or `npx eslint`) if possible to verify compliance.
