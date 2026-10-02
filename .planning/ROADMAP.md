# Roadmap

## Phase 1 — Baseline app and tuning workflow stabilization

### Goal
Establish the deliverable GT7 tuning workflow as a tracked project and validate that the current app architecture supports setup management, AI guidance, community sharing, and lap tracking.

### Deliverables
- Confirm project goals, requirements, and technical constraints.
- Review app architecture and identify core flows.
- Verify the current setup workflow, AI tuning endpoints, and data persistence model remain coherent.
- Create a plan for future bugfixes, quality improvements, and feature work.

### Verification
- Type-check passes via `npm run lint`.
- App builds successfully via `npm run build`.
- Core flows for setup editing, comparison, and community browsing remain operational in the application.

### Checklist
- [x] Project initialized
- [x] Requirements documented
- [x] Architecture reviewed
- [x] Risks and constraints captured
- [x] Execution plan for next implementation step

## Phase 2 — Multi-provider race engineer

### Goal
Let users choose among configured chat providers without misrepresenting provider capabilities, while preserving Gemini search grounding and NVIDIA-specific diagnostic flows.

### Deliverables
- Direct OpenAI chat support using a server-side API key.
- Explicit Auto/Gemini/OpenAI/OpenRouter provider selection and configured-provider indicators.
- Provider-aware errors and a server provider-status endpoint.
- Documentation for provider secrets, runtime requirements, and search capability boundaries.

### Verification
- `npm run lint` passes.
- `npm run build` passes.
- `/api/providers` accurately reports configured providers without exposing credentials.
- Chat requests use the selected provider; missing provider keys return an explicit client error.
- Search mode only operates through Gemini Google Search grounding.

### Checklist
- [x] Add server-side OpenAI integration
- [x] Add explicit provider selection and availability UI
- [x] Preserve OpenRouter routing as a selectable provider
- [x] Keep web search grounded to Gemini only
- [x] Verify runtime API contracts and production build
