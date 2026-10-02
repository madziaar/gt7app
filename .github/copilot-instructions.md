# Copilot instructions for GT7 Tuning Helper

## Build, test, and lint commands

This repo is a Vite + React frontend with an Express server. The authoritative scripts are in `package.json`:

- Install dependencies: `npm install`
- Start the app in dev mode: `npm run dev`
- Build the app for production: `npm run build`
- Run the TypeScript check: `npm run lint`
- Start the built server: `npm run start`

There is no dedicated test runner configured in this repository. For quick validation, use the project type-check script: `npm run lint`. If you need a one-off compile check for a specific file or change, run `npx tsc --noEmit` from the repo root.

## High-level architecture

- `server.ts` is the backend entry point. It initializes the Express app, handles JSON persistence under `data/`, and exposes AI endpoints for Gemini and NVIDIA-backed tuning generation. It also proxies the app's server-side logic used by the frontend.
- `src/App.tsx` is the main application controller. It owns the tabbed UI, persistent state, chat state, localStorage sync, and cross-component orchestration for garage, comparer, laps, community, and engineer views.
- `src/types.ts` defines the core domain models: tuning parameters, setup objects, lap logs, favorites, and notification payloads. Keep model additions here instead of creating ad hoc inline shapes.
- `src/constants.ts` is the central data catalog for tracks, car presets, and baseline tuning heuristics. New cars or tracks should usually be added here.
- `src/components/` contains feature modules such as `RaceEngineerChat`, `SetupComparer`, `TuningDetails`, `CommunitySharing`, `LapTimeDashboard`, and `OAuthAndSync`. The app is organized by feature rather than route-based pages.
- Runtime secrets are expected in `.env.local`, following `.env.example` (`GEMINI_API_KEY`, `NVIDIA_API_KEY`, and optional `APP_URL`).

## Key conventions

- This app stores user-facing app state in `localStorage` in `App.tsx`; avoid introducing separate persistence systems unless the feature clearly requires one.
- Keep the frontend and backend contracts explicit. When adding API payloads, prefer typed objects and avoid silently accepting loosely typed request bodies.
- GT7 tuning values are domain-specific. Follow the established naming and units from `src/types.ts` and `src/constants.ts` (`frontDownforce`, `rearNF`, `frontARB`, `brakeBalance`, etc.).
- Community and AI features rely on seeded demo data and JSON files under `data/`, not a database. Preserve this lightweight persistence model for new features unless a larger data architecture is explicitly required.
- Styling and UI composition are component-driven, with the React state concentrated in `App.tsx`; keep feature logic near the relevant component and avoid scattering unrelated concerns through the app.
- The app has no dedicated unit-test setup. If adding automated checks, prefer a focused TypeScript or frontend validation flow that matches the existing Vite/React stack rather than inventing a parallel test harness.

## Repository-specific notes

- Prefer existing feature modules over creating new top-level structures unless the feature is clearly unrelated.
- When editing tuning logic, check both `src/constants.ts` and the relevant AI prompt logic in `server.ts`; the app's tuning heuristics and AI guidance are intentionally aligned.
- The frontend is intentionally a single-page experience; new screens should fit the tab-oriented architecture rather than introducing a router unless the feature truly requires a full navigation flow.

## MCP servers

This repo is a browser-based Vite/React app, so Playwright is the most relevant MCP server for UI validation and end-to-end checks. The configuration lives in `.vscode/mcp.json` and uses `npx -y @playwright/mcp@latest`.

If browser automation will be used locally, install the browser runtime once with `npx playwright install --with-deps chromium` before running UI-driven checks.
