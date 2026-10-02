# External Integrations

**Analysis Date:** 2026-10-02

## APIs & External Services

**Generative AI:**
- Google Gemini API - Chat replies, model reasoning mode, and Google Search grounding; configured via `GEMINI_API_KEY`.
  - SDK/Client: `@google/genai` `^2.4.0`, initialized in `server.ts`.
  - Auth: `GEMINI_API_KEY` read by `server.ts`; missing key falls back to a placeholder string, not a valid credential.
  - Contract: `POST /api/gemini/generate` accepts chat/context fields (`message`, `history`, `mode`, `carModel`, `track`, `currentTuning`, `nvidiaModel`) and returns `{ text }`. Standard mode uses a Gemini Flash model; `thinking` selects a Pro preview model; `search` enables Google Search grounding. For `mode: "nvidia"`, this route instead calls NVIDIA NIM.
  - Search-grounded tuning helpers call Gemini with the `googleSearch` tool from NVIDIA setup/simulation endpoints (`server.ts`).

**Generative AI / NVIDIA:**
- NVIDIA NIM chat completions - Chat in NVIDIA mode, setup generation, and team simulation (`server.ts`).
  - SDK/Client: Direct `fetch` to `https://integrate.api.nvidia.com/v1/chat/completions`; no NVIDIA SDK is declared.
  - Auth: `NVIDIA_API_KEY`, sent as a bearer credential; endpoints return HTTP 400 when it is absent.
  - Contract: Requests use the OpenAI-compatible shape `{ model, messages, temperature, top_p, max_tokens, stream }`; responses are read from `choices[0].message`. The model ID is normalized by `mapNvidiaModel` in `server.ts`.
  - App routes: `POST /api/nvidia/generate-setup` takes car/track/weather/focus/model fields and responds with generated analysis/tuning; `POST /api/nvidia/agent-team-simulation` takes vehicle, telemetry, active-agent, and model fields and responds with conclusions, analysis, tuning, reasoning, and search findings. Exact validation beyond the visible route logic is not established.

**Google identity and productivity APIs:**
- Firebase Authentication with Google sign-in - Provides the user's Google identity and OAuth access token (`src/googleSync.ts`, `src/components/OAuthAndSync.tsx`).
  - SDK/Client: `firebase/app` and `firebase/auth` from `firebase` `^12.16.0`.
  - Auth: Firebase config imported from `firebase-applet-config.json` (values not inspected); `GoogleAuthProvider` requests Google Drive `drive.file` and Google Sheets scopes.
- Google Sheets API - Creates a spreadsheet and writes setup rows directly from the browser (`src/googleSync.ts`).
  - SDK/Client: Direct browser `fetch` to `https://sheets.googleapis.com/v4/spreadsheets` (POST) and `/v4/spreadsheets/{spreadsheetId}/values/Sheet1!A1:AD{rows.length}` (PUT, `valueInputOption=USER_ENTERED`).
  - Auth: Google OAuth access token obtained through Firebase sign-in, sent in the authorization header.
  - Contract: Export accepts a non-empty `TuningSetup[]`, creates a new spreadsheet titled by the optional name, writes headers plus setup rows, then returns `{ spreadsheetId, spreadsheetUrl }`. No spreadsheet export happens through the Express server.
- Google Drive API: No direct Drive API call was detected; the implemented export uses the Sheets API to create a spreadsheet. UI copy describes Drive backup/sync, but no separate Drive synchronization implementation was detected.

## Data Storage

**Databases:**
- No database engine or managed database integration was detected.

**File Storage:**
- Community setups are stored as JSON in `data/community_setups.json`, created relative to the server's current working directory (`server.ts`). The server seeds the file with sample setups when it is empty and rewrites it for share/like updates.
- No external object/file storage integration was detected beyond the Google Sheets export described above.

**Caching:**
- No external cache detected. In-memory app state includes the Google OAuth access token in `src/googleSync.ts`.

**Browser persistence:**
- `src/App.tsx` stores setups, lap logs, favorites, notifications, and chat messages in browser `localStorage` under `gt7_*` keys.

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication with Google as the provider (`src/googleSync.ts`).
  - Implementation: `signInWithPopup` requests Google OAuth scopes for `drive.file` and `spreadsheets`; the resulting access token is held in a module-level variable and passed to the client UI.
  - No server-side session/token verification middleware was detected in `server.ts`. Community API routes are not shown as requiring authentication.

## Monitoring & Observability

**Error Tracking:**
- Not detected.

**Logs:**
- `console.log`, `console.warn`, and `console.error` in `server.ts` and client components; no structured logging service detected.

## CI/CD & Deployment

**Hosting:**
- Unknown. `README.md` says the app is designed for Google AI Studio and can be deployed to Cloud Run, but no active deployment config was detected.

**CI Pipeline:**
- Not detected in the inspected repository files. `.github/` contains `copilot-instructions.md`; no workflow file was present in that directory listing.

## Environment Configuration

**Required env vars:**
- `GEMINI_API_KEY` - Used by the server-side Gemini client (`server.ts`).
- `NVIDIA_API_KEY` - Required for NVIDIA chat/setup/simulation calls (`server.ts`).
- `NODE_ENV` - Selects Vite middleware vs. production static asset serving (`server.ts`).
- `DISABLE_HMR` - Controls Vite HMR and file watching (`vite.config.ts`).
- `APP_URL` is mentioned as optional in `README.md`; no source usage was detected.
- Firebase client configuration is imported from `firebase-applet-config.json`; configuration values were not inspected.

**Secrets location:**
- Runtime credentials are read from environment variables. `README.md` recommends `.env.local` for local setup and deployment secrets for hosting; `.env.example` exists but was not inspected. Since `server.ts` uses default `dotenv.config()` without a custom path, loading `.env.local` is not established by the inspected code.

## Webhooks & Callbacks

**Incoming:**
- No webhook callback endpoint detected. The Express API is local-app-facing (`/api/gemini/*`, `/api/nvidia/*`, `/api/community/*`) in `server.ts`.

**Outgoing:**
- No webhook delivery detected. Outbound calls are Gemini SDK requests, NVIDIA NIM chat completions, Google Sheets API calls, and Google Search grounding (`server.ts`, `src/googleSync.ts`).

## Application API Contracts

- `GET /api/community/setups` returns the stored setup array; the UI consumes it in `src/components/CommunitySharing.tsx` and `src/App.tsx`.
- `POST /api/community/setups` accepts a setup JSON object, requires `carModel`, `track`, and `tuning`, then returns the created object with a generated `id`, zero likes, and timestamp (`server.ts`). The client posts the selected setup and creator/description metadata from `src/App.tsx`.
- `POST /api/community/setups/:id/like` increments and returns the matching setup; returns 404 when the ID is absent (`server.ts`).
- Community routes use filesystem persistence rather than remote community hosting. No authentication check is visible in these route handlers (`server.ts`).

---

*Integration audit: 2026-10-02*
