import type { ControlArea } from "../types";

export const controlAreas: ControlArea[] = [
  {
    area: "auth-and-access",
    title: "Auth and Access",
    goal: "Keep Phase-0 feature execution behind email verification while preserving a public landing page.",
    summary: "Public discovery remains open; feature execution routes and APIs enforce the email-auth boundary.",
    policies: [
      {
        statement: "Feature routes require email authentication.",
        detail: "Unauthenticated users are redirected to /auth/verify with a target redirect.",
      },
      {
        statement: "Admin surfaces use a separate operator login.",
        detail: "Operator approval is separated from public email verification.",
      },
    ],
    decisions: [
      { name: "T1", value: "The root route stays the product landing page." },
      { name: "T2", value: "Phase-0 feature intro and execution pages require email authentication." },
    ],
    standards: [
      { title: "Agent Harness Product Decisions", path: "AGENTS.md" },
      { title: "Auth gate E2E", path: "e2e/phase0-auth-gates.spec.ts" },
    ],
    workItems: ["FE-AUTH-001", "FE-AUTH-002", "CMD-AUTH-001", "CMD-AUTH-002"],
    gaps: [],
  },
  {
    area: "fraud-lookup-reporting",
    title: "Fraud Lookup Reporting",
    goal: "Make reporting flow from lookup context so users do not re-enter address and chain.",
    summary: "Lookup result cards drive reporting with prefilled address and chain, leaving incident details and evidence URL.",
    policies: [
      {
        statement: "Reports start from a lookup result.",
        detail: "The report action moves users into the report area and preloads lookup context.",
      },
    ],
    decisions: [{ name: "T4", value: "Reporting is driven from lookup results." }],
    standards: [
      { title: "Product requirements", path: "docs/0.PRD_v1_opus46_fn.md" },
      { title: "Phase-0 REQ E2E", path: "e2e/phase0-reqs.spec.ts" },
    ],
    workItems: ["FE-FRAUD-001", "FE-FRAUD-002", "QRY-FRAUD-001", "CMD-FRAUD-001"],
    gaps: [],
  },
  {
    area: "safe-name-transfer",
    title: "Safe-Name Transfer",
    goal: "Keep Safe-Name registration, resolve, fraud confirmation, and demo transfer in one sequential wizard.",
    summary: "The wizard carries values forward while allowing edits before submission.",
    policies: [
      {
        statement: "Safe-Name runs as a wizard, not tabs.",
        detail: "Step 1 registers, step 2 resolves and checks status, step 3 simulates transfer.",
      },
    ],
    decisions: [{ name: "T3", value: "Build /safe-name as a sequential wizard." }],
    standards: [
      { title: "System requirements", path: "docs/0.SRS_v1opus46_fn.md" },
      { title: "Safe-Name route", path: "src/app/safe-name/page.tsx" },
    ],
    workItems: ["FE-SN-001", "FE-SN-002", "CMD-SN-001", "QRY-SN-001", "CMD-TX-001"],
    gaps: [],
  },
  {
    area: "admin-approval-quality",
    title: "Admin Approval Quality",
    goal: "Give operators enough context before approval without manual Phase-0 risk selection.",
    summary: "Approval includes address, chain, evidence, duplicate counts, existing state, and reporter history.",
    policies: [
      {
        statement: "Approval must show quality context.",
        detail: "Operators see incident description, evidence URL, report counts, state, and false-report count.",
      },
      {
        statement: "Risk escalation is automatic in Phase-0.",
        detail: "Manual risk-level selection is not part of Phase-0 approval.",
      },
    ],
    decisions: [{ name: "T5", value: "Admin approval dashboard must show quality context before approval." }],
    standards: [
      { title: "Admin approval page", path: "src/app/admin/approval/page.tsx" },
      { title: "Admin approval API", path: "src/app/api/v1/admin/approve/route.ts" },
    ],
    workItems: ["FE-ADMIN-001", "QRY-ADMIN-001", "CMD-ADMIN-001"],
    gaps: [],
  },
  {
    area: "email-failure-policy",
    title: "Email Failure Policy",
    goal: "Separate blocking verification-code failures from non-blocking notification failures.",
    summary: "Verification-code email failures block auth; receipt, admin result, and transfer notifications log only.",
    policies: [
      {
        statement: "Verification-code email failure blocks the request.",
        detail: "The auth request returns HTTP 502 and the user is not marked verified.",
      },
      {
        statement: "Notification email failures are log-only.",
        detail: "Core DB mutations remain successful and no automatic retries are scheduled.",
      },
    ],
    decisions: [{ name: "T6", value: "Use differentiated Phase-0 email failure handling." }],
    standards: [
      { title: "Email helper", path: "src/lib/email.ts" },
      { title: "Verify email route", path: "src/app/api/v1/auth/verify-email/route.ts" },
    ],
    workItems: ["CMD-AUTH-001", "CMD-FRAUD-001", "CMD-TX-001"],
    gaps: [],
  },
  {
    area: "api-response-contract",
    title: "API Response Contract",
    goal: "Keep all Phase-0 API responses on the central helper envelope.",
    summary: "Route handlers use successResponse, errorResponse, and withErrorHandler from lib/api-response.",
    policies: [
      {
        statement: "Do not hand-roll response envelopes.",
        detail: "Business logic can stay in route handlers, but response shape comes from the shared helpers.",
      },
    ],
    decisions: [{ name: "T7", value: "All Phase-0 /api/v1/* handlers use central API response helpers." }],
    standards: [
      { title: "API response helpers", path: "src/lib/api-response.ts" },
      { title: "API routes", path: "src/app/api/v1" },
    ],
    workItems: ["API-001", "CMD-AUTH-002", "QRY-FRAUD-001", "CMD-FRAUD-001", "CMD-SN-001", "QRY-SN-001", "CMD-ADMIN-001"],
    gaps: [],
  },
  {
    area: "e2e-phase-gate",
    title: "E2E Phase Gate",
    goal: "Make Playwright the Phase-0 completion gate from the start.",
    summary: "REQ-P0-001 through REQ-P0-019 must be automated and green before Phase-1a transition.",
    policies: [
      {
        statement: "Manual checklists are supporting evidence only.",
        detail: "They do not replace the Playwright gate.",
      },
    ],
    decisions: [{ name: "T8", value: "Phase-0 completion requires Playwright E2E from the start." }],
    standards: [
      { title: "Phase-0 REQ E2E", path: "e2e/phase0-reqs.spec.ts" },
      { title: "Playwright config", path: "playwright.config.ts" },
    ],
    workItems: ["TEST-022"],
    gaps: [],
  },
  {
    area: "seed-scale-cost",
    title: "Seed Scale and Cost",
    goal: "Keep Phase-0 scale and cost gates aligned with the latest SRS decisions.",
    summary: "Seed data and scalability checks use the reduced scale; cost gates include custom-domain cost.",
    policies: [
      {
        statement: "Use reduced Phase-0 seed scale.",
        detail: "FRAUD_ADDRESS 30, SAFE_NAME 10, USER 5, OPERATOR 1, and FRAUD_REPORT 100 for scalability acceptance.",
      },
      {
        statement: "Use current cost gates.",
        detail: "Phase-0 <= $22, Phase-1a <= $86, and Phase-1b-to-Phase-2 <= $140.",
      },
    ],
    decisions: [
      { name: "T9", value: "Reduced Phase-0 seed scale is the source of truth." },
      { name: "T10", value: "SRS cost gates include custom-domain cost." },
    ],
    standards: [
      { title: "Seed script", path: "prisma/seed.ts" },
      { title: "System requirements", path: "docs/0.SRS_v1opus46_fn.md" },
    ],
    workItems: ["SEED-003", "NFR-004"],
    gaps: [],
  },
];

