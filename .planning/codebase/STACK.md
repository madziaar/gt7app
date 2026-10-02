# Technology Stack

**Analysis Date:** 2026-10-02

## Languages

**Primary:**
- TypeScript - Browser UI and Express server; source files are under `src/` and `server.ts`.

**Secondary:**
- CSS - Global styles in `src/index.css`, with Tailwind utility classes in TSX components.
- HTML - Vite document shell in `index.html`.

## Runtime

**Environment:**
- Node.js - Runtime for the Express/Vite server and build scripts. `README.md` recommends Node.js 18 or newer; no Node version pin is present in the inspected root files.
- Browser - React client is mounted from `src/main.tsx`.

**Package Manager:**
- npm - Scripts and dependency declarations are in `package.json`.
- Lockfile: present (`package-lock.json`, lockfile version 3).

## Frameworks

**Core:**
- React `^19.0.1` and React DOM `^19.0.1` - Client UI (`src/main.tsx`, `src/App.tsx`).
- Express `^4.21.2` - HTTP API and static serving (`server.ts`).
- Vite `^6.2.3` - Frontend dev/build pipeline and development middleware (`vite.config.ts`, `server.ts`).
- TypeScript `~5.8.2` - Type checking/transpilation configuration (`tsconfig.json`).

**Testing:**
- Not detected - `package.json` has no test script or test-runner dependency.

**Build/Dev:**
- `tsx` `^4.21.0` - Runs `server.ts` for `npm run dev`.
- esbuild `^0.25.0` - Bundles the production server to `dist/server.cjs` in `package.json`.
- `@vitejs/plugin-react` `^5.0.4` - Vite React integration (`vite.config.ts`).
- `@tailwindcss/vite` `^4.1.14` and Tailwind CSS `^4.1.14` - Tailwind Vite integration and utility styling (`vite.config.ts`, `src/index.css`).

## Key Dependencies

**Critical:**
- `@google/genai` `^2.4.0` - Gemini content generation and Google Search grounding (`server.ts`).
- `firebase` `^12.16.0` - Firebase app initialization and Google-provider authentication (`src/googleSync.ts`).
- `express` `^4.21.2` - Application API and asset server (`server.ts`).
- `react` / `react-dom` `^19.0.1` - Browser UI (`src/main.tsx`, `src/App.tsx`).
- `vite` `^6.2.3` - Frontend development and production build (`vite.config.ts`).

**Infrastructure:**
- `dotenv` `^17.2.3` - Loads default dotenv configuration at server startup (`server.ts`).
- `googleapis` `^173.0.0` - Declared dependency; no import/use was detected in application source. Google Sheets calls use `fetch` in `src/googleSync.ts`.
- `tailwindcss` `^4.1.14` - CSS utility framework (`src/index.css`, TSX components).
- `motion` `^12.23.24` - Animation dependency declared in `package.json`.
- `recharts` `^3.9.2` - Charting dependency declared in `package.json`.
- `lucide-react` `^0.546.0` - UI icons across `src/components/`.
- `date-fns` `^4.4.0`, `clsx` `^2.1.1`, `tailwind-merge` `^3.6.0`, and `uuid` `^14.0.1` - Declared utility dependencies; individual usage is not needed to establish the application stack.

## Configuration

**Environment:**
- `server.ts` calls `dotenv.config()` and reads `GEMINI_API_KEY`, `NVIDIA_API_KEY`, and `NODE_ENV`; the HTTP port is hard-coded to `3000`.
- `vite.config.ts` reads `DISABLE_HMR` to control HMR/file watching.
- `.env.example` exists but was not read. `README.md` instructs copying it to `.env.local`; the server's plain `dotenv.config()` does not explicitly select `.env.local`.
- `firebase-applet-config.json` exists and is imported by `src/googleSync.ts`; its contents were not inspected, so Firebase project identifiers/config values are unknown here.

**Build:**
- `package.json` defines `dev`, `build`, `start`, `clean`, and `lint` scripts. `build` runs `vite build` followed by esbuild for `server.ts`; `lint` runs `tsc --noEmit`.
- `vite.config.ts` enables React and Tailwind plugins and maps `@` to the repository root.
- `tsconfig.json` targets ES2022, uses bundler module resolution and `react-jsx`, and defines the `@/*` path mapping.
- `index.html` is the Vite entry document for `src/main.tsx`.

## Platform Requirements

**Development:**
- Node.js 18+ is recommended by `README.md`; npm or yarn is listed as supported, with `package-lock.json` indicating npm lockfile usage.
- `npm run dev` runs `tsx server.ts`; the Express app starts on port `3000` (`server.ts`).

**Production:**
- `npm run build` produces Vite assets and `dist/server.cjs`; `npm run start` runs that server bundle (`package.json`).
- `README.md` names Google AI Studio and Cloud Run as deployment targets, but no deployment manifest or platform-specific configuration was detected in the inspected root files.

---

*Stack analysis: 2026-10-02*
