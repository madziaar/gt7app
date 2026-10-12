# Project State

## Status
Phase 2 complete - Multi-provider race engineer added and verified on 2026-10-02.

## Summary
The repository contains a GT7 tuning helper app with a React frontend, Express backend, community JSON storage, and AI chat/setup guidance through Gemini, OpenAI, OpenRouter, and NVIDIA endpoints. Environment and build baseline have been verified.

## Important Context
- Core app logic is distributed across `src/App.tsx`, `src/components/*`, `server.ts`, `src/types.ts`, and `src/constants.ts`.
- The app uses browser-local persistence and JSON file-backed community data.
- Build and lint checks (`npm run lint` and `npm run build`) pass cleanly.
- Chat provider selection is explicit (Auto/Gemini/OpenAI/OpenRouter); Auto prefers Gemini, then OpenAI, then OpenRouter.
- Gemini Google Search grounding is the only provider currently wired for live web search; NVIDIA remains a separate diagnostic mode.
- The OpenAI SDK requires Node.js 22 or newer.

## Completed Work
- Phase 1 established project goals, requirements, architecture notes, and the implementation roadmap.
- Phase 2 added selectable AI providers, provider availability reporting, provider-aware errors, and deployment documentation.
- Phase 2 verification passed: `npm run lint`, `npm run build`, and local API smoke tests for status, missing keys, unsupported providers, Gemini-only search, and NVIDIA missing-key behavior. Smoke tests used dummy/empty keys and made no external AI calls.

## Next Upgrade Candidates
- Add an automated backend regression test harness for provider routing, community persistence corruption, and malformed AI output.
- Add provider request quotas and abuse controls before exposing paid AI endpoints publicly.
- Bound and disclose retained chat history, with clear deletion/retention controls.
- Paginate community setup reads and avoid synchronous whole-file I/O as the dataset grows.
