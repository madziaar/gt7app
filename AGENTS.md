# AGENTS.md

GT7 car-setup helper. React 19 + Vite frontend served **by** an Express server, plus Gemini and
NVIDIA AI endpoints. Deployed as a Google AI Studio applet (Cloud Run).

## Commands

```bash
npm install
npm run dev     # Express on http://localhost:3000, Vite mounted as middleware
npm run lint    # tsc --noEmit — the ONLY check in this repo
npm run build   # vite build + esbuild -> dist/ (client) and dist/server.cjs
npm run start   # node dist/server.cjs
npm run clean   # rm -rf dist server.js
```

- **Port is hardcoded to 3000** (`server.ts:11`), no env override. `npm run dev` is
  `tsx server.ts`, *not* a Vite CLI server. The README's "typically http://localhost:5173" is
  wrong; there is no `vite` script. Set `DISABLE_HMR=true` to disable HMR/file watching.
- `npm run start` does **not** set `NODE_ENV=production`. The server branches on
  `process.env.NODE_ENV !== "production"` (`server.ts:797`), so a bare `npm start` boots the Vite
  dev middleware instead of serving `dist/`. Use `NODE_ENV=production npm start`.
- **No test runner, no CI, no formatter, no pre-commit hooks.** Don't invent a harness or claim
  tests pass.

## Verification limits

`npm run lint` passes, but `tsconfig.json` has **no `strict`** and no `include` (so it does cover
`server.ts` and `vite.config.ts` alongside `src/`). It will not catch null/undefined handling,
`any` misuse, or runtime behavior. Treat it as a compile gate, not a correctness gate — verify UI
and API changes by running the server.

## Environment

- The server calls `dotenv.config()` with no path, so it reads **`.env` only**. README's
  `cp .env.example .env.local` does nothing for `server.ts`. Put secrets in `.env`.
- `GEMINI_API_KEY` falls back to `"dummy-key"`, so the server boots without it and only AI calls
  fail. All three `/api/nvidia/*` endpoints return 400 without `NVIDIA_API_KEY`.
- `APP_URL` is documented in `.env.example` and the README but is **never read by any source
  file**. Don't wire features to it.
- `firebase-applet-config.json` is committed on purpose — it's public client config, and
  `src/googleSync.ts` initializes Firebase at module import. Google sign-in uses `signInWithPopup`,
  so local origins must be authorized in that Firebase project or the popup will fail.

## The tuning param contract is duplicated — check all of these

The 22 `TuningParams` keys are hand-written out in five places. Changing or adding one means
editing every one:

1. `src/types.ts` — `TuningParams` interface
2. `src/constants.ts` — `getBaselineTuning()` (values are branched by `carClass`,
   `drivetrain`, `weather`) and `CAR_PRESETS`
3. `server.ts` — `COMMUNITY_TUNING_KEYS` allowlist, plus the key/range lists inside the
   `/api/nvidia/*` prompt strings
4. `src/components/TuningDetails.tsx` — 23 inline `<input type="range">` elements with literal
   `min`/`max` attributes
5. `src/googleSync.ts` — the Google Sheets header array and row order (positional)

`normalizeTuning()` **silently drops** any key not in `COMMUNITY_TUNING_KEYS`, so a new param
that isn't added there will disappear from community setups with no error.

## AI endpoints

- LLM responses that must be JSON go through a hand-rolled recovery path: strip ```` ```json ````
  fences, slice from first `{` to last `}`, then `sanitizeJsonString()` to escape raw control
  characters inside strings before `JSON.parse`. Reuse all of it for any new JSON-returning
  endpoint — the sanitizer exists because these models really do emit literal newlines in JSON.
- Gemini model IDs are hardcoded per `mode` in `/api/gemini/generate` (`gemini-3.5-flash`,
  `gemini-3.1-pro-preview` for thinking).
- `mapNvidiaModel()` in `server.ts` maps UI model IDs to real NIM IDs by **substring matching** and
  silently falls back to `meta/llama-3.1-70b-instruct`. `NVIDIA_MODELS` in `src/constants.ts`
  already holds the real NIM IDs, so a new model needs a matching branch in `mapNvidiaModel()` or
  it will quietly run as Llama 70B.
- `/api/nvidia/*` calls `getSearchFindings()` first, which spends a Google-Search-grounded Gemini
  call per request before the NVIDIA call.

## State and data

- All client state lives in `src/App.tsx`; five `localStorage` keys (`gt7_tuning_setups`,
  `gt7_lap_logs`, `gt7_favorite_cars`, `gt7_notifications`, `gt7_engineer_chat`). Single-page,
  tab-based, no router — add tabs, don't add routing.
- `data/community_setups.json` is **created and seeded at runtime** by `server.ts` on boot and is
  **not in `.gitignore`**, so it shows up as untracked after running the server. Don't commit it.
- Frontend calls APIs with relative paths (`/api/...`); there is no base URL config.

## Other

- `@/*` maps to the repo root and must be kept in sync in both `tsconfig.json` `paths` and the
  `vite.config.ts` alias.
- `index.html`, `metadata.json`, `firebase-applet-config.json`, and `assets/.aistudio/` follow AI
  Studio applet conventions. `server.ts` is the real entry point.
- No Playwright/MCP config is committed — `.vscode/` is gitignored and `.vscode/mcp.json` referenced
  by `.github/copilot-instructions.md` does not exist. Set up browser automation yourself if needed.
- `.planning/codebase/` holds generated architecture notes; `.planning/STATE.md` currently records
  no active workflow.