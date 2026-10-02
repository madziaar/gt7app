# Coding Conventions

**Analysis Date:** 2026-10-02

## Naming Patterns

**Files:**
- Use PascalCase for React feature-component files, as in `src/components/CommunitySharing.tsx` and `src/components/TuningDetails.tsx`; use lower camelCase for utility modules such as `src/googleSync.ts`.
- Keep the main application in `src/App.tsx`, domain models in `src/types.ts`, and shared catalog data in `src/constants.ts`.

**Functions:**
- Use camelCase for functions and event handlers, including `getBaselineTuning` in `src/constants.ts`, `handleSaveSetup` in `src/App.tsx`, and `handleGenerateAiSetup` in `src/components/TuningDetails.tsx`.
- Name React components with PascalCase and export them as default functions, as in `src/components/RaceEngineerChat.tsx`.

**Variables:**
- Use camelCase for local variables and state setters. Boolean state commonly uses `is`/`show` prefixes (`isLoading`, `showConfirm`) in `src/components/CommunitySharing.tsx` and `src/components/OAuthAndSync.tsx`.
- Use uppercase names for shared static catalogs and lists, such as `TRACKS`, `CAR_PRESETS`, and `NVIDIA_MODELS` in `src/constants.ts`.

**Types:**
- Use PascalCase for interfaces and named types: `TuningSetup`, `TuningParams`, and `LapTimeLog` in `src/types.ts`.
- Represent constrained domain values as string unions (`WeatherCondition`, `CarClass`, and `DrivetrainType`) in `src/types.ts`; use interfaces for structured records and component props, as in `src/components/TuningDetails.tsx`.
- Prefer the shared domain models in `src/types.ts` for setup, lap, favorite, and notification data. Some feature-specific/local shapes are still declared inline, such as `Message` in `src/components/RaceEngineerChat.tsx`.

## Code Style

**Formatting:**
- No dedicated formatter configuration is present. Match the prevailing TypeScript/TSX style: semicolons, double-quoted strings, trailing commas where appropriate, and two-space indentation, as in `src/App.tsx` and `src/components/CommunitySharing.tsx`.
- Keep JSX and feature logic in `.tsx` files under `src/components/`; the entry point is `src/main.tsx`.
- `vite.config.ts` uses a different compact import-brace style and single quotes. There is no formatter configured to normalize these differences.

**Linting:**
- The `lint` script in `package.json` runs `tsc --noEmit`; it is a TypeScript check, not a configured ESLint/style-lint run.
- No ESLint, Prettier, or Biome configuration is present. Compiler options are in `tsconfig.json`; do not assume `strict`/`noImplicitAny` is enabled because neither option is set there.

## Import Organization

**Order:**
1. External framework/library imports (for example, React and Firebase in `src/App.tsx`).
2. Project types, utilities, constants, and feature modules using relative imports (for example, `src/components/TuningDetails.tsx`).
3. Icon imports from `lucide-react`, commonly kept as a separate final group (for example, `src/App.tsx`).

Keep imports at the top of the module and use explicit named imports where used. Existing modules use relative paths such as `../types` and `../constants`.

**Path Aliases:**
- `@/*` is mapped to the repository root in `tsconfig.json`, and `@` is configured to the root in `vite.config.ts`.
- Existing application source primarily uses relative imports; follow that established pattern unless an alias improves a new cross-directory import.

## Error Handling

**Patterns:**
- Wrap asynchronous fetch/auth/export operations in `try`/`catch`/`finally`; clear loading flags in `finally`, as in `src/components/CommunitySharing.tsx` and `src/components/OAuthAndSync.tsx`.
- Check `response.ok` before consuming API success data and throw an `Error` with context for failed AI responses in `src/components/TuningDetails.tsx` and `src/components/RaceEngineerChat.tsx`.
- Report recoverable feature errors in component state for display to users, and log diagnostic details with `console.error`, as in `src/components/OAuthAndSync.tsx` and `src/components/TuningDetails.tsx`. Some user actions instead use `alert`, as in `src/App.tsx`.
- Follow the storage-read fallback pattern in `src/App.tsx`: catch parse/read failures and log them. When adding persistence, also consider guarding storage writes, which currently happen in separate effects without catches in `src/App.tsx`.
- Prefer `unknown` plus narrowing for new caught errors and API payloads. Existing code often types caught errors or response data as `any`, including `src/googleSync.ts`, `src/components/OAuthAndSync.tsx`, and `server.ts`.

## Logging

**Framework:** `console` (`console.error`).

**Patterns:**
- Log caught operational errors with context where available, as in `src/components/CommunitySharing.tsx` and `src/App.tsx`.
- Keep user-facing status separate from diagnostics: component state/messages report failures in `src/components/OAuthAndSync.tsx` and `src/components/TuningDetails.tsx`.

## Comments

**When to Comment:**
- Use short comments to explain domain decisions, section boundaries, and non-obvious browser/API behavior. Examples include the weather/drivetrain heuristic notes in `src/constants.ts` and the storage/auth section comments in `src/App.tsx` and `src/googleSync.ts`.

**JSDoc/TSDoc:**
- No consistent JSDoc/TSDoc convention is demonstrated. Use typed signatures and concise inline comments for domain-specific rationale, following `src/types.ts` and `src/constants.ts`.

## Function Design

**Size:** Keep new feature behavior in the relevant feature component, with application-level orchestration in `src/App.tsx`; this is the structure used by `src/components/CommunitySharing.tsx` and `src/components/LapTimeDashboard.tsx`.

**Parameters:** Use explicit prop interfaces for components and typed domain arguments, as in `src/components/SetupComparer.tsx` and `src/constants.ts`. Use `Omit` for callbacks that create records before server-owned fields exist, as in the save callback signature in `src/components/TuningDetails.tsx`.

**Return Values:** Use concrete return types for reusable helpers and async service functions when practical, as in `getBaselineTuning` in `src/constants.ts` and `exportSetupsToGoogleSheets` in `src/googleSync.ts`. React components return JSX; async UI handlers generally update state rather than return values.

## Module Design

**Exports:** Use a default export for each feature component (`src/components/CommunitySharing.tsx`); use named exports for shared models and utilities (`src/types.ts`, `src/constants.ts`, and `src/googleSync.ts`).

**Barrel Files:** No barrel-file pattern is present. Import feature modules and domain definitions directly from their source files.

**State and Persistence:**
- Keep cross-feature UI state and browser persistence in `src/App.tsx`; it parses values from `localStorage` into state declared with shared domain types and writes each list back from state-dependent effects. The stored JSON is not runtime-schema-validated there.
- Keep transient form, loading, and error state in the owning component, using typed React hooks as in `src/components/CommunitySharing.tsx` and `src/components/OAuthAndSync.tsx`.
- The Google access token/auth coordination is a module-level in-memory cache in `src/googleSync.ts`; do not treat it as durable browser persistence.
- The community API persists data to a JSON file under the server's `data/` directory through `server.ts`; keep client and server persistence choices consistent with their existing roles.

---

*Convention analysis: 2026-10-02*
