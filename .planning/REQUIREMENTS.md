# Requirements

## Functional Requirements
1. Users can manage GT7 tuning setups for selected cars and tracks.
2. Users can compare different tuning setups side by side.
3. Users can log lap times and track performance trends.
4. Users can browse and share community-created setups.
5. Users can ask an AI race engineer for setup advice based on symptoms and current tuning, using a configured Gemini, OpenAI, OpenRouter, or NVIDIA provider.
6. The app supports local persistence for setups, favorites, lap logs, and chat history.

## Non-Functional Requirements
1. The app must remain type-safe under the repository TypeScript configuration.
2. The app must build with the current Vite + React + Express stack.
3. The setup domain must use established GT7 tuning names and units.
4. The backend must gracefully handle missing or invalid provider keys and malformed data.
5. The design should remain lightweight and single-page to match the existing architecture.
6. AI provider availability must be visible, provider choice must be explicit or automatically selected from configured keys, and search grounding must only be advertised when it is actually available.

## Constraints
- Keep changes aligned with the current `src/App.tsx`, `src/types.ts`, `src/constants.ts`, and `server.ts` patterns.
- Favor minimal changes over new service architecture unless a clear need is demonstrated.
- Preserve the light-weight JSON persistence model unless a durable storage requirement is explicitly added.
