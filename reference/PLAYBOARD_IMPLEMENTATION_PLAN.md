# PlayBoard Implementation Plan

Status: review draft only  
Date: 2026-06-27  
Scope: apply the `$playboard` work structure to this project after human review  
Rule: do not implement this plan until the user reviews and approves changes

---

## 1. Purpose

This plan describes how to add a PlayBoard to the current OnChain SafeNS MVP repository as a registry-derived single source of truth for planning, issues, implementation status, schedule, technical policy, and design reality.

The immediate deliverable is this plan file only. The actual PlayBoard implementation should begin only after review feedback is incorporated.

The PlayBoard must not replace the product landing page. Per `AGENTS.md` decision T1, `/` remains the public product landing page with the three primary CTAs. Therefore the PlayBoard route family will be mounted under `/playboard`.

---

## 2. Source Material Confirmed

Primary PlayBoard references:

- `reference/PLAYBOARD_FINAL_SPEC_DEFINITION.md`
- `reference/PLAYBOARD_BENEFIT_N_OPERATION_RULE.md`
- `.agents/skills/playboard/SKILL.md`

Project source-of-truth inputs:

- `AGENTS.md`: Product Decisions T1-T10
- `docs/grill/GRILL_LEDGER.md`: resolved decision ledger
- `docs/0.PRD_v1_opus46_fn.md`: product requirements
- `docs/0.SRS_v1opus46_fn.md`: system requirements and Phase-0 gates
- `tasks/0.TASKS_LIST_v0_2_opus47_fn.md`: work-item catalog
- `tasks/0.DEPENDENCY_GRAPH_Phase0_opus47_fn(MVP).md`: dependency graph source
- `tasks/1.GANTT_CHART_v0_1_opus47_fn.md`: phase and wave schedule source
- `e2e/phase0-reqs.spec.ts`: REQ-P0-001~019 Playwright gate
- `e2e/phase0-auth-gates.spec.ts`: public/auth route gates
- `src/app/**`: current implemented route surfaces

Current implementation shape observed:

- Next.js App Router, TypeScript, Tailwind, shadcn-style components.
- Existing public routes: `/`, `/fraud-lookup`, `/safe-name`, `/auth/verify`, `/auth/admin-login`.
- Existing admin route: `/admin/approval`.
- Existing API routes under `/api/v1/*`.
- Existing E2E coverage for Phase-0 REQ-P0-001~019.
- Current task corpus already contains a rich Phase-0 DAG and schedule; PlayBoard should normalize and render it, not invent a parallel plan source.

---

## 3. Core Design Decision

Use a route-scoped PlayBoard:

| General PlayBoard route | Project route |
|---|---|
| `/` | `/playboard` |
| `/plan` | `/playboard/plan` |
| `/schedule` | `/playboard/schedule` |
| `/implement-summary` | `/playboard/implement-summary` |
| `/control-area/:area` | `/playboard/control-area/:area` |
| `/spec/:plane/:slug` | `/playboard/spec/:plane/:slug` |
| `/screens/:plane/:slug` | `/playboard/screens/:plane/:slug` |
| `/scenario/:flow` | `/playboard/scenario/:flow` |
| `/ux-flow/:flow` | `/playboard/ux-flow/:flow` |
| `/mobile-flow/:flow` | `/playboard/mobile-flow/:flow` |

Exposure gate:

- Local development: enabled by default.
- Preview/production: enabled only when `PLAYBOARD_ENABLED=true`.
- Otherwise `/playboard/**` should return 404.
- Do not add PlayBoard to the public product navbar unless explicitly approved.

---

## 4. Registry Model

Implement PlayBoard as six registries plus derived selectors. Facts live only in registries; all visible pages are derived from them.

Planned registry files:

```text
src/playboard/registry/statuses.ts
src/playboard/registry/planes.ts
src/playboard/registry/screens.ts
src/playboard/registry/work-items.ts
src/playboard/registry/control-areas.ts
src/playboard/registry/flows.ts
src/playboard/derive.ts
src/playboard/integrity.ts
src/playboard/types.ts
```

### 4.1 Status Registry

Screen status order:

1. `planned`
2. `partial`
3. `implemented`
4. `verified`

Work item status order:

1. `not_started`
2. `review_ready`
3. `done`

Mapping note:

- "implemented" means implementation is merged or present.
- "verified" means deployment or E2E verification is complete.
- This follows the PlayBoard status-transition rule and the project T8 E2E gate.

### 4.2 Plane Registry

Initial planes:

| Plane | Purpose |
|---|---|
| `public-user` | Public and email-verified customer experience |
| `operator` | Admin/operator approval and review experience |
| `system-state` | API, data, test, cost, and operational gate surfaces |

### 4.3 Screen Registry

Initial screen set should cover current Phase-0 surfaces and system contracts:

| Plane | Slug | Route / location | Notes |
|---|---|---|---|
| `public-user` | `landing` | `/` | Must remain product landing per T1 |
| `public-user` | `auth-verify` | `/auth/verify` | Email verification and redirect flow |
| `public-user` | `fraud-lookup` | `/fraud-lookup` | Lookup plus lookup-driven report transition per T4 |
| `public-user` | `safe-name-wizard` | `/safe-name` | Sequential registration -> resolve -> demo transfer per T3 |
| `operator` | `admin-login` | `/auth/admin-login` | Admin auth entry |
| `operator` | `approval-dashboard` | `/admin/approval` | Approval quality context per T5 |
| `system-state` | `api-contract` | `/api/v1/*` | Central API response helpers per T7 |
| `system-state` | `email-policy` | `src/lib/email.ts` + API call sites | Failure policy per T6 |
| `system-state` | `seed-scale` | `prisma/seed.ts` | Seed and scalability rule per T9 |
| `system-state` | `phase0-e2e-gate` | `e2e/phase0-reqs.spec.ts` | REQ-P0-001~019 gate per T8 |

Each screen entry must include:

- `plane`, `slug`, `title`, `route`
- `designSpecType`
- `flowNote`
- `status`, `statusNote`
- `workItems[]`
- `requirementRefs[]`
- `implLocation`
- `engineering.authGate`
- `engineering.clientActions[]`
- `engineering.serverActions[]`
- `engineering.dataReads[]`
- `engineering.dataWrites[]`
- `engineering.telemetryEvents[]`
- `engineering.exceptionStates[]`
- `engineering.controlAreaNotes`

### 4.4 Work Item Registry

Initial source:

- Import the project task IDs from `tasks/0.TASKS_LIST_v0_2_opus47_fn.md`.
- Preserve existing IDs like `API-001`, `FE-FRAUD-001`, `TEST-022`, etc.
- Preserve dependency edges from the task list and dependency graph.

Implementation approach:

- First pass: manually seed the high-signal Phase-0 work items plus all PlayBoard work items.
- Second pass: add a parser or generator only if manual maintenance becomes expensive.
- Do not silently duplicate task facts already present in docs; each registry item links back to the source doc.

### 4.5 Control Area Registry

Initial control areas should map directly to settled project decisions and Phase-0 quality gates:

| Area | Source decisions / requirements |
|---|---|
| `auth-and-access` | T2, admin auth, middleware, API auth behavior |
| `fraud-lookup-reporting` | T4, REQ-P0-001~005 |
| `safe-name-transfer` | T3, REQ-P0-006~010, REQ-P0-016~019 |
| `admin-approval-quality` | T5, REQ-P0-011~013 |
| `email-failure-policy` | T6 |
| `api-response-contract` | T7 |
| `e2e-phase-gate` | T8, TEST-022 |
| `seed-scale-cost` | T9, T10, REQ-P0-NF-005, REQ-P0-NF-008, REQ-P0-NF-009 |

Each area includes:

- `area`, `goal`, `summary`
- `policies[]`
- `decisions[]`
- `standards[]`
- `workItems[]`
- `gaps[]`

### 4.6 Flow Registry

Initial flows:

| Flow | Screens |
|---|---|
| `auth-gated-feature-entry` | `landing` -> `auth-verify` -> target feature |
| `fraud-lookup-to-report` | `fraud-lookup` lookup result -> report area |
| `safe-name-demo-transfer` | `safe-name-wizard` step 1 -> step 2 -> step 3 |
| `operator-report-approval` | `admin-login` -> `approval-dashboard` -> API mutation |
| `phase0-verification-gate` | `seed-scale` -> `api-contract` -> `phase0-e2e-gate` |

---

## 5. Derived Selectors

Implement derived-only helpers in `src/playboard/derive.ts`.

Required selectors:

- `getScreensByStatus()`
- `getWorkItemsByStatus()`
- `getScreensByPlane()`
- `getScreen(plane, slug)`
- `getControlArea(area)`
- `getFlow(flow)`
- `getControlAreaCoverage()`
- `getScreenCoverageMatrix()`
- `getWorkItemGraph()`
- `getWaves(day1Anchor)`
- `getBoardSummary()`

Important rules:

- No page may hard-code a screen list outside the registries.
- Coverage matrix cells are determined only by `screen.engineering.controlAreaNotes[area]`.
- Wave schedule is derived from work-item dependencies and status.
- Unknown `plane`, `slug`, `flow`, or `area` returns 404.

---

## 6. Integrity Checks

Add registry integrity checks before building the full UI.

Planned file:

```text
src/playboard/integrity.ts
```

Planned script/test:

```text
e2e/playboard-integrity.spec.ts
```

or a Node/TypeScript script if lighter:

```text
scripts/check-playboard-integrity.ts
```

Required checks:

- Every `screen.workItems[]` points to an existing work item.
- Every `workItem.screens[]` points to an existing `plane/slug`.
- Work-item dependency graph is acyclic.
- Every `exceptionStates[]` entry points to an existing system-state screen.
- `implemented` and `verified` screens have `implLocation`.
- Every flow screen exists.
- Every control-area note references a defined control area.
- Every `standards[].path` exists.
- Every route parameter lookup returns either a registry object or a 404.

Acceptance:

- PlayBoard UI work should not start until integrity checks are green.

---

## 7. UI Architecture

Mount under:

```text
src/app/playboard
```

Planned route files:

```text
src/app/playboard/layout.tsx
src/app/playboard/page.tsx
src/app/playboard/plan/page.tsx
src/app/playboard/schedule/page.tsx
src/app/playboard/implement-summary/page.tsx
src/app/playboard/control-area/[area]/page.tsx
src/app/playboard/spec/[plane]/[slug]/page.tsx
src/app/playboard/screens/[plane]/[slug]/page.tsx
src/app/playboard/scenario/[flow]/page.tsx
src/app/playboard/ux-flow/[flow]/page.tsx
src/app/playboard/mobile-flow/[flow]/page.tsx
```

Planned components:

```text
src/components/playboard/playboard-nav.tsx
src/components/playboard/status-badge.tsx
src/components/playboard/screen-card.tsx
src/components/playboard/screen-board.tsx
src/components/playboard/sortable-matrix-table.tsx
src/components/playboard/diagram-modal.tsx
src/components/playboard/mobile-carousel.tsx
```

Client islands should stay limited to the five specified by the reference:

- `PlayBoardNav`
- `ScreenBoard`
- `SortableMatrixTable`
- `DiagramModal`
- `MobileCarousel`

Most other rendering should remain server/static where possible.

Design constraints:

- Reuse the existing Tailwind/shadcn conventions.
- Keep the board quiet, information-dense, and operational.
- Do not create a marketing hero.
- Do not place cards inside cards.
- Use stable dimensions for boards, tables, badges, thumbnails, and iframe mockups.
- Do not let PlayBoard visual choices override the public product theme.

---

## 8. Page-by-Page Implementation Plan

### 8.1 `/playboard`

Purpose:

- Board index and high-level status.

Content:

- Board purpose summary.
- Screen status counts.
- Work-item status counts.
- Current next waves.
- Control-area coverage cards.
- Flow entry cards.
- ScreenBoard with tile/kanban toggle.

### 8.2 `/playboard/plan`

Purpose:

- Work-item DAG and phase plan.

Content:

- DAG diagram modal.
- Phase sections derived from work items.
- Dependency and blocked-by details.
- Links from work items to related screens.

### 8.3 `/playboard/schedule`

Purpose:

- Derived wave schedule.

Content:

- Gantt diagram modal.
- Wave cards with parallelizable work items.
- Blocked predecessor notes.
- Day1 anchor explanation.

### 8.4 `/playboard/implement-summary`

Purpose:

- Screen x control-area coverage matrix.

Content:

- Sortable table.
- Status summary.
- Coverage totals.
- Links to screen specs and control-area pages.

### 8.5 `/playboard/control-area/:area`

Purpose:

- Technical/operational policy hub.

Content:

- Goal and summary.
- Policies and decisions.
- Standards and source documents.
- Related screens and work items.
- Gaps.

### 8.6 `/playboard/spec/:plane/:slug`

Purpose:

- Full technical spec for one screen/surface.

Content:

- Screen contract.
- Current implementation location.
- Requirement refs.
- Engineering fields.
- Control-area notes.
- Linked work items.
- Link to screen mock/live preview.

### 8.7 `/playboard/screens/:plane/:slug`

Purpose:

- Living screen sample or mock.

Content strategy:

- For implemented UI routes, embed or link to the current route preview.
- For system-state surfaces, render a structured mock/spec panel.
- Keep mock responsive so mobile-flow can embed it.

### 8.8 `/playboard/scenario/:flow`

Purpose:

- Sequential walkthrough for a flow.

Content:

- Ordered screen cards.
- Client/server action summary.
- Data read/write counts.
- Control-area links.
- Spec links.

### 8.9 `/playboard/ux-flow/:flow`

Purpose:

- Desktop reading-mode flow overview.

Content:

- Thumbnail strip.
- Flow screen cards.
- Links to screen mock and spec.

### 8.10 `/playboard/mobile-flow/:flow`

Purpose:

- Mobile responsive flow overview.

Content:

- Horizontal carousel of iframe frames.
- Each frame loads `/playboard/screens/:plane/:slug`.
- Include overlay scroll indicator only if needed.

---

## 9. Governance Updates

After implementation is approved, update `AGENTS.md` with a PlayBoard SoT section.

Required governance statements:

- PlayBoard registry is the current implementation/status SoT.
- PRD/SRS/tasks remain source references, but conflicts are resolved by updating PlayBoard registry first, then source docs when needed.
- Any requirement, route, state, policy, design, or work-item change must update the registry in the same PR.
- Status changes must follow the fixed transition convention.
- Production exposure remains gated.
- Board health checks must stay green before merge.

Do not update governance during this planning-only turn unless the user explicitly approves implementation.

---

## 10. Implementation Waves

### Wave 0: Review and Reconcile

Goal:

- Incorporate user review feedback into this plan before code changes.

Outputs:

- Updated `PLAYBOARD_IMPLEMENTATION_PLAN.md`.
- Optional approval checklist.

No application code changes.

### Wave 1: Registry Scaffold

Goal:

- Create the six registries and type definitions.

Outputs:

- `src/playboard/types.ts`
- `src/playboard/registry/*.ts`
- Initial screen, work-item, control-area, flow, plane, and status data.

Validation:

- TypeScript compile.
- Manual registry spot-check against `AGENTS.md`, SRS, task list, and E2E files.

### Wave 2: Derived Selectors and Integrity

Goal:

- Add derived selectors and integrity checks before visible UI.

Outputs:

- `src/playboard/derive.ts`
- `src/playboard/integrity.ts`
- Integrity test/script.

Validation:

- Integrity check green.
- DAG acyclic.
- No orphan screen/work-item refs.

### Wave 3: Exposure Gate and Route Shell

Goal:

- Add `/playboard` route family with production-safe exposure.

Outputs:

- `src/app/playboard/layout.tsx`
- `src/app/playboard/**/page.tsx` placeholders wired to registry lookup.
- 404 behavior for unknown params and disabled exposure.

Validation:

- Local routes render.
- Production-disabled path returns 404.
- Product `/` remains unchanged.

### Wave 4: Core Board Views

Goal:

- Build the operational board pages.

Outputs:

- `/playboard`
- `/playboard/plan`
- `/playboard/schedule`
- `/playboard/implement-summary`
- `/playboard/control-area/:area`
- `/playboard/spec/:plane/:slug`

Validation:

- Sorting works.
- Matrix coverage is derived from registry notes.
- Diagram modal opens/closes without nested-button hydration errors.

### Wave 5: Flow and Screen Surfaces

Goal:

- Add scenario, UX flow, mobile flow, and screen sample routes.

Outputs:

- `/playboard/scenario/:flow`
- `/playboard/ux-flow/:flow`
- `/playboard/mobile-flow/:flow`
- `/playboard/screens/:plane/:slug`

Validation:

- Unknown flow/screen returns 404.
- Mobile iframe layout renders without overflow/overlap.
- Screen samples are responsive.

### Wave 6: Capture Pipeline

Goal:

- Add a hybrid screenshot/capture pipeline only after core surfaces are useful.

Outputs:

- Capture script, likely Playwright-based.
- Capture output path convention such as `public/playboard/captures/:plane/:slug.png`.

Validation:

- Captures generated for implemented screens.
- Missing captures show placeholders, not broken images.

### Wave 7: Governance and Tests

Goal:

- Lock PlayBoard into the working harness.

Outputs:

- `AGENTS.md` PlayBoard SoT section.
- PlayBoard route smoke tests.
- Board-health check command.

Validation:

- `npm run build`
- `npm run test:e2e`
- PlayBoard integrity green.

---

## 11. Verification Strategy

Minimum checks after implementation:

- TypeScript build passes.
- Existing Phase-0 E2E remains green.
- PlayBoard integrity check passes.
- PlayBoard route smoke tests pass.
- `/` still renders as the public product landing page.
- `/fraud-lookup` and `/safe-name` auth redirects still follow T2.
- `/playboard/**` is hidden in production unless enabled.
- Unknown PlayBoard route params return 404.

Recommended new tests:

```text
e2e/playboard-integrity.spec.ts
e2e/playboard-routes.spec.ts
```

Possible test cases:

- Local `/playboard` index renders status and control-area summaries.
- `/playboard/spec/public-user/fraud-lookup` renders the Fraud Lookup spec.
- `/playboard/control-area/api-response-contract` renders policies and linked screens.
- `/playboard/implement-summary` matrix rows link to specs.
- Unknown `plane/slug`, `area`, and `flow` return 404.

---

## 12. Review Questions

Please review these before implementation:

1. Should PlayBoard be mounted at `/playboard` as proposed, or under another prefix such as `/internal/playboard`?
2. Should the first implementation cover only Phase-0, or seed Phase-1a/1b/2/3 work items as planned/future items too?
3. Should PlayBoard include API/system-state surfaces as screens, or should screens be limited to visible UI routes?
4. Should capture images be required in the first implementation, or deferred until after the core registry-derived board works?
5. Should `AGENTS.md` governance be updated in the same implementation PR, or reviewed separately after the board is visible?

---

## 13. Completion Criteria for the Future Implementation

Implementation can be considered complete when:

- The six registries exist and are the only source for PlayBoard facts.
- All ten PlayBoard routes exist under the approved prefix.
- Route params are validated and unknown params return 404.
- The sticky PlayBoard nav and breadcrumb are shared across all surfaces.
- The index, plan, schedule, implementation matrix, control-area detail, screen spec, scenario, UX flow, mobile flow, and screen sample surfaces render from registries.
- Integrity checks are automated and green.
- Existing Phase-0 E2E remains green.
- Production exposure is gated.
- `AGENTS.md` documents same-PR registry updates and PlayBoard SoT rules.

---

## 14. Explicit Non-Goals for the First Implementation

- Do not replace `/`.
- Do not change Phase-0 product behavior.
- Do not rewrite PRD/SRS/tasks wholesale.
- Do not add a new issue tracker.
- Do not build a public marketing page for PlayBoard.
- Do not require a screenshot pipeline before the core registry-derived board is useful.
- Do not hand-code lists in pages that should be derived from registries.

