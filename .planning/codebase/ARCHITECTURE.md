<!-- refreshed: 2026-10-02 -->
# Architecture

**Analysis Date:** 2026-10-02

## System Overview

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         Browser SPA (React)                          │
│ `index.html` → `src/main.tsx` → `src/App.tsx`                        │
│ Tab views: Garage · Comparer · Laps · Community · Race Engineer      │
└──────────────────────┬─────────────────────┬───────────────────────┘
                       │ props/callbacks      │ HTTP fetch
                       ▼                      ▼
┌─────────────────────────────┐   ┌──────────────────────────────────┐
│ Feature components          │   │ Express application              │
│ `src/components/`           │   │ `server.ts`                      │
│ `TuningDetails`, chat, etc.  │   │ AI + community JSON endpoints    │
└──────────────┬──────────────┘   └──────────┬──────────────┬────────┘
               │                              │              │
               ▼                              ▼              ▼
┌────────────────────────────┐  ┌───────────────────┐  ┌────────────────┐
│ Browser state and storage  │  │ `data/` JSON file │  │ Gemini/NVIDIA  │
│ `App.tsx`, localStorage    │  │ community setups  │  │ APIs + Search  │
└────────────────────────────┘  └───────────────────┘  └────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Google identity and Sheets API, called directly by browser code      │
│ `src/googleSync.ts` ← `src/components/OAuthAndSync.tsx`               │
└──────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| React bootstrap | Mounts the root component in `#root` and loads global CSS | `src/main.tsx` |
| App controller | Owns tab selection, saved entities, persistence effects, handlers, and feature composition | `src/App.tsx` |
| Tuning editor | Creates/edits tuning settings, applies baseline values, and requests AI setup generation | `src/components/TuningDetails.tsx` |
| Comparison view | Presents comparisons over setup objects supplied by the root | `src/components/SetupComparer.tsx` |
| Lap dashboard | Captures and visualizes lap logs, reporting new entries through a callback | `src/components/LapTimeDashboard.tsx` |
| Community view | Loads/filters community setups and exposes sharing, liking, favorites, and notification UI | `src/components/CommunitySharing.tsx` |
| Race Engineer chat | Maintains chat input/mode UI and submits prompts to the backend | `src/components/RaceEngineerChat.tsx` |
| Google sign-in/export view | Connects Firebase-authenticated Google account state and exports local setups | `src/components/OAuthAndSync.tsx` |
| Google client integration | Initializes Firebase Auth, caches a Google access token, and writes setup rows to Sheets | `src/googleSync.ts` |
| Express server | Serves the SPA and implements AI-generation and community APIs with JSON-file persistence | `server.ts` |
| Domain catalog | Declares shared setup/lap/favorite/notification types and car/track/baseline data | `src/types.ts`, `src/constants.ts` |

## Pattern Overview

**Overall:** Single-page React application with a root-controller/component architecture and a colocated Express API server.

**Key Characteristics:**
- `src/App.tsx` is the composition root and authoritative owner of cross-tab data; feature components receive data and callbacks as props.
- The UI uses conditional tab rendering rather than route-based pages (`src/App.tsx:480-760`); `index.html` loads one React entry point.
- Persistence is split by purpose: user-facing collections and chat use browser `localStorage` (`src/App.tsx:218-258`), while shared community builds use a server-side JSON file (`server.ts:26-53`).
- AI calls use server endpoints so provider credentials and prompt construction remain in `server.ts`; Google Sheets export instead runs in browser code with a Google OAuth access token (`src/googleSync.ts`).

## Layers

**Browser bootstrap and shell:**
- Purpose: Start the SPA and establish its top-level layout.
- Location: `index.html`, `src/main.tsx`, `src/App.tsx`
- Contains: Root element hookup, global stylesheet import, navigation tabs, root state, and page composition.
- Depends on: React, feature components, and domain types/catalogs.
- Used by: The browser entry document.

**Feature UI:**
- Purpose: Implement each focused user workflow.
- Location: `src/components/`
- Contains: Controlled forms, local component UI state, charts, chat UI, and feature-specific API calls.
- Depends on: Root props/callbacks, `src/types.ts`, `src/constants.ts`, and where needed backend/browser integration modules.
- Used by: `src/App.tsx`.

**Domain model and static data:**
- Purpose: Share data shapes and GT7-specific reference data.
- Location: `src/types.ts`, `src/constants.ts`
- Contains: Setup and tuning types, lap/favorite/notification records, car presets, tracks, baseline rules, and AI model choices.
- Depends on: No application layer.
- Used by: `src/App.tsx`, feature components, and `src/googleSync.ts`.

**Server/API:**
- Purpose: Handle server-only model requests, community operations, and serve the frontend.
- Location: `server.ts`
- Contains: Express middleware and routes, AI-provider requests, in-process helpers for community JSON storage, and Vite/production static serving.
- Depends on: Environment configuration, filesystem, Google GenAI SDK, NVIDIA endpoint, and Vite in development.
- Used by: Browser `fetch` calls to `/api/...` and the application runtime.

**Browser cloud integration:**
- Purpose: Authenticate a Google user and export local setup data to Sheets.
- Location: `src/googleSync.ts`
- Contains: Firebase app/Auth initialization, Google OAuth scopes, in-memory access-token cache, and direct Sheets REST requests.
- Depends on: Firebase configuration and Google APIs.
- Used by: `src/components/OAuthAndSync.tsx`.

## Data Flow

### Primary Request Path

1. `index.html` provides `#root` and loads `src/main.tsx`.
2. `src/main.tsx` mounts `<App />`; the root initializes tab and data state in `src/App.tsx:183-218`.
3. The root renders the selected view, passing current data and event callbacks to feature components (for example, `src/App.tsx:571-760`).
4. A feature emits user changes through a callback; root handlers update React state (setup save at `src/App.tsx:297-320`, lap save at `src/App.tsx:327-365`).
5. `useEffect` handlers serialize setup, lap, favorite, notification, and chat state to `localStorage` (`src/App.tsx:222-258`).

### AI Tuning and Chat

1. `src/components/TuningDetails.tsx` posts setup context to `/api/nvidia/generate-setup` or `/api/nvidia/agent-team-simulation`; `src/components/RaceEngineerChat.tsx` posts chat/history and optional vehicle context to `/api/gemini/generate`.
2. The corresponding handlers in `server.ts:137-278`, `server.ts:348-479`, and `server.ts:481-631` build provider prompts and call Gemini or NVIDIA; setup-generation routes also obtain Google Search-grounded findings.
3. The server returns generated text or tuning data; the component places successful tuning data into its editor state, which is then saved through the root callback (`src/components/TuningDetails.tsx:124-215`, `src/components/TuningDetails.tsx:390-404`).

### Community Sharing

1. `src/components/CommunitySharing.tsx` fetches `/api/community/setups` and posts likes to `/api/community/setups/:id/like`.
2. `src/App.tsx:398-426` posts a selected local setup to `/api/community/setups`; importing a result creates a new local setup in `src/App.tsx:385-396`.
3. `server.ts:34-53` reads/writes `data/community_setups.json`; route handlers at `server.ts:633-698` list, add, and increment likes.
4. When favorites exist, `src/App.tsx:262-295` polls the community list every 15 seconds and adds unseen matching models to notification state.

### Google Export

1. `src/components/OAuthAndSync.tsx` invokes `initAuth` and `googleSignIn` from `src/googleSync.ts`.
2. The component passes the authenticated user/token to `src/App.tsx`; setup data remains the root's local list.
3. Export invokes `exportSetupsToGoogleSheets` in `src/googleSync.ts`, which directly creates a spreadsheet and writes setup rows through the Google Sheets REST API.

**State Management:**
- Cross-view application data is React state in `src/App.tsx`, persisted locally in browser `localStorage`.
- View-specific transient form/loading/filter state is kept in feature components, e.g. `src/components/TuningDetails.tsx`, `src/components/CommunitySharing.tsx`, and `src/components/RaceEngineerChat.tsx`.
- Community data is read and written server-side as a JSON array; no database layer is present in `server.ts`.
- Firebase Auth and the Google access token are module-level state in `src/googleSync.ts`; the token cache is in memory.

## Key Abstractions

**`TuningSetup` / `TuningParams`:**
- Purpose: Canonical typed record for a user's or community's car setup.
- Examples: `src/types.ts`, consumed by `src/App.tsx`, `src/components/TuningDetails.tsx`, and `src/googleSync.ts`.
- Pattern: Pass typed setup records through component props and callback payloads; use `TuningParams` for the nested tune values.

**Root-owned feature state and callbacks:**
- Purpose: Keep saved setup/lap/community UI state synchronized across tabs.
- Examples: `src/App.tsx:183-218`, `src/App.tsx:297-426`.
- Pattern: Feature components receive the current collection plus explicit callbacks rather than owning a duplicate copy of persistent cross-view data.

**Server JSON persistence helpers:**
- Purpose: Centralize loading and saving community data.
- Examples: `getCommunitySetups` and `saveCommunitySetups` in `server.ts:34-53`.
- Pattern: Community route handlers call these helpers rather than writing the JSON file separately.

## Entry Points

**Browser entry point:**
- Location: `index.html`, `src/main.tsx`
- Triggers: Browser load of the SPA document.
- Responsibilities: Provide React mount point; import CSS and render the root component.

**Application entry point:**
- Location: `src/App.tsx`
- Triggers: Rendered by `src/main.tsx`.
- Responsibilities: Own primary state, navigation, cross-feature handlers, and conditional feature rendering.

**Server entry point:**
- Location: `server.ts`
- Triggers: `npm run dev` runs `tsx server.ts`; `npm run start` runs the built server bundle.
- Responsibilities: Initialize Express and environment config, register APIs, attach Vite middleware in development or static `dist` serving in production, then listen on port 3000.

## Architectural Constraints

- **Threading:** The backend is a single Node.js Express process using asynchronous request handlers; community file reads/writes use synchronous filesystem calls in `server.ts:34-53`.
- **Global state:** Firebase app/Auth, `isSigningIn`, and cached OAuth token are module-scoped in `src/googleSync.ts`; server community state is re-read from a process-relative JSON file rather than kept in a shared database.
- **Circular imports:** No circular imports are apparent in the inspected source graph; dependencies flow from `src/main.tsx` to `src/App.tsx`, then to components and shared modules.
- **API contract:** The browser uses same-origin relative `/api/...` URLs in `src/components/TuningDetails.tsx`, `src/components/RaceEngineerChat.tsx`, `src/components/CommunitySharing.tsx`, and `src/App.tsx`; keep server routes in `server.ts` aligned with these callers.
- **Persistence boundaries:** User-local state belongs to browser `localStorage`; the server-side `data/community_setups.json` only stores shared community setups.
- **Server serving mode:** `server.ts:700-722` attaches Vite middleware when not in production and serves `dist` plus SPA fallback in production.

## Anti-Patterns

### Duplicating Root-Owned Persistent State in Feature Views

**What happens:** Persistent setups, lap logs, favorites, notifications, and chat are stored and synchronized by `src/App.tsx:183-258`; children receive them as props.
**Why it's wrong:** A second independent collection in a child can drift from the root's state and the associated localStorage effects.
**Do this instead:** Keep canonical cross-tab records in `src/App.tsx`, pass them into the relevant `src/components/*.tsx` view, and report updates through callbacks as existing props do.

### Calling AI Providers Directly from Browser Features

**What happens:** Browser AI features call same-origin `/api/gemini/...` or `/api/nvidia/...` endpoints; provider request construction is in `server.ts`.
**Why it's wrong:** A direct client-side provider call would expose server credentials and fork prompt/model logic from the backend handlers.
**Do this instead:** Add or extend a typed same-origin API route in `server.ts` and call it from the feature component, following `src/components/RaceEngineerChat.tsx` and `src/components/TuningDetails.tsx`.

## Error Handling

**Strategy:** Route-level `try/catch` converts backend exceptions into JSON error responses; frontend components catch failed requests and show local error state or fallback messages.

**Patterns:**
- AI routes log provider failures and return HTTP 500 JSON errors (`server.ts:273-278`, `server.ts:470-479`).
- Community routes catch filesystem/runtime errors and return 500 JSON; missing/invalid input and missing IDs return 400/404 (`server.ts:633-698`).
- Chat and AI tuning UI check `response.ok`, parse error payloads where provided, and display failure text in component state (`src/components/RaceEngineerChat.tsx:55-91`, `src/components/TuningDetails.tsx:124-215`).
- Local-storage hydration is wrapped in `try/catch` in `src/App.tsx:222-239`; effects write serialized values separately (`src/App.tsx:241-258`).

## Cross-Cutting Concerns

**Logging:** Backend uses `console.error`, `console.warn`, and `console.log` in `server.ts`; frontend components log caught errors via `console.error`.
**Validation:** Community POST performs required-field checks in `server.ts:642-647`; AI routes destructure request bodies and rely on provider/response handling rather than a shared schema layer.
**Authentication:** Firebase Google sign-in and Sheets OAuth are browser-side in `src/googleSync.ts`; community and AI Express endpoints do not show authentication middleware in `server.ts`.

---

*Architecture analysis: 2026-10-02*
