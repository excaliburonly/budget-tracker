@AGENTS.md

# Next.js 15+ & React 19 Standards
- **Serializable Props:** When passing functions as props to Client Components, they MUST be named `action` or end with `Action` (e.g., `onCloseAction`, `onSuccessAction`). This is a strict requirement for Next.js 15+ to distinguish between standard callbacks and Server Actions at the component boundary.
- **Client Boundaries:** Ensure `"use client"` is placed correctly. Avoid passing non-serializable data from Server Components to Client Components.

# Pre-computation & Validation
- **Mandatory Validation:** After ANY file modification, you MUST run local linting and type-checking (`npm run lint` or `npx tsc --noEmit`) and a build check (`npm run build`) to ensure no regressions or TypeScript/Next.js compiler errors were introduced.
- **Strict Compliance:** Adhere to all ESLint rules in the project's config.
- **No Linter Disables:** DO NOT use `// eslint-disable-next-line` or `/* eslint-disable */` comments. Fix the code if linting fails.
