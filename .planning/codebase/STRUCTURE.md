# Codebase Structure

**Analysis Date:** 2026-10-02

## Directory Layout

```text
madziaar-friendly-telegram/
├── .github/
│   └── copilot-instructions.md   # Repository development and architecture notes
├── .planning/
│   └── codebase/                 # Generated codebase maps
├── .vscode/
│   └── mcp.json                  # Local MCP tooling configuration
├── assets/
│   └── .aistudio                 # AI Studio marker/config artifact
├── src/
│   ├── components/               # Feature-level React views
│   ├── App.tsx                   # SPA shell and application state/controller
│   ├── constants.ts              # Tracks, car presets, baseline tuning, model catalog
│   ├── googleSync.ts             # Firebase auth and Google Sheets export
│   ├── index.css                 # Global styles
│   ├── main.tsx                  # Browser React bootstrap
│   └── types.ts                  # Shared domain contracts
├── .env.example                  # Environment-variable template (contents not inspected)
├── firebase-applet-config.json  # Firebase app configuration
├── index.html                    # SPA document and root mount point
├── metadata.json                 # AI Studio app metadata
├── package.json                  # Scripts and package manifest
├── server.ts                     # Express API and dev/production serving
├── tsconfig.json                 # TypeScript compiler settings
└── vite.config.ts                # Vite, React, Tailwind, and alias configuration
```

## Directory Purposes

**`src/`:**
- Purpose: Browser application source.
- Contains: Root React controller, domain/catalog modules, global CSS, and browser integration.
- Key files: `src/App.tsx`, `src/main.tsx`, `src/types.ts`, `src/constants.ts`, `src/googleSync.ts`.

**`src/components/`:**
- Purpose: Feature-oriented UI modules composed by `src/App.tsx`.
- Contains: `CommunitySharing.tsx`, `LapTimeDashboard.tsx`, `OAuthAndSync.tsx`, `RaceEngineerChat.tsx`, `SetupComparer.tsx`, and `TuningDetails.tsx`.
- Key files: `src/components/TuningDetails.tsx` for setup authoring and AI generation; `src/components/CommunitySharing.tsx` for community browsing/sharing; `src/components/RaceEngineerChat.tsx` for chat API calls.

**`assets/`:**
- Purpose: Project artifact storage.
- Contains: `.aistudio` marker in the inspected worktree; no app source files were found.
- Key files: `assets/.aistudio`.

**`.github/`:**
- Purpose: Repository-hosted assistant guidance.
- Contains: `copilot-instructions.md` describing development commands and architectural conventions.
- Key files: `.github/copilot-instructions.md`.

**`.vscode/`:**
- Purpose: Editor and local tool configuration.
- Contains: `mcp.json`.
- Key files: `.vscode/mcp.json`.

**`.planning/codebase/`:**
- Purpose: GSD-generated architecture and structure references for future planning/execution.
- Contains: `ARCHITECTURE.md` and `STRUCTURE.md` from this mapping.
- Key files: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`.

## Key File Locations

**Entry Points:**
- `index.html`: Browser document, `#root` mount element, and module script for `/src/main.tsx`.
- `src/main.tsx`: Imports global CSS and mounts `<App />` with React `createRoot`.
- `src/App.tsx`: Root feature controller, state owner, navigation, and page composition.
- `server.ts`: Express application entry point, API routes, and SPA server setup.

**Configuration:**
- `package.json`: npm scripts and dependency manifest.
- `vite.config.ts`: React/Tailwind plugins, `@` alias, and HMR behavior.
- `tsconfig.json`: TypeScript/JSX/module and `@/*` path alias configuration.
- `.env.example`: Environment template; do not copy secret values into source.
- `firebase-applet-config.json`: Firebase client configuration imported by `src/googleSync.ts`.

**Core Logic:**
- `src/types.ts`: Shared setup, tuning, lap-log, favorite, and notification types.
- `src/constants.ts`: Tracks, car presets, baseline tuning generation, and model catalog.
- `src/App.tsx`: Cross-feature state transitions and top-level workflows.
- `src/googleSync.ts`: Firebase authentication and Google Sheets REST export.
- `server.ts`: AI routes, community JSON persistence, and static/dev server selection.

**Testing:**
- No test directory or test files are present in the inspected source tree.
- `package.json` defines `npm run lint` as TypeScript type-checking; there is no configured test runner.

## Naming Conventions

**Files:**
- React feature components use PascalCase `.tsx`, e.g. `src/components/LapTimeDashboard.tsx`.
- Shared non-component modules use lower camel/camel words in `.ts`, e.g. `src/googleSync.ts`, `src/constants.ts`.
- Root application and server entry points are named `App.tsx`, `main.tsx`, and `server.ts`.

**Directories:**
- Feature UI is grouped under the lowercase plural `src/components/`.
- Root-level runtime/configuration files stay at repository root, including `server.ts`, `vite.config.ts`, and `tsconfig.json`.

## Where to Add New Code

**New Feature:**
- Primary code: Add a feature view under `src/components/`, then compose it and wire durable cross-view data/callbacks in `src/App.tsx`.
- Tests: No test location or runner is established; for current validation use `npm run lint` as declared in `package.json`.

**New Component/Module:**
- Implementation: Feature UI belongs in `src/components/<FeatureName>.tsx`; shared data shapes belong in `src/types.ts`; shared track/car/tuning reference data belongs in `src/constants.ts`.
- Backend API behavior belongs in `server.ts`, which is the current route registry and server bootstrap.

**Utilities:**
- Shared domain helpers/data: `src/constants.ts` for domain-specific catalogs and baseline tuning functions.
- Browser cloud integration: `src/googleSync.ts`.
- Backend persistence/provider helpers: Keep server-side helpers with the related API logic in `server.ts` unless there is a deliberate module boundary.
- Styling: Global styles in `src/index.css`; component-specific composition/styling remains with the feature `.tsx` files.

## Special Directories

**`dist/`:**
- Purpose: Production frontend build output served by `server.ts`.
- Generated: Yes, by `npm run build` / Vite.
- Committed: Excluded by `.gitignore`.

**`data/`:**
- Purpose: Runtime community setup persistence in `data/community_setups.json`, initialized and seeded by `server.ts:26-53`.
- Generated: Yes, server startup creates it when absent.
- Committed: Not present in the inspected worktree; `.gitignore` does not explicitly list `data/`.

**`node_modules/`:**
- Purpose: Installed JavaScript dependencies.
- Generated: Yes, by npm install.
- Committed: Excluded by `.gitignore`.

**`.planning/codebase/`:**
- Purpose: GSD planning references.
- Generated: Yes, by codebase mapping.
- Committed: Not inferred from current ignore configuration.

---

*Structure analysis: 2026-10-02*
