# Phase 2 Plan — Multi-provider race engineer

## Objective
Expose configured Gemini, OpenAI, and OpenRouter chat providers through a clear provider selector while preserving the NVIDIA diagnostic mode and Gemini-only live web search.

## Constraints
- Keep provider credentials on the server.
- Preserve Gemini as the Auto preference when configured; otherwise use OpenAI, then OpenRouter.
- Return explicit errors for an unavailable explicitly selected provider.
- Do not present standard OpenAI/OpenRouter chat as live web search.
- Keep existing setup and community API behavior unchanged.

## Tasks
1. Route chat requests according to a validated provider selection; reuse chat history once, preserve NVIDIA routing, and limit live search to Gemini grounding.
2. Display provider availability and add Auto/Gemini/OpenAI/OpenRouter selection with actionable errors.
3. Update setup and deployment documentation for provider keys and Node.js runtime requirements.
4. Run the TypeScript check and production build, then smoke-test provider status and missing-key behavior without making external AI calls.

## Acceptance Criteria
- `npm run lint` and `npm run build` pass.
- Provider status returns booleans/status labels only, never credential values.
- Explicitly selecting an unconfigured provider returns HTTP 400 with a provider-specific message.
- Search mode is only available with Gemini configured.
- Existing NVIDIA behavior remains separate and selectable.
