# GT7 Tuning Helper

## Project Summary
GT7 Tuning Helper is a Gran Turismo 7 setup and race-engineering app for car setup authoring, comparison, lap tracking, community sharing, and AI-guided tuning recommendations.

## Product Intent
Provide a single-page tuning workspace that helps players diagnose handling issues, tune setups for specific tracks, compare changes, and save/share setups with a lightweight local-first persistence model.

## Current State
The repository already contains a Vite + React frontend, an Express server, a local JSON persistence flow for community setups, and AI-backed tuning generation from Gemini/NVIDIA/OpenAI providers.

## Key Constraints
- Frontend and backend remain in one repository with a Vite React single-page experience.
- App state is browser-local by default, with lightweight JSON persistence for community content.
- Domain conventions follow GT7 setup terms such as downforce, ride height, natural frequency, ARB, camber, toe, brake balance, and LSD sensitivity.
- AI tuning outputs must remain specific, track-aware, and actionable.

## Success Criteria
- Users can create, edit, compare, and save GT7 tuning setups.
- Users can diagnose setup issues from track symptoms and receive actionable tuning guidance.
- Community sharing and lap tracking workflows remain operational with existing persistence approach.
- The app stays buildable and type-safe under the configured TypeScript stack.

## Scope
This tracked workflow covers the GT7 tuning workflows, integration boundaries, and a phased implementation plan for delivery and verification.
