# Testing Patterns

**Analysis Date:** 2026-10-02

## Test Framework

**Runner:**
- No test runner is configured in `package.json`; no test files or test-specific configuration were found in the active worktree.
- No test framework or assertion library is detected.

**Assertion Library:**
- Not detected.

**Run Commands:**
```bash
npm run lint           # TypeScript check (tsc --noEmit), not a test suite
npx tsc --noEmit        # One-off TypeScript check documented by the repository
npm run build          # Vite production build, then bundle server.ts with esbuild
npm run dev             # Start the development server via tsx server.ts
npm run start           # Start the built server from dist/server.cjs
```

`package.json` has no `test`, watch-test, or coverage script. `.github/copilot-instructions.md` likewise states that no dedicated test runner is configured and identifies `npm run lint` as quick validation. The repository includes `package-lock.json`; install dependencies with `npm install` before running the scripts. `node_modules/` is not present in this active worktree, so the scripts were not executed as part of this mapping.

## Test File Organization

**Location:**
- No unit, integration, or end-to-end test files were found under `src/` or in the tracked repository.

**Naming:**
- No test naming convention is established.

**Structure:**
- No test directory structure is present. Application code is organized in `src/` and `src/components/`, for example `src/App.tsx` and `src/components/LapTimeDashboard.tsx`.

## Test Structure

**Suite Organization:**
- Not applicable: no test suites or test cases are present.

**Patterns:**
- Setup pattern: Not detected.
- Teardown pattern: Not detected.
- Assertion pattern: Not detected.

## Mocking

**Framework:** Not detected.

**Patterns:**
- No mocking examples are present.

**What to Mock:**
- Not established by this repository.

**What NOT to Mock:**
- Not established by this repository.

## Fixtures and Factories

**Test Data:**
- No test fixtures or test factories are present. Production/demo data is defined separately, such as car presets in `src/constants.ts` and seeded community setup data in `server.ts`.

**Location:**
- Not applicable for tests. Shared application/domain types are in `src/types.ts`.

## Coverage

**Requirements:** No coverage target or coverage tool is configured in `package.json`.

**View Coverage:**
```bash
# Not available: no coverage script or coverage provider is configured.
```

## Test Types

**Unit Tests:**
- None detected. Logic such as `getBaselineTuning` in `src/constants.ts` has no accompanying unit-test file in the repository.

**Integration Tests:**
- None detected. The API handlers in `server.ts` have no automated integration-test suite.

**E2E Tests:**
- No E2E test framework or tests are configured. `.github/copilot-instructions.md` mentions Playwright MCP for optional UI validation; this is not a configured automated test suite.

## Common Patterns

**Async Testing:**
```typescript
// No asynchronous test pattern is established in the repository.
```

**Error Testing:**
```typescript
// No error assertion pattern is established in the repository.
```

---

*Testing analysis: 2026-10-02*
