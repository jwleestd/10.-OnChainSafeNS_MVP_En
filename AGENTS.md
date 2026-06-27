# Agent Harness

## Product Decisions

- T1: Phase-0 first screen (`/`) stays as a product landing page with three primary CTAs: fraud lookup, Safe-Name, and demo transfer. Do not replace it with a tool-first lookup screen or a single all-in-one public console unless the Grill Ledger records a later superseding decision. Feature execution belongs in explicit routes such as `/fraud-lookup`, `/safe-name`, `/auth/verify`, and admin-only routes.
- T2: The landing page (`/`) is public. Phase-0 feature intro/execution pages such as `/fraud-lookup` and `/safe-name` require email authentication first; unauthenticated users should be sent to `/auth/verify?redirect={targetPath}` and returned to the target path after verification. Keep lookup/resolve APIs aligned with this email-auth requirement.
- T3: Build `/safe-name` as a sequential Wizard, not tabs or separate pages. The order is Step 1 Safe-Name registration, Step 2 resolve and fraud-status confirmation, Step 3 demo transfer simulation. Carry values forward between steps and allow user edits before submission.
- T4: On `/fraud-lookup`, drive reporting from lookup results. Show an "Report this address" action on the result card, move the user to the report area, and prefill address plus chain from the lookup. The user should only need to add incident details and evidence URL before submitting.
- T5: The Phase-0 admin approval dashboard must show quality context before approval: address, chain, incident description, evidence URL, reported time, same-address report count, existing FRAUD_ADDRESS state, and reporter false-report count. Do not require manual risk-level selection in Phase-0; use the documented automatic medium/high/critical escalation.
- T6: Use differentiated Phase-0 email failure handling. Verification-code email failure blocks the auth request with HTTP 502 and must not mark the user verified. Report receipt, admin result, and demo-transfer notification failures should be logged only; keep the core DB mutation successful and do not schedule automatic retries.
- T7: All Phase-0 `/api/v1/*` Route Handlers must use the central `lib/api-response.ts` helpers: `successResponse`, `errorResponse`, and `withErrorHandler`. Keep business logic inside route handlers, but do not hand-roll endpoint-specific response envelopes or repeated `NextResponse.json()` error bodies in each route.
- T8: Phase-0 completion requires Playwright E2E from the start. Automate the 19 REQ-P0-001~019 scenarios in Playwright and require the suite to be fully green before Phase-1a transition. Manual checklist runs are only supporting demo rehearsal and visual verification, not a substitute for Playwright.
- T9: Use the reduced Phase-0 seed scale as the source of truth: `FRAUD_ADDRESS 30 + SAFE_NAME 10 + USER 5 + OPERATOR 1`. Scalability acceptance uses `FRAUD_REPORT 100`. Do not implement or test against the older `FRAUD_ADDRESS 100 + SAFE_NAME 20 + FRAUD_REPORT 500` Phase-0 target unless a later Grill Ledger decision supersedes this.
- T10: Use the SRS cost gates with custom-domain cost included: Phase-0 monthly cost must be `<= $22`, Phase-1a `<= $86`, and Phase-1b-to-Phase-2 gate `<= $140`. Do not use the older `$21`, `~$71`, or `<= $100` figures as current phase-gate criteria.

## PlayBoard SoT

- The PlayBoard registry under `src/playboard/registry` is the current implementation/status SoT for PlayBoard surfaces.
- PRD, SRS, task, and Grill Ledger documents remain source references. When those references and PlayBoard status disagree, update the PlayBoard registry first, then update the source document if the underlying decision changed.
- Any requirement, route, state, policy, design, or work-item change that affects PlayBoard must update the relevant registry entry in the same PR/change set.
- PlayBoard pages must derive screen lists, counts, coverage, waves, and flow walkthroughs from registry data only. Do not hard-code parallel lists inside route pages.
- Status transitions stay fixed: screens move `planned -> partial -> implemented -> verified`, and work items move `not_started -> review_ready -> done`.
- `/playboard/**` is local-development visible by default. Preview/production exposure requires `PLAYBOARD_ENABLED=true`; otherwise it should return 404.
- Board health checks must stay green before merge: registry integrity, route smoke tests, and the existing Phase-0 Playwright suite.
